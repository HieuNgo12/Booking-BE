import express from "express";
import PromotionsControllers from "../controllers/PromotionsControllers.mjs";
const router = express.Router();
router.post(
  "/api/v1/applyPromo",

  PromotionsControllers.applyPromoCode
);

export default router;
