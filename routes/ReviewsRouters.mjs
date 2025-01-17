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
  getReviewHotelId,
  getReviewTourId,
  deleteReview,
} from "../controllers/ReviewsControllers.mjs";

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

//admin
router.get(
  "/api/v1/get-reviews-by-hotelId/:hotelId",
  validateToken,
  isLogInAdmin,
  getReviewHotelId
);

router.get(
  "/api/v1/get-reviews-by-tourId/:tourId",
  validateToken,
  isLogInAdmin,
  getReviewTourId
);

router.delete(
  "/api/v1/delete-review/:reviewId",
  validateToken,
  isLogInAdmin,
  deleteReview
);

router.get("/api/v1/get-reviews", validateToken, isLogInAdmin, getAllReview);

//user
router.post("/api/v1/create-review-without-authen",  createReview);
router.post(
  "/api/v1/create-review",
  upload.single("file"),
  validateToken,
  isLogInUser,
  createReview
);

export default router;
