import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import bcrypt from "bcryptjs";
import { db } from "@/db/drizzle";
import { users } from "@/db/schema";
import { authOptions } from "../auth/[...nextauth]";
import { and, eq, ne } from "drizzle-orm";

type ProfileResponse = {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string | null;
  bio: string | null;
  phone: string | null;
  address: string | null;
};

type ErrorResponse = {
  message: string;
};

type UpdateProfileRequest = {
  name?: string;
  email?: string;
  newPassword?: string;
  avatar?: string;
  bio?: string;
  phone?: string;
  address?: string;
};

function normalizeOptionalField(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<ProfileResponse | ErrorResponse>) {
  switch (req.method) {
    case "GET": {
      const session = await getServerSession(req, res, authOptions);

      if (!session?.user?.id) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const [profile] = await db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          role: users.role,
          avatar: users.avatar,
          bio: users.bio,
          phone: users.phone,
          address: users.address,
        })
        .from(users)
        .where(eq(users.id, session.user.id))
        .limit(1);

      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }

      return res.status(200).json(profile);
    }

    case "PUT": {
      const session = await getServerSession(req, res, authOptions);

      if (!session?.user?.id) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const payload = (req.body ?? {}) as UpdateProfileRequest;
      const name = typeof payload.name === "string" ? payload.name.trim() : "";
      const email = typeof payload.email === "string" ? payload.email.trim().toLowerCase() : "";
      const newPassword = typeof payload.newPassword === "string" ? payload.newPassword.trim() : "";

      if (!name) {
        return res.status(400).json({ message: "Name is required." });
      }

      if (!email) {
        return res.status(400).json({ message: "Email is required." });
      }

      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailPattern.test(email)) {
        return res.status(400).json({ message: "Please provide a valid email address." });
      }

      if (newPassword && newPassword.length < 8) {
        return res.status(400).json({ message: "New password must be at least 8 characters." });
      }

      const [existingWithEmail] = await db
        .select({ id: users.id })
        .from(users)
        .where(and(eq(users.email, email), ne(users.id, session.user.id)))
        .limit(1);

      if (existingWithEmail) {
        return res.status(409).json({ message: "Email is already registered." });
      }

      const updateValues: {
        name: string;
        email: string;
        avatar: string | null;
        bio: string | null;
        phone: string | null;
        address: string | null;
        password?: string;
      } = {
        name,
        email,
        avatar: normalizeOptionalField(payload.avatar),
        bio: normalizeOptionalField(payload.bio),
        phone: normalizeOptionalField(payload.phone),
        address: normalizeOptionalField(payload.address),
      };

      if (newPassword) {
        updateValues.password = await bcrypt.hash(newPassword, 10);
      }

      const [updatedProfile] = await db.update(users).set(updateValues).where(eq(users.id, session.user.id)).returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        avatar: users.avatar,
        bio: users.bio,
        phone: users.phone,
        address: users.address,
      });

      if (!updatedProfile) {
        return res.status(404).json({ message: "Profile not found" });
      }

      return res.status(200).json(updatedProfile);
    }

    default: {
      res.setHeader("Allow", ["GET", "PUT"]);
      return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
    }
  }
}
