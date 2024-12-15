import express from "express";
import multer from "multer";
import { createRoom } from "../controllers/RoomControllers.mjs";
import { isLogInAdmin, validateToken } from "../middleware/validate.mjs";

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post(
  "/api/v1/create-room",
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "files", maxCount: 10 },
  ]),
  validateToken,
  isLogInAdmin,
  createRoom
);

export default router;
