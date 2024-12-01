import express from "express";
import { addHotel, searchHotel, getHotel } from "../controllers/HotelControllers.mjs";

const router = express.Router();

router.get("/api/v1/get-hotel", getHotel);

router.get("/api/v1/search-hotel", searchHotel);

router.post("/api/v1/add-new-hotel", addHotel);

export default router;
