import express from "express";
import {
  getPaymentByUserId,
  createPayment,
} from "../controllers/PaymentControllers.mjs";
import { isLogInUser, validateToken } from "../middleware/validate.mjs";

const router = express.Router();

router.get(
  "/api/v1/get-payment-by-userId",
  validateToken,
  isLogInUser,
  getPaymentByUserId
);

router.post(
  "/api/v1/create-payment",
  validateToken,
  isLogInUser,
  createPayment
);

export default router;
