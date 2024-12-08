import express from "express";
import { isLogInUser, validateToken } from "../middleware/validate.mjs";
import {
  createBooking,
  getBookingByUserId,
  getBookingByBookingId
} from "../controllers/BookingControllers.mjs";
const router = express.Router();

router.get(
  "/api/v1/get-booking-by-userId",
  validateToken,
  isLogInUser,
  getBookingByUserId
);

router.get(
  "/api/v1/get-booking/:bookingId",
  validateToken,
  isLogInUser,
  getBookingByBookingId
);

router.post(
  "/api/v1/create-booking",
  validateToken,
  isLogInUser,
  createBooking
);

export default router;
