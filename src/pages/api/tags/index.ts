import type { NextApiRequest, NextApiResponse } from "next";
import { asc } from "drizzle-orm";
import { db } from "@/db/drizzle";
import { tags } from "@/db/schema";

type TagsResponse = Array<{
  id: string;
  name: string;
}>;

type ErrorResponse = {
  message: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<TagsResponse | ErrorResponse>) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  const records = await db.select({ id: tags.id, name: tags.name }).from(tags).orderBy(asc(tags.name));

  return res.status(200).json(records);
}
