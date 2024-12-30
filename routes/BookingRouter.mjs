import express from "express";
import {
  isLogInAdmin,
  isLogInUser,
  validateToken,
} from "../middleware/validate.mjs";
import {
  getBooking,
  updateContact,
  createBooking,
  getBookingByUserId,
  getBookingByBookingId,
  adminGetBookingByUserId,
  adminGetBookingByRoomId,
  adminGetBookingByBookingId,
} from "../controllers/BookingControllers.mjs";
const router = express.Router();

//admin
router.get("/api/v1/get-booking", validateToken, isLogInAdmin, getBooking);

router.get(
  "/api/v1/admin-get-booking-by-userId/:userId",
  validateToken,
  isLogInAdmin,
  adminGetBookingByUserId
);

router.patch(
  "/api/v1/update-contact/:bookingId",
  validateToken,
  isLogInAdmin,
  updateContact
);

router.get(
  "/api/v1/admin-get-booking/:bookingId",
  validateToken,
  isLogInAdmin,
  adminGetBookingByBookingId
);

router.get(
  "/api/v1/admin-get-all-booking-by-roomId/:roomId",
  validateToken,
  isLogInAdmin,
  adminGetBookingByRoomId
);

//user
router.get(
  "/api/v1/get-booking-by-userId/:objectType",
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
