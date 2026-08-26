import { prisma } from "../lib/prisma"
import catchAsync from './../utils/catchAsync.js'
import appError from './../utils/appError.js';

export const getAllTags = catchAsync(async (req, res, next) =>
{
  const tags = await prisma.tag.findMany();
  res.status(200).json({
    status: 'success',
    data: tags
  });
});

export const getTag = catchAsync(async (req, res, next) =>
{
  const { id } = req.params;
  if (!id)
    return next(new appError("please provide id!", 404))
  const tag = await prisma.tag.findUnique({ where: { id: id } })
  if (!tag)
    return next(new appError("Tag not found!", 404))
  res.status(200).json({
    status: 'success',
    data: tag
  });
});

export const createTag = catchAsync(async (req, res, next) =>
{
  const { name } = req.body;
  if (!name)
    return next(new appError("please provide tag name!", 400))

  const founded = await prisma.tag.findUnique({ where: { name: name } })
  if (founded)
    return next(new appError("Tag already exists!", 409))

  const tag = await prisma.tag.create({
    data: {
      name,
    }
  })

  res.status(201).json({
    status: 'success',
    data: tag
  });
});

export const updateTag = catchAsync(async (req, res, next) =>
{
  const { id } = req.params;
  const updatedData = req.body;
  if (!id || !updatedData)
    return next(new appError("please provide id and data!", 400))
  const founded = await prisma.tag.findUnique({ where: { id: id } })
  if (!founded)
    return next(new appError("Tag not found!", 404))

  const tag = await prisma.tag.update({
    where: { id: id },
    data: updatedData
  })

  res.status(200).json({
    status: 'Tag was updated',
    data: tag
  });
});

export const deleteTag = catchAsync(async (req, res, next) =>
{
  const { id } = req.params;
  if (!id)
    return next(new appError("please provide id!", 400))
  const founded = await prisma.tag.findUnique({ where: { id: id } })
  if (!founded)
    return next(new appError("Tag not found!", 404))
  const deletedTag = await prisma.tag.delete({ where: { id: id } })
  res.status(200).json({
    status: 'Tag was deleted',
    data: deletedTag,
  });
})