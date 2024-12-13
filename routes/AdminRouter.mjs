import express from "express";
import {
  forgotPassword,
  logIn,
  resetPassword,
  signUp,
} from "../controllers/AdminControllers.mjs";
import { refreshToken, refreshTokenAdmin } from "../middleware/validate.mjs";

const router = express.Router();

router.post("/api/v1/admin-log-in", logIn);

router.post("/api/v1/admin-sign-up", signUp);

router.post("/api/v1/admin-forgot-password", forgotPassword);

router.post("/api/v1/admin-reset-password", resetPassword);

router.get("/api/v1/refresh-token-admin", refreshTokenAdmin);


export default router;
