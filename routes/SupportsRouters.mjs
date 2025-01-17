import express from "express";
import {
  getAllSupport,
  replySupport,
  getSupportByUserId,
  getSupportBySupportId,
} from "../controllers/SupportsControllers.mjs";
import {
  isLogInAdmin,
  validateToken,
  isLogInUser,
} from "../middleware/validate.mjs";
const router = express.Router();

//user
router.get(
  "/api/v1/support-by-userId/:userId",
  validateToken,
  isLogInUser,
  getSupportByUserId
);

router.get(
  "/api/v1/support-by-supportId/:supportId",
  validateToken,
  isLogInUser,
  getSupportBySupportId
);

//admin
router.get("/api/v1/support", validateToken, isLogInAdmin, getAllSupport);

router.patch(
  "/api/v1/reply-support/:supportId",
  validateToken,
  isLogInAdmin,
  replySupport
);

export default router;
