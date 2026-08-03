import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db/drizzle";
import { chefs, users, type ChefStatus } from "@/db/schema";
import { authOptions } from "../../auth/[...nextauth]";

type ChefRow = {
  id: string;
  userId: string;
  status: ChefStatus;
  requestedAt: Date;
  reviewedAt: Date | null;
  user: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    address: string | null;
    bio: string | null;
    role: string;
  };
};

type ErrorResponse = {
  message: string;
};

type SuccessResponse = {
  chefs: ChefRow[];
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

  const records = await db
    .select({
      id: chefs.id,
      userId: chefs.userId,
      status: chefs.status,
      requestedAt: chefs.requestedAt,
      reviewedAt: chefs.reviewedAt,
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
    .from(chefs)
    .innerJoin(users, eq(users.id, chefs.userId))
    .orderBy(desc(chefs.requestedAt));

  return res.status(200).json({ chefs: records });
}
