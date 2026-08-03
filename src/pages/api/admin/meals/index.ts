import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db/drizzle";
import { mealTags, meals, tags, users, type MealStatus } from "@/db/schema";
import { authOptions } from "../../auth/[...nextauth]";

type MealRow = {
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
  user: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    address: string | null;
    bio: string | null;
    role: string;
  };
  tags: Array<{
    id: string;
    name: string;
  }>;
};

type ErrorResponse = {
  message: string;
};

type SuccessResponse = {
  meals: MealRow[];
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<SuccessResponse | ErrorResponse>) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  const session = await getServerSession(req, res, authOptions);

  if (!session?.user?.id) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const [currentUser] = await db.select({ role: users.role }).from(users).where(eq(users.id, session.user.id)).limit(1);

  if (!currentUser || currentUser.role !== "admin") {
    return res.status(403).json({ message: "Forbidden" });
  }

  const mealRows = await db
    .select({
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
      user: {
        id: users.id,
        name: users.name,
        email: users.email,
        phone: users.phone,
        address: users.address,
        bio: users.bio,
        role: users.role,
      },
    })
    .from(meals)
    .innerJoin(users, eq(users.id, meals.userId))
    .orderBy(desc(meals.createdAt));

  const allMealTags = await db
    .select({
      mealId: mealTags.mealId,
      id: tags.id,
      name: tags.name,
    })
    .from(mealTags)
    .innerJoin(tags, eq(tags.id, mealTags.tagId))
    .where(
      inArray(
        mealTags.mealId,
        mealRows.map((row) => row.id),
      ),
    );

  const tagsByMealId = allMealTags.reduce<Record<string, Array<{ id: string; name: string }>>>(
    (accumulator, tagRow) => {
      if (!accumulator[tagRow.mealId]) {
        accumulator[tagRow.mealId] = [];
      }

      accumulator[tagRow.mealId].push({ id: tagRow.id, name: tagRow.name });
      return accumulator;
    },
    {},
  );

  const mealsWithTags = mealRows.map((mealRow) => ({
    ...mealRow,
    tags: tagsByMealId[mealRow.id] ?? [],
  }));

  return res.status(200).json({ meals: mealsWithTags });
}
