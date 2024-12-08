import express from "express";
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import {
  profile,
  changePassword,
  updateProfile,
  changePhone,
  changeEmail,
  sentToNewEmail,
  changeLanguage,
  changeCurrency
} from "../controllers/UsersControllers.mjs";
import { isLogInUser, validateToken } from "../middleware/validate.mjs";

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.get("/api/v1/profile", validateToken, isLogInUser, profile);

router.patch("/api/v1/update-profile", upload.single('file'), validateToken, isLogInUser, updateProfile);

router.patch("/api/v1/change-password", validateToken, isLogInUser, changePassword);

router.patch("/api/v1/change-phone", validateToken, isLogInUser, changePhone);

router.post("/api/v1/sent-otp-to-current-email", validateToken, isLogInUser, sentToNewEmail);

router.patch("/api/v1/change-email", validateToken, isLogInUser, changeEmail);

router.patch("/api/v1/update-currency", validateToken, isLogInUser, changeCurrency);

router.patch("/api/v1/update-language", validateToken, isLogInUser, changeLanguage);

export default router;
