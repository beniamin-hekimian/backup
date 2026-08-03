import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { eq } from "drizzle-orm";
import { db } from "@/db/drizzle";
import { chefs, users, type ChefStatus } from "@/db/schema";
import { authOptions } from "../../auth/[...nextauth]";

type ChefReviewResponse = {
  message: string;
  chef: {
    id: string;
    userId: string;
    status: ChefStatus;
    requestedAt: Date;
    reviewedAt: Date | null;
  };
};

type ErrorResponse = {
  message: string;
};

type ReviewRequest = {
  status?: ChefStatus;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<ChefReviewResponse | ErrorResponse>) {
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

  const userId = typeof req.query.userId === "string" ? req.query.userId : "";
  const payload = (req.body ?? {}) as ReviewRequest;

  if (!userId) {
    return res.status(400).json({ message: "Chef user ID is required." });
  }

  if (payload.status !== "approved" && payload.status !== "rejected") {
    return res.status(400).json({ message: "Status must be approved or rejected." });
  }

  const [chefRequest] = await db.select().from(chefs).where(eq(chefs.userId, userId)).limit(1);

  if (!chefRequest) {
    return res.status(404).json({ message: "Chef application not found." });
  }

  if (chefRequest.reviewedAt) {
    return res.status(409).json({ message: "Chef application has already been reviewed." });
  }

  const reviewedAt = new Date();

  const [updatedChefRequest] = await db
    .update(chefs)
    .set({
      status: payload.status,
      reviewedAt,
    })
    .where(eq(chefs.userId, userId))
    .returning({
      id: chefs.id,
      userId: chefs.userId,
      status: chefs.status,
      requestedAt: chefs.requestedAt,
      reviewedAt: chefs.reviewedAt,
    });

  if (!updatedChefRequest) {
    return res.status(404).json({ message: "Chef application not found." });
  }

  if (payload.status === "approved") {
    await db.update(users).set({ role: "chef" }).where(eq(users.id, userId));
  }

  return res.status(200).json({
    message: `Chef application ${payload.status}.`,
    chef: updatedChefRequest,
  });
}
