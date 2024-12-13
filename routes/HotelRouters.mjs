import express from "express";
import {
  addHotel,
  searchHotel,
  getHotel,
  editHotel,
  deleteHotel,
} from "../controllers/HotelControllers.mjs";
import { isLogInAdmin, validateToken } from "../middleware/validate.mjs";

const router = express.Router();

router.get("/api/v1/get-hotel", getHotel);

router.patch("/api/v1/edit-hotel/:hotelId", validateToken, isLogInAdmin, editHotel);

router.delete("/api/v1/delete-hotel/:hotelId", validateToken, isLogInAdmin, deleteHotel);

router.get("/api/v1/search-hotel", searchHotel);

router.post("/api/v1/add-new-hotel", addHotel);

export default router;
