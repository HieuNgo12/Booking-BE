import express from "express";
import { forgotPassword, logIn, logInByGG , resetPassword, signUp } from "../controllers/AdminControllers.mjs";

const router = express.Router();

router.post("/api/v1/admin-log-in", logIn);

router.post("/api/v1/admin-login-gg", logInByGG);

router.post("/api/v1/admin-sign-up", signUp);

router.post("/api/v1/admin-forgot-password", forgotPassword);

router.post("/api/v1/admin-reset-password", resetPassword);

export default router;


