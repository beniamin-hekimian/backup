import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import cloudinary from "@/utils/cloudinary";
import { authOptions } from "../auth/[...nextauth]";

type UploadResponse = {
  url: string;
};

type ErrorResponse = {
  message: string;
};

type UploadRequest = {
  fileDataUrl?: string;
};

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "8mb",
    },
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<UploadResponse | ErrorResponse>) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  const session = await getServerSession(req, res, authOptions);

  if (!session?.user?.id) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const payload = (req.body ?? {}) as UploadRequest;

  if (!payload.fileDataUrl || typeof payload.fileDataUrl !== "string") {
    return res.status(400).json({ message: "Image file is required." });
  }

  if (!payload.fileDataUrl.startsWith("data:image/")) {
    return res.status(400).json({ message: "Only image files are allowed." });
  }

  try {
    const uploadResult = await cloudinary.uploader.upload(payload.fileDataUrl, {
      folder: "Etbokhly/meals",
      public_id: `meal_${session.user.id}_${Date.now()}`,
      overwrite: true,
      resource_type: "image",
    });

    return res.status(200).json({ url: uploadResult.secure_url });
  } catch (error) {
    console.error("Cloudinary meal upload error:", error);
    return res.status(500).json({ message: "Failed to upload meal image." });
  }
}
