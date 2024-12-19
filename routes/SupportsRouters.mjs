import express from "express";
import {
  getAllSupport,
  replySupport,
} from "../controllers/SupportsControllers.mjs";
import { isLogInAdmin, validateToken } from "../middleware/validate.mjs";
const router = express.Router();

router.get("/api/v1/support", validateToken, isLogInAdmin, getAllSupport);

router.post("/api/v1/reply-support", validateToken, isLogInAdmin, replySupport);

export default router;
