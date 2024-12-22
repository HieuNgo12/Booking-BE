import express from "express";
import {
  isLogInAdmin,
  isLogInUser,
  validateToken,
} from "../middleware/validate.mjs";
import {
  createBooking,
  getBooking,
  getBookingByUserId,
  getBookingByBookingId,
  getBookingByBookingID,
} from "../controllers/BookingControllers.mjs";
const router = express.Router();

//admin
router.get("/api/v1/get-booking", validateToken, isLogInAdmin, getBooking);

//user
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
router.get("/api/v1/getBookingById/:bookingId", getBookingByBookingID);
router.post("/api/v1/createBookingWithoutAuthen", createBooking);

export default router;
