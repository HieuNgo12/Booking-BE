import express from "express";
import multer from "multer";
import {
  forgotPassword,
  logIn,
  resetPassword,
  signUp,
  dashboard,
  monthly,
  daily,
  bookingMonthly,
  updateProfileUser,
  deleteUser,
} from "../controllers/AdminControllers.mjs";
import {
  isLogInAdmin,
  refreshToken,
  refreshTokenAdmin,
  validateToken,
} from "../middleware/validate.mjs";

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post("/api/v1/admin-log-in", logIn);

router.post("/api/v1/admin-sign-up", signUp);

router.post("/api/v1/admin-forgot-password", forgotPassword);

router.post("/api/v1/admin-reset-password", resetPassword);

router.get("/api/v1/refresh-token-admin", refreshTokenAdmin);

router.patch(
  "/api/v1/edit-profile-user/:userId",
  upload.single("file"),
  validateToken,
  isLogInAdmin,
  updateProfileUser
);

router.delete(
  "/api/v1/delete-user/:userId",
  validateToken,
  isLogInAdmin,
  deleteUser
);

router.get("/api/v1/dashboard", validateToken, isLogInAdmin, dashboard);

router.get("/api/v1/revenue/monthly", validateToken, isLogInAdmin, monthly);

router.get("/api/v1/revenue/daily", validateToken, isLogInAdmin, daily);

router.get(
  "/api/v1/revenue/booking-product-monthly",
  validateToken,
  isLogInAdmin,
  bookingMonthly
);

export default router;
