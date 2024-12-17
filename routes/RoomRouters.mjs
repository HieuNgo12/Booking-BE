import express from "express";
<<<<<<< HEAD
import { addRoom, getRoomById, searchRoom } from "../controllers/RoomControllers.mjs";
=======
import multer from "multer";
import { createRoom } from "../controllers/RoomControllers.mjs";
import { isLogInAdmin, validateToken } from "../middleware/validate.mjs";
>>>>>>> a04e1907746a7a608f9555f7bec8ed87c808560d

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

<<<<<<< HEAD
router.get("/api/v1/search-room", searchRoom);

router.post("/api/v1/add-new-room", addRoom);
router.get("/api/v1/getRoomById/:roomId", getRoomById);
=======
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
>>>>>>> a04e1907746a7a608f9555f7bec8ed87c808560d

export default router;
