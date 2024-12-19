import express from "express";
import multer from "multer";
import {
  isLogInAdmin,
  isLogInUser,
  validateToken,
} from "../middleware/validate.mjs";
import {
  createReview,
  getAllReview,
} from "../controllers/ReviewsControllers.mjs";

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

//admin
router.get(
  "/api/v1/get-reviews",
  validateToken,
  isLogInAdmin,
  getAllReview
);

//user
router.post(
  "/api/v1/create-review",
  validateToken,
  isLogInUser,
  createReview
);

export default router;
