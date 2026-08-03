import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { eq } from "drizzle-orm";
import { db } from "@/db/drizzle";
import { meals, users, type MealStatus } from "@/db/schema";
import { authOptions } from "../../auth/[...nextauth]";

type MealReviewResponse = {
  message: string;
  meal: {
    id: string;
    userId: string;
    status: MealStatus;
    verifiedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  };
};

type ErrorResponse = {
  message: string;
};

type ReviewRequest = {
  status?: MealStatus;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<MealReviewResponse | ErrorResponse>) {
  if (req.method !== "PATCH") {
    res.setHeader("Allow", ["PATCH"]);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  const session = await getServerSession(req, res, authOptions);

  if (!session?.user?.id) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const [adminUser] = await db.select({ role: users.role }).from(users).where(eq(users.id, session.user.id)).limit(1);

  if (!adminUser || adminUser.role !== "admin") {
    return res.status(403).json({ message: "Forbidden" });
  }

  const mealId = typeof req.query.mealId === "string" ? req.query.mealId : "";
  const payload = (req.body ?? {}) as ReviewRequest;

  if (!mealId) {
    return res.status(400).json({ message: "Meal ID is required." });
  }

  if (payload.status !== "approved" && payload.status !== "rejected") {
    return res.status(400).json({ message: "Status must be approved or rejected." });
  }

  const [mealRecord] = await db.select().from(meals).where(eq(meals.id, mealId)).limit(1);

  if (!mealRecord) {
    return res.status(404).json({ message: "Meal not found." });
  }

  if (mealRecord.verifiedAt) {
    return res.status(409).json({ message: "Meal has already been reviewed." });
  }

  const verifiedAt = new Date();

  const [updatedMeal] = await db
    .update(meals)
    .set({
      status: payload.status,
      verifiedAt,
    })
    .where(eq(meals.id, mealId))
    .returning({
      id: meals.id,
      userId: meals.userId,
      status: meals.status,
      verifiedAt: meals.verifiedAt,
      createdAt: meals.createdAt,
      updatedAt: meals.updatedAt,
    });

  if (!updatedMeal) {
    return res.status(404).json({ message: "Meal not found." });
  }

  return res.status(200).json({
    message: `Meal ${payload.status}.`,
    meal: updatedMeal,
  });
}
