
import express from "express";

import * as mealController from "../controllers/mealController.js";

import {
  protect,
  restrictToChef,
} from "../controllers/authController.js";

const router = express.Router();
router.route("/").get(mealController.getAllMeals);
router  .route("/:id").get(mealController.getMeal)
/*
router.use(protect);

router.use(restrictToChef);
// Get all meals
//router.route("/").get(mealController.getAllMeals);

// Upload meal photo
router.post(  "/uploadphoto",mealController.upload.single("photo"),mealController.uploadMealPhoto);


// Submit meal request
router.post("/createmeal",mealController.requestMeal);
router.patch('/:id',mealController.updateMeal)
router.delete('/:id',mealController.deleteMeal)
// Get meal request status
router.get(
  "/getcreatemealstatus",
  mealController.getMealRequestStatus
);

// Meal by ID*/

export default router;
