import { prisma } from "../lib/prisma"
import catchAsync from './../utils/catchAsync.js'
import appError from './../utils/appError.js';
import multer from "multer";
import cloudinary from "./../utils/cloudinary.js";
export const getMe = (req, res, next) =>
{
    req.params.id = req.user.id;
    next();
};
export const getAllUsers = catchAsync(async (req, res, next) =>
{
  const users = await prisma.user.findMany();
  res.status(200).json({
    status: 'success',
    data: users
  });
});
export const getUser = catchAsync(async (req, res, next) =>
{
  const { id } = req.params;
  if (!id)
    return next(new appError("please provide id!"), 404)
  const user = await prisma.user.findUnique({ where: { id: id } })
  if (!user)
    return next(new appError("User not found!"), 404)
  res.status(200).json({
    status: 'success',
    data: user
  });
});
export const updateUser = catchAsync(async (req, res, next) =>
{
  const { id } = req.params;
  const updatedData = req.body;
  if (!id || !updatedData)
    return next(new appError("please provide id and data!"), 404)
  const founded = await prisma.user.findUnique({ where: { id: id } })
  if (!founded)
    return next(new appError("User not found!"), 404)
  const user = await prisma.user.update({
    where: { id: id },
    data: updatedData
  })
  res.status(200).json({
    status: 'User was updated',
    data: user
  });
});
export const deleteUser = catchAsync(async (req, res, next) =>
{
  const { id } = req.params;
  if (!id)
    return next(new appError("please provide id!"), 404)
  const founded = await prisma.user.findUnique({ where: { id: id } })
  if (!founded)
    return next(new appError("User not found!"), 404)
  const deletedUser = await prisma.user.delete({ where: { id: id } })
  res.status(200).json({
    status: 'User was deleted',
    data: deletedUser,
  });
})
///upload image
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed."), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

export const uploadAvatar = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({
      message: "Image file is required.",
    });
  }

  const uploadResult = await cloudinary.uploader.upload(
    `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`,
    {
      folder: "Etbokhly/avatars",
      public_id: `user_${req.user.id}_${Date.now()}`,
      overwrite: true,
      resource_type: "image",
    }
  );
  
  const updatedUser = await prisma.user.update({
    where: {
      id: req.user.id,
    },
    data: {
      profile_image: uploadResult.secure_url,
    },
  });

  res.status(200).json({
    status: "success",
    message: "Avatar uploaded successfully.",
    url: updatedUser.profile_image,
  });
});

export const getChefRequestStatus = catchAsync(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      role: true,
      chefRequestStatus: true,
      chefRequestRejectReason: true,
    },
  });

  res.status(200).json({
    status: "success",
    data: user,
  });
});
export const requestChef = catchAsync(async (req, res, next) => {
  const { bio, phone, location } = req.body;

  if (!bio || !phone || !location) {
    return next(
      new appError(
        "Bio, phone and location are required to submit a Chef request",
        400
      )
    );
  }

  const user = await prisma.user.update({
    where: {
      id: req.user.id,
    },

    data: {
      bio,
      phone,
      location,
      chefRequestStatus: "PENDING",
      chefRequestRejectReason: null,
    },

    select: {
      id: true,
      full_name: true,
      email: true,
      phone: true,
      profile_image: true,
      bio: true,
      location: true,
      role: true,
      chefRequestStatus: true,
      chefRequestRejectReason: true,
    },
  });

  res.status(200).json({
    status: "success",
    message: "Your Chef request has been sent.",
    data: user,
  });
});