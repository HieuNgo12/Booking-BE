import express from "express";
import multer from "multer";
import {
  addHotel,
  searchHotel,
  getHotel,
  getAllHotel,
  editHotel,
  deleteHotel,
  getHotelById,
} from "../controllers/HotelControllers.mjs";
import { isLogInAdmin, validateToken } from "../middleware/validate.mjs";

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.get("/api/v1/get-hotel", getHotel);

router.get("/api/v1/get-all-hotel", getAllHotel);

router.get("/api/v1/search-hotel", searchHotel);

router.post(
  "/api/v1/create-hotel",
  upload.fields([
    { name: "avatar", maxCount: 1 }, // Một avatar bắt buộc
    { name: "files", maxCount: 10 }, // Mảng file tùy ý (tối đa 10 file)
  ]),
  validateToken,
  isLogInAdmin,
  addHotel
);

router.patch(
  "/api/v1/edit-hotel/:hotelId",
  validateToken,
  isLogInAdmin,
  editHotel
);

router.delete(
  "/api/v1/delete-hotel/:hotelId",
  validateToken,
  isLogInAdmin,
  deleteHotel
);
router.get(
  "/api/v1/hotel/:hotelId",
  getHotelById
);

export default router;
