import express from "express";

const router = express.Router();

router.post("/api/v1/admin-log-in", logIn);

router.post("/api/v1/admin-login-gg", logInByGG);

router.post("/api/v1/admin-sign-up", signUp);

router.post("/api/v1/admin-forgot-password", forgotPassword);

router.post("/api/v1/admin-reset-password", resetPassword);

router.post("/api/v1/admin-refresh-token", refreshToken);

export default router;
