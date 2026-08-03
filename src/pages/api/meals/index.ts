import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db/drizzle";
import { chefs, mealTags, meals, tags, users } from "@/db/schema";
import { authOptions } from "../auth/[...nextauth]";

type MealCreateRequest = {
  name?: string;
  description?: string;
  price?: string | number;
  photo?: string;
  tags?: string[];
};

type MealCreateResponse = {
  message: string;
  meal: {
    id: string;
    userId: string;
    name: string;
    description: string | null;
    price: string;
    photo: string | null;
    status: string;
    createdAt: Date;
    updatedAt: Date;
  };
  tags: Array<{
    id: string;
    name: string;
  }>;
};

type MealRow = {
  id: string;
  name: string;
  description: string | null;
  price: string;
  photo: string | null;
  createdAt: Date;
  chefName: string;
};

type MealGetResponse = {
  meals: MealRow[];
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
  res: NextApiResponse<MealCreateResponse | MealGetResponse | ErrorResponse>,
) {
  // 1. Validate Method (Allow POST and GET)
  if (req.method !== "POST" && req.method !== "GET") {
    res.setHeader("Allow", ["POST", "GET"]);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  // 2. Handle GET Request Route
  if (req.method === "GET") {
    try {
      const records = await db
        .select({
          id: meals.id,
          name: meals.name,
          description: meals.description,
          price: meals.price,
          photo: meals.photo,
          createdAt: meals.createdAt,
          chefName: users.name,
        })
        .from(meals)
        .innerJoin(users, eq(users.id, meals.userId))
        .where(eq(meals.status, "approved"))
        .orderBy(desc(meals.createdAt));

      return res.status(200).json({ meals: records });
    } catch (error) {
      console.error("Failed to fetch meals marketplace feed:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }

  // 3. Keep Existing POST Request Route Intact
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user?.id) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const payload = (req.body ?? {}) as MealCreateRequest;
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

  if (currentUser.role !== "chef") {
    return res.status(403).json({ message: "Only approved chefs can create meals." });
  }

  const [chefProfile] = await db
    .select({ status: chefs.status })
    .from(chefs)
    .where(eq(chefs.userId, currentUser.id))
    .limit(1);

  if (!chefProfile || chefProfile.status !== "approved") {
    return res.status(403).json({ message: "Only approved chefs can create meals." });
  }

  const [createdMeal] = await db
    .insert(meals)
    .values({
      userId: currentUser.id,
      name,
      description,
      price: priceValue.toFixed(2),
      photo,
      status: "pending",
    })
    .returning({
      id: meals.id,
      userId: meals.userId,
      name: meals.name,
      description: meals.description,
      price: meals.price,
      photo: meals.photo,
      status: meals.status,
      createdAt: meals.createdAt,
      updatedAt: meals.updatedAt,
    });

  if (!createdMeal) {
    return res.status(500).json({ message: "Failed to create meal." });
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
    return res.status(500).json({ message: "Failed to create meal." });
  }

  await db.insert(mealTags).values(
    resolvedTags.map((tag) => ({
      mealId: createdMeal.id,
      tagId: tag.id,
    })),
  );

  const result = {
    meal: createdMeal,
    tags: normalizedTags
      .map((tagName) => resolvedTags.find((tag) => tag.name === tagName))
      .filter((tag): tag is { id: string; name: string } => Boolean(tag)),
  };

  return res.status(201).json({
    message: "Meal created successfully.",
    meal: result.meal,
    tags: result.tags,
  });
}
