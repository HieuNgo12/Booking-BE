import express from "express";
import multer from "multer";
import {
  createRoom,
  getRoomById,
  getRoomList,
  searchRoom,
  getRoom,
  editRoom,
  getRoomByHotelId,
  deleteRoom,
} from "../controllers/RoomControllers.mjs";
import { isLogInAdmin, validateToken } from "../middleware/validate.mjs";

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

//admin
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
router.post("/api/v1/searchRoom", searchRoom);
router.patch(
  "/api/v1/edit-room/:roomId",
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "files", maxCount: 10 },
  ]),
  validateToken,
  isLogInAdmin,
  editRoom
);

router.delete(
  "/api/v1/delete-room/:roomId",
  validateToken,
  isLogInAdmin,
  deleteRoom
);

//user
router.get("/api/v1/get-room/", getRoom);

router.get("/api/v1/get-room-by-hotelId/", getRoomByHotelId);

export default router;
