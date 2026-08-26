import express from "express";

import * as mealController from "../controllers/mealController.js";
import * as chefController from "../controllers/chefController.js"
import * as authController from '../controllers/authController'
const router = express.Router();

// Public route - no auth required
router.get("/profile/:id", chefController.getPublicChefProfile);

router.use(authController.protect);

router.use(authController.restrictToChef);

// Upload meal photo
router.post(  "/uploadphoto",chefController.upload.single("photo"),chefController.uploadMealPhoto);
// Submit meal request
router.post("/createmeal",chefController.requestMeal);
router.patch('/:id',chefController.updateMeal)
router.delete('/:id',chefController.deleteMeal)
// Get meal request status
router.get(
  "/getcreatemealstatus",
  chefController.getMealRequestStatus
);

export default router;