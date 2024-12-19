import express from "express";
import multer from "multer";
import { createRoom, getRoomById, getRoomList } from "../controllers/RoomControllers.mjs";
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

router.get("/api/v1/getRoomById/:roomId", getRoomById);
router.get("/api/v1/getRoomList", getRoomList);

export default router;
