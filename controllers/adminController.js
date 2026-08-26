import { prisma } from "../lib/prisma"
import catchAsync from './../utils/catchAsync.js'
import appError from './../utils/appError.js';

/*
export const getChefRequests = catchAsync(async (req, res) => {
  const requests = await prisma.user.findMany({
    where: {
      chefRequestStatus: "PENDING",
    },
    select: {
      id: true,
      full_name: true,
      email: true,
      profile_image: true,
      createdAt: true,
    },
  });

  res.status(200).json({
    status: "success",
    data: requests,
  });
});*/
export const getChefRequests = catchAsync(async (req, res) => {
  const requests = await prisma.user.findMany({
    where: {
      chefRequestStatus: {
        in: ["PENDING", "APPROVED", "REJECTED"],
      },
    },
    select: {
      id: true,
      full_name: true,
      email: true,
      phone: true,
      profile_image: true,
      bio: true,
      role: true,
      chefRequestStatus: true,
      chefRequestRejectReason: true,
      createdAt: true,
      location:true,
      profile: {
        select: {
          about_me: true,
        },
      },
    },

    orderBy: {
      createdAt: "desc",
    },
  });

  res.status(200).json({
    status: "success",
    results: requests.length,
    data: requests,
  });
});
export const approveChefRequest = catchAsync(async (req, res, next) => {
  const user = await prisma.user.findUnique({
    where: {
      id: req.params.id,
    },
  });

  if (!user)
    return next(new appError("User not found", 404));

  const updatedUser = await prisma.user.update({
    where: {
      id: req.params.id,
    },
    data: {
      role: "CHEF",
      chefRequestStatus: "APPROVED",
      chefRequestRejectReason: null,
    },
  });

  res.status(200).json({
    status: "success",
    data: updatedUser,
  });
});
export const rejectChefRequest = catchAsync(async (req, res, next) => {
  const { reason } = req.body;

  if (!reason)
    return next(new appError("Reject reason is required", 400));

  const user = await prisma.user.findUnique({
    where: {
      id: req.params.id,
    },
  });

  if (!user)
    return next(new appError("User not found", 404));

  const updatedUser = await prisma.user.update({
    where: {
      id: req.params.id,
    },
    data: {
      chefRequestStatus: "REJECTED",
      chefRequestRejectReason: reason,
    },
  });

  res.status(200).json({
    status: "success",
    data: updatedUser,
  });
});
////////
export const getAllMealRequests = catchAsync(async (req, res, next) => {
  const meals = await prisma.meal.findMany({
    where: {
      mealRequestStatus: {
        in: ["PENDING", "APPROVED", "REJECTED"],
      },
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

     
      user: {
        select: {
          id: true,
          full_name: true,
          email: true,
          phone: true,
          profile_image: true,
        },
      },

      tags: {
        include: {
          tag: true,
        },
      },
    },

    orderBy: {
      createdAt: "desc",
    },
  });

  res.status(200).json({
    status: "success",
    results: meals.length,
    data: meals,
  });
});

export const approveMeal = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  if (!id) {
    return next(
      new appError("Please provide meal id!", 400)
    );
  }

  const meal = await prisma.meal.findUnique({
    where: {
      id,
    },
  });

  if (!meal) {
    return next(
      new appError("Meal not found!", 404)
    );
  }

  if (meal.mealRequestStatus !== "PENDING") {
    return next(
      new appError(
        `Meal request is already ${meal.mealRequestStatus}`,
        400
      )
    );
  }

  const updatedMeal = await prisma.meal.update({
    where: {
      id,
    },

    data: {
      mealRequestStatus: "APPROVED",
      mealRequestRejectReason: null,
    },

    select: {
      id: true,
      title: true,
      photo: true,
      price: true,
      content: true,
      mealRequestStatus: true,
      mealRequestRejectReason: true,

      user: {
        select: {
          id: true,
          full_name: true,
          email: true,
          phone: true,
          profile_image: true,
        },
      },

      tags: {
        include: {
          tag: true,
        },
      },

      createdAt: true,
      updatedAt: true,
    },
  });

  res.status(200).json({
    status: "success",
    message: "Meal request approved successfully.",
    data: updatedMeal,
  });
});

//////
export const rejectMeal = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { reason } = req.body;

  if (!id) {
    return next(
      new appError("Please provide meal id!", 400)
    );
  }

  if (!reason) {
    return next(
      new appError(
        "Reject reason is required!",
        400
      )
    );
  }

  const meal = await prisma.meal.findUnique({
    where: {
      id,
    },
  });

  if (!meal) {
    return next(
      new appError("Meal not found!", 404)
    );
  }

  if (meal.mealRequestStatus !== "PENDING") {
    return next(
      new appError(
        `Meal request is already ${meal.mealRequestStatus}`,
        400
      )
    );
  }

  const updatedMeal = await prisma.meal.update({
    where: {
      id,
    },

    data: {
      mealRequestStatus: "REJECTED",
      mealRequestRejectReason: reason,
    },

    select: {
      id: true,
      title: true,
      photo: true,
      price: true,
      content: true,
      mealRequestStatus: true,
      mealRequestRejectReason: true,

      user: {
        select: {
          id: true,
          full_name: true,
          email: true,
          phone: true,
          profile_image: true,
        },
      },

      tags: {
        include: {
          tag: true,
        },
      },

      createdAt: true,
      updatedAt: true,
    },
  });

  res.status(200).json({
    status: "success",
    message: "Meal request rejected successfully.",
    data: updatedMeal,
  });
});