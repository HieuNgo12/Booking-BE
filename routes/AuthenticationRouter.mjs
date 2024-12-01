import express from "express";
import jwt from "jsonwebtoken";
import { refreshToken } from "../middleware/validate.mjs";
import { forgotPassword, logIn, logInByGG , resetPassword, signUp  } from "../controllers/AuthenticationControllers.mjs";

const router = express.Router();

router.post("/api/v1/login", logIn);

router.post("/api/v1/login-gg", logInByGG);

router.post("/api/v1/signup", signUp);

router.post("/api/v1/forgot-password", forgotPassword);

router.patch("/api/v1/reset-password", resetPassword);

router.post("/api/v1/refresh-token", refreshToken);

export default router;


