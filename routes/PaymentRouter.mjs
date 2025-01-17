import express from "express";
import {
  checkStatusFromZalo,
  getPaymentByUserId,
  createPaymentZalo,
  callBackFromZalo,
  createPayment,
  createPaymentVnpay,
  vnpayReturn,
  createPaymentMomo,
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
  // validateToken,
  // isLogInUser,
  createPayment
);

router.post(
  "/api/v1/create-payment-zalo/:bookingId",
  // validateToken,
  // isLogInUser,
  createPayment,
  createPaymentZalo
);

router.post(
  "/api/v1/callback-from-zalo",
  // validateToken,
  // isLogInUser,
  callBackFromZalo
);

router.post(
  "/api/v1/check-status-from-zalo/:app_trans_id",
  // validateToken,
  // isLogInUser,
  checkStatusFromZalo
);

router.post(
  "/api/v1/create-payment-vnpay/:bookingId",
  // validateToken,
  // isLogInUser,
  createPayment,
  createPaymentVnpay

);

router.get(
  "/api/v1/vnpay_return",
  // validateToken,
  // isLogInUser,
  vnpayReturn
);

router.post(
  "/api/v1/create-payment-momo/:bookingId",
  // validateToken,
  // isLogInUser,
  createPayment,
  createPaymentMomo
);

export default router;
