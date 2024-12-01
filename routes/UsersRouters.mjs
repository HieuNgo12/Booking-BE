import express from "express";
import jwt from "jsonwebtoken";
import {profile,changePassword,updateProfile} from "../controllers/UsersControllers.mjs";
import {
  isLogInUser,
  validateToken,
  
} from "../middleware/validate.mjs";

const router = express.Router();

router.get("/api/v1/profile", validateToken, isLogInUser, profile);

router.patch("/api/v1/update-profile", validateToken, isLogInUser, updateProfile);

router.patch("/api/v1/change-password",validateToken, isLogInUser, changePassword);

export default router;
