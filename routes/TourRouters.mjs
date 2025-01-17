
import express from "express";
import multer from "multer";
import {
  addTour,
  searchTour,
  getTour,
  deleteTour,
  editTour,
  getAllTour,
  getTourById,
} from "../controllers/ToursControllers.mjs";
import { isLogInAdmin, validateToken } from "../middleware/validate.mjs";

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

//admin
router.delete(
  "/api/v1/delete-tour/:tourId",
  validateToken,
  isLogInAdmin,
  deleteTour
);

router.patch(
  "/api/v1/edit-tour/:tourId",
  upload.fields([
    { name: "avatar", maxCount: 1 }, // Một avatar bắt buộc
    { name: "files", maxCount: 10 }, // Mảng file tùy ý (tối đa 10 file)
  ]),
  validateToken,
  isLogInAdmin,
  editTour
);

router.post(
  "/api/v1/create-tour",
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "files", maxCount: 10 },
  ]),
  validateToken,
  isLogInAdmin,
  addTour
);

//user
router.get("/api/v1/get-tour", getTour);

router.get("/api/v1/get-all-tour", getAllTour);

router.get("/api/v1/search-tour", searchTour);

router.get("/api/v1/get-tour-by-id/:id", getTourById);

export default router;
