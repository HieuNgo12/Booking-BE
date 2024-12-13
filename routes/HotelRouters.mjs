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

router.get("/api/v1/search-hotel", searchHotel);

router.post("/api/v1/create-hotel", validateToken, isLogInAdmin, addHotel);

router.patch("/api/v1/edit-hotel/:hotelId", validateToken, isLogInAdmin, editHotel);

router.delete("/api/v1/delete-hotel/:hotelId", validateToken, isLogInAdmin, deleteHotel);



export default router;
