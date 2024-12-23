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
  getAllAdmin,
  deleteAdmin,
  verifyEmail,
} from "../controllers/AdminControllers.mjs";
import {
  isLogInAdmin,
  isLogInSuper,
  refreshToken,
  refreshTokenAdmin,
  validateToken,
  checkRole,
} from "../middleware/validate.mjs";

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

//super
router.get("/api/v1/check-role", validateToken, isLogInSuper, checkRole);

router.post("/api/v1/admin-sign-up", validateToken, isLogInSuper, signUp);

//admin
router.post("/api/v1/admin-log-in", logIn);

router.patch("/api/v1/admin-verify-email", verifyEmail);

router.get("/api/v1/get-all-admin", getAllAdmin);

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

router.delete(
  "/api/v1/delete-admin/:adminId",
  validateToken,
  isLogInAdmin,
  deleteAdmin
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
