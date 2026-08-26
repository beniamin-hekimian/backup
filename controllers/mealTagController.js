
import { prisma } from "../lib/prisma.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";

// Add tag to meal
export const addTagToMeal = catchAsync(async (req, res, next) =>
{
  const { mealId, tagId } = req.params;

  // Check meal exists
  const meal = await prisma.meal.findUnique({
    where: { id: mealId },
  });

  if (!meal)
  {
    return next(new AppError("Meal not found", 404));
  }

  // Check tag exists
  const tag = await prisma.tag.findUnique({
    where: { id: tagId },
  });

  if (!tag)
  {
    return next(new AppError("Tag not found", 404));
  }

  // Check if relation already exists
  const existingMealTag = await prisma.mealTag.findUnique({
    where: {
      meal_id_tag_id: {
        meal_id: mealId,
        tag_id: tagId,
      },
    },
  });

  if (existingMealTag)
  {
    return next(new AppError("Tag is already assigned to this meal", 400));
  }

  const mealTag = await prisma.mealTag.create({
    data: {
      meal_id: mealId,
      tag_id: tagId,
    },
    include: {
      tag: true,
      meal: true,
    },
  });

  res.status(201).json({
    status: "success",
    data: {
      mealTag,
    },
  });
});

// Remove tag from meal
export const removeTagFromMeal = catchAsync(async (req, res, next) =>
{
  const { mealId, tagId } = req.params;

  const existingMealTag = await prisma.mealTag.findUnique({
    where: {
      meal_id_tag_id: {
        meal_id: mealId,
        tag_id: tagId,
      },
    },
  });

  if (!existingMealTag)
  {
    return next(new AppError("Tag is not assigned to this meal", 404));
  }

  await prisma.mealTag.delete({
    where: {
      meal_id_tag_id: {
        meal_id: mealId,
        tag_id: tagId,
      },
    },
  });

  res.status(204).json({
    status: "success",
    data: null,
  });
});

// Get all tags of a meal
export const getMealTags = catchAsync(async (req, res, next) =>
{
  const { mealId } = req.params;

  const meal = await prisma.meal.findUnique({
    where: { id: mealId },
  });

  if (!meal)
  {
    return next(new AppError("Meal not found", 404));
  }

  const mealTags = await prisma.mealTag.findMany({
    where: {
      meal_id: mealId,
    },
    include: {
      tag: true,
    },
  });

  res.status(200).json({
    status: "success",
    results: mealTags.length,
    data: {
      tags: mealTags.map((mealTag) => mealTag.tag),
    },
  });
});
