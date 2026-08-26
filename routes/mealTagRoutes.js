
import express from "express";

import {addTagToMeal,removeTagFromMeal,getMealTags,} from "../controllers/mealTagController.js";

import * as authController from "../controllers/authController.js";

const router = express.Router();

// Protect all routes
router.use(authController.protect);

// Get all tags of a meal
router.get("/:mealId", getMealTags);

// Add tag to meal
router.post("/:mealId/tags/:tagId", addTagToMeal);

// Remove tag from meal
router.delete("/:mealId/tags/:tagId", removeTagFromMeal);

export default router;
