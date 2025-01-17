import express from "express";

import multer from "multer";
import {
  applyPromoCode,
  applyPromotion,
  getPromotionByObjectType,
  createPromotion,
  deletePromotion,
  editPromotion,
  getPromotion,
  checkCode,
} from "../controllers/PromotionsControllers.mjs";
import { isLogInAdmin, validateToken } from "../middleware/validate.mjs";

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.get("/api/v1/get-promotion", getPromotion);

router.get("/api/v1/get-promotion/:objectType", getPromotionByObjectType);

router.get("/api/v1/check-code/:objectType/:code", checkCode);

router.post("/api/v1/apply-promotion", getPromotion);

router.post(
  "/api/v1/create-promotion",
  upload.single("file"),
  validateToken,
  isLogInAdmin,
  createPromotion
);

router.delete(
  "/api/v1/promotion",
  validateToken,
  isLogInAdmin,
  deletePromotion
);

router.patch(
  "/api/v1/edit-promotion/:promotionId",
  upload.single("file"),
  validateToken,
  isLogInAdmin,
  editPromotion
);

router.post(
  "/api/v1/applyPromo",

  applyPromotion
);
export default router;
