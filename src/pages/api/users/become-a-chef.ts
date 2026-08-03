import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { eq } from "drizzle-orm";
import { db } from "@/db/drizzle";
import { chefs, users, type ChefStatus } from "@/db/schema";
import { authOptions } from "../auth/[...nextauth]";

type ChefApplicationResponse = {
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

type ChefApplicationRequest = {
  phone?: string;
  address?: string;
  bio?: string;
};

function normalizeOptionalField(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ChefApplicationResponse | ErrorResponse>,
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  const session = await getServerSession(req, res, authOptions);

  if (!session?.user?.id) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const payload = (req.body ?? {}) as ChefApplicationRequest;
  const phone = normalizeOptionalField(payload.phone);
  const address = normalizeOptionalField(payload.address);
  const bio = normalizeOptionalField(payload.bio);

  if (!phone) {
    return res.status(400).json({ message: "Phone number is required." });
  }

  if (!address) {
    return res.status(400).json({ message: "Address is required." });
  }

  if (!bio) {
    return res.status(400).json({ message: "Bio is required." });
  }

  const [currentUser] = await db
    .select({ id: users.id, role: users.role })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  if (!currentUser) {
    return res.status(404).json({ message: "Profile not found." });
  }

  if (currentUser.role !== "customer") {
    return res.status(409).json({ message: "Only customers can submit a chef application." });
  }

  const [existingRequest] = await db.select().from(chefs).where(eq(chefs.userId, session.user.id)).limit(1);

  if (existingRequest) {
    return res.status(409).json({ message: "A chef application already exists for this account." });
  }

  const [updatedUser] = await db
    .update(users)
    .set({ phone, address, bio })
    .where(eq(users.id, session.user.id))
    .returning({ id: users.id });

  if (!updatedUser) {
    return res.status(404).json({ message: "Profile not found." });
  }

  const [newChefRequest] = await db
    .insert(chefs)
    .values({
      userId: session.user.id,
      status: "pending",
    })
    .returning({
      id: chefs.id,
      userId: chefs.userId,
      status: chefs.status,
      requestedAt: chefs.requestedAt,
      reviewedAt: chefs.reviewedAt,
    });

  if (!newChefRequest) {
    return res.status(500).json({ message: "Failed to create chef application." });
  }

  return res.status(201).json({
    message: "Chef application submitted successfully.",
    chef: newChefRequest,
  });
}
