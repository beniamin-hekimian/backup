import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { and, eq, inArray, isNull } from "drizzle-orm";
import { db } from "@/db/drizzle";
import { chefs, mealTags, meals, tags, users, type MealStatus } from "@/db/schema";
import { authOptions } from "../auth/[...nextauth]";

type MealDetailResponse = {
  meal: {
    id: string;
    userId: string;
    name: string;
    description: string | null;
    price: string;
    photo: string | null;
    status: MealStatus;
    verifiedAt: Date | null;
    deletedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  };
  tags: Array<{
    id: string;
    name: string;
  }>;
};

type MealUpdateRequest = {
  name?: string;
  description?: string;
  price?: string | number;
  photo?: string;
  tags?: string[];
};

type MealUpdateResponse = {
  message: string;
  meal: MealDetailResponse["meal"];
  tags: MealDetailResponse["tags"];
};

type ErrorResponse = {
  message: string;
};

function normalizeOptionalString(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function normalizeTags(value: unknown) {
  if (!Array.isArray(value)) {
    return [] as string[];
  }

  const normalized = value
    .map((item) => (typeof item === "string" ? item.trim().toLowerCase() : ""))
    .filter((item) => item.length > 0);

  return Array.from(new Set(normalized));
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<MealDetailResponse | MealUpdateResponse | ErrorResponse>,
) {
  const mealId = typeof req.query.id === "string" ? req.query.id : "";

  if (!mealId) {
    return res.status(400).json({ message: "Meal ID is required." });
  }

  if (req.method === "GET") {
    const session = await getServerSession(req, res, authOptions);

    if (!session?.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const [currentUser] = await db
      .select({ id: users.id, role: users.role })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (!currentUser) {
      return res.status(404).json({ message: "Profile not found." });
    }

    const [mealRecord] = await db.select().from(meals).where(eq(meals.id, mealId)).limit(1);

    if (!mealRecord) {
      return res.status(404).json({ message: "Meal not found." });
    }

    if (currentUser.role !== "admin" && mealRecord.userId !== currentUser.id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const mealTagsRecords = await db
      .select({ id: tags.id, name: tags.name })
      .from(mealTags)
      .innerJoin(tags, eq(tags.id, mealTags.tagId))
      .where(eq(mealTags.mealId, mealId));

    return res.status(200).json({
      meal: mealRecord,
      tags: mealTagsRecords,
    });
  }

  if (req.method !== "PATCH") {
    res.setHeader("Allow", ["GET", "PATCH"]);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  const session = await getServerSession(req, res, authOptions);

  if (!session?.user?.id) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const payload = (req.body ?? {}) as MealUpdateRequest;
  const name = normalizeOptionalString(payload.name);
  const description = normalizeOptionalString(payload.description);
  const photo = normalizeOptionalString(payload.photo);
  const normalizedTags = normalizeTags(payload.tags);
  const priceValue =
    typeof payload.price === "number"
      ? payload.price
      : typeof payload.price === "string"
        ? Number(payload.price)
        : Number.NaN;

  if (!name) {
    return res.status(400).json({ message: "Meal name is required." });
  }

  if (!Number.isFinite(priceValue) || priceValue <= 0) {
    return res.status(400).json({ message: "A valid meal price is required." });
  }

  if (normalizedTags.length < 3 || normalizedTags.length > 5) {
    return res.status(400).json({ message: "Meals must include between 3 and 5 tags." });
  }

  const [currentUser] = await db
    .select({ id: users.id, role: users.role })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  if (!currentUser) {
    return res.status(404).json({ message: "Profile not found." });
  }

  const [chefProfile] = await db
    .select({ status: chefs.status })
    .from(chefs)
    .where(eq(chefs.userId, currentUser.id))
    .limit(1);

  if (!chefProfile || chefProfile.status !== "approved") {
    return res.status(403).json({ message: "Only approved chefs can edit meals." });
  }

  const [mealRecord] = await db.select().from(meals).where(eq(meals.id, mealId)).limit(1);

  if (!mealRecord) {
    return res.status(404).json({ message: "Meal not found." });
  }

  if (mealRecord.userId !== currentUser.id) {
    return res.status(403).json({ message: "You can only edit your own meals." });
  }

  const [updatedMeal] = await db
    .update(meals)
    .set({
      name,
      description,
      price: priceValue.toFixed(2),
      photo,
      status: "pending",
      verifiedAt: null,
    })
    .where(and(eq(meals.id, mealId), eq(meals.userId, currentUser.id), isNull(meals.deletedAt)))
    .returning({
      id: meals.id,
      userId: meals.userId,
      name: meals.name,
      description: meals.description,
      price: meals.price,
      photo: meals.photo,
      status: meals.status,
      verifiedAt: meals.verifiedAt,
      deletedAt: meals.deletedAt,
      createdAt: meals.createdAt,
      updatedAt: meals.updatedAt,
    });

  if (!updatedMeal) {
    return res.status(404).json({ message: "Meal not found." });
  }

  const existingTags = await db
    .select({ id: tags.id, name: tags.name })
    .from(tags)
    .where(inArray(tags.name, normalizedTags));

  const existingTagNames = new Set(existingTags.map((tag) => tag.name));
  const missingTags = normalizedTags.filter((tag) => !existingTagNames.has(tag));

  if (missingTags.length > 0) {
    await db
      .insert(tags)
      .values(missingTags.map((name) => ({ name })))
      .onConflictDoNothing();
  }

  const resolvedTags = await db
    .select({ id: tags.id, name: tags.name })
    .from(tags)
    .where(inArray(tags.name, normalizedTags));

  if (resolvedTags.length !== normalizedTags.length) {
    return res.status(500).json({ message: "Failed to update meal tags." });
  }

  await db.delete(mealTags).where(eq(mealTags.mealId, mealId));

  await db.insert(mealTags).values(
    resolvedTags.map((tag) => ({
      mealId,
      tagId: tag.id,
    })),
  );

  return res.status(200).json({
    message: "Meal updated successfully.",
    meal: updatedMeal,
    tags: resolvedTags,
  });
}
