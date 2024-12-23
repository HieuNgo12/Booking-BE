import express from "express";
import multer from "multer";
import {
  profile,
  changePassword,
  updateProfile,
  changePhone,
  changeEmail,
  sentToNewEmail,
  changeLanguage,
  changeCurrency,
  changePaymentMethod,
  changeOnlineWallet,
  changeIdCard,
  sentEmailSupport,
  getAllUsers,
} from "../controllers/UsersControllers.mjs";
import {
  isLogInAdmin,
  isLogInUser,
  validateToken,
} from "../middleware/validate.mjs";

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.get("/api/v1/profile", validateToken, isLogInUser, profile);

router.patch(
  "/api/v1/update-profile",
  upload.single("file"),
  validateToken,
  isLogInUser,
  updateProfile
);

router.patch(
  "/api/v1/change-password",
  validateToken,
  isLogInUser,
  changePassword
);

router.patch("/api/v1/change-phone", validateToken, isLogInUser, changePhone);

router.post(
  "/api/v1/sent-otp-to-current-email",
  validateToken,
  isLogInUser,
  sentToNewEmail
);

router.patch("/api/v1/change-email", validateToken, isLogInUser, changeEmail);

router.patch(
  "/api/v1/update-currency",
  validateToken,
  isLogInUser,
  changeCurrency
);

router.patch(
  "/api/v1/update-language",
  validateToken,
  isLogInUser,
  changeLanguage
);

router.patch(
  "/api/v1/update-payment-method",
  validateToken,
  isLogInUser,
  changePaymentMethod
);

router.patch(
  "/api/v1/update-online-wallet",
  validateToken,
  isLogInUser,
  changeOnlineWallet
);

router.patch(
  "/api/v1/update-id-card",
  validateToken,
  isLogInUser,
  changeIdCard
);

router.post(
  "/api/v1/sent-email-support",
  upload.array("files"),
  validateToken,
  isLogInUser,
  sentEmailSupport
);


//admin
router.get("/api/v1/get-all-users", validateToken, isLogInAdmin, getAllUsers);

export default router;
