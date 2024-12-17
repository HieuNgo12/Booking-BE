import express from "express";
<<<<<<< HEAD
import { addHotel, searchHotel, getHotel, getHotelById } from "../controllers/HotelControllers.mjs";
=======
import multer from "multer";
import {
  addHotel,
  searchHotel,
  getHotel,
  getAllHotel,
  editHotel,
  deleteHotel,
} from "../controllers/HotelControllers.mjs";
import { isLogInAdmin, validateToken } from "../middleware/validate.mjs";
>>>>>>> a04e1907746a7a608f9555f7bec8ed87c808560d

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.get("/api/v1/get-hotel", getHotel);
router.get("/api/v1/hotel/:hotelId", getHotelById);

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

export default router;
