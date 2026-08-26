import { prisma } from "../lib/prisma.js";
import catchAsync from "../utils/catchAsync.js";
import appError from "../utils/appError.js";
import multer from "multer";
import cloudinary from "../utils/cloudinary.js";


// =========================
// Multer Upload Configuration
// =========================

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


// =========================
// Get All Meals
// =========================
/*
export const getAllMeals = catchAsync(async (req, res, next) => {
  const meals = await prisma.meal.findMany({
    select: {
      id: true,
      title: true,
      photo: true,
      price: true,
      content: true,
      createdAt: true,
      updatedAt: true,
      user_id: true,
      tags: true,
      mealRequestStatus: true,
      mealRequestRejectReason: true,
    },where:{mealRequestStatus:'APPROVED'}
  });

  res.status(200).json({
    status: "success",
    data: meals,
  });
});
*/
export const getAllMeals = catchAsync(async (req, res, next) => {
  const meals = await prisma.meal.findMany({
    where: {
      mealRequestStatus: "APPROVED",
    },

    select: {
      id: true,
      title: true,
      photo: true,
      price: true,
      content: true,
      createdAt: true,
      updatedAt: true,

      user: {
        select: {
          id: true,
          full_name: true,
          profile_image: true,
        },
      },

      tags: {
        select: {
          tag: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },

      mealRequestStatus: true,
      mealRequestRejectReason: true,
    },
  });

  res.status(200).json({
    status: "success",
    data: meals,
  });
});
// =========================
// Get Single Meal
// =========================

export const getMeal = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  if (!id) {
    return next(new appError("Please provide id!", 400));
  }

  const meal = await prisma.meal.findUnique({
    where: {
      id,
    },
       select: {
      id: true,
      title: true,
      photo: true,
      price: true,
      content: true,
      createdAt: true,
      updatedAt: true,

      user: {
        select: {
          id: true,
          full_name: true,
          profile_image: true,
          location:true,
          phone:true,
          email:true
        },
      },

      tags: {
        select: {
          tag: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },

      mealRequestStatus: true,
      mealRequestRejectReason: true,
    },
    
  });

  if (!meal) {
    return next(new appError("Meal not found!", 404));
  }

  res.status(200).json({
    status: "success",
    data: meal,
  });
});



// =========================
// Update Meal
// =========================

/*
export const updateMeal = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const updatedData = { ...req.body };

  if (!id) {
    return next(new appError("Please provide id!", 400));
  }

  const founded = await prisma.meal.findUnique({
    where: {
      id,
    },
  });

  if (!founded) {
    return next(new appError("Meal not found!", 404));
  }

  const meal = await prisma.meal.update({
    where: {
      id,
    },
    data: updatedData,
  });

  res.status(200).json({
    status: "Meal was updated",
    data: meal,
  });
});*/

export const updateMeal = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const {
    tagIds,
    ...updatedData
  } = req.body;

  if (!id) {
    return next(new appError("Please provide id!", 400));
  }

  const founded = await prisma.meal.findUnique({
    where: {
      id,
    },
  });

  if (!founded) {
    return next(new appError("Meal not found!", 404));
  }

  const meal = await prisma.$transaction(async (tx) => {

    // Update meal data
    const updatedMeal = await tx.meal.update({
      where: {
        id,
      },
      data: updatedData,
    });

    
    if (tagIds !== undefined) {

     
      await tx.mealTag.deleteMany({
        where: {
          meal_id: id,
        },
      });

      
      if (tagIds.length > 0) {
        await tx.mealTag.createMany({
          data: tagIds.map((tagId) => ({
            meal_id: id,
            tag_id: tagId,
          })),
        });
      }
    }

   
    return await tx.meal.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        title: true,
        photo: true,
        price: true,
        content: true,
        createdAt: true,
        updatedAt: true,

        user: {
          select: {
            id: true,
            full_name: true,
            profile_image: true,
          },
        },

        tags: {
          select: {
            tag: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });
  });

  res.status(200).json({
    status: "success",
    message: "Meal was updated successfully",
    data: meal,
  });
});


// =========================
// Delete Meal
// =========================

export const deleteMeal = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  if (!id) {
    return next(new appError("Please provide id!", 400));
  }

  const founded = await prisma.meal.findUnique({
    where: {
      id,
    },
  });

  if (!founded) {
    return next(new appError("Meal not found!", 404));
  }

  const deletedMeal = await prisma.meal.delete({
    where: {
      id,
    },
  });

  res.status(200).json({
    status: "Meal was deleted",
    data: deletedMeal,
  });
});


// =========================
// Upload Meal Photo
// =========================

export const uploadMealPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({
      message: "Image file is required.",
    });
  }

  const uploadResult = await cloudinary.uploader.upload(
    `data:${req.file.mimetype};base64,${req.file.buffer.toString(
      "base64"
    )}`,
    {
      folder: "Etbokhly/meals",
      public_id: `meal_${req.user.id}_${Date.now()}`,
      overwrite: true,
      resource_type: "image",
    }
  );

  res.status(200).json({
    status: "success",
    message: "Meal image uploaded successfully.",
    url: uploadResult.secure_url,
  });
});

export const requestMeal = catchAsync(async (req, res, next) => {
  const {
    title,
    price,
    content,
    photo,
    tagIds
  } = req.body;

  if (!title || !price || !content || !photo) {
    return next(
      new appError(
        "Title, price, photo and content are required to submit a Meal request",
        400
      )
    );
  }

  if (tagIds && !Array.isArray(tagIds)) {
    return next(
      new appError("tagIds must be an array", 400)
    );
  }

  const meal = await prisma.meal.create({
    data: {
      title,
      photo,
      price,
      content,

      user_id: req.user.id,

      mealRequestStatus: "PENDING",
      mealRequestRejectReason: null,

      tags: tagIds?.length
        ? {
            create: tagIds.map((tagId) => ({
              tag: {
                connect: {
                  id: tagId,
                },
              },
            })),
          }
        : undefined,
    },

    select: {
      id: true,
      title: true,
      photo: true,
      price: true,
      content: true,

      user_id: true,

      
      user: {
        select: {
          full_name: true,
          email: true,
          phone: true,
          profile_image: true,
        },
      },

      mealRequestStatus: true,
      mealRequestRejectReason: true,

      tags: {
        include: {
          tag: true,
        },
      },

      createdAt: true,
      updatedAt: true,
    },
  });

  res.status(201).json({
    status: "success",
    message: "Your Meal request has been sent.",
    data: meal,
  });
});
// =========================
// Get Meal Request Status
// =========================
/*
export const getMealRequestStatus = catchAsync(
  async (req, res, next) => {
    const meals = await prisma.meal.findMany({
      where: {
        user_id: req.user.id,
      },

      select: {
        id: true,
        title: true,
        photo: true,
        price: true,
        content: true,
        mealRequestStatus: true,
        mealRequestRejectReason: true,
        createdAt: true,
        updatedAt: true,
      },

      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json({
      status: "success",
      data: meals,
    });
  }
);
*/