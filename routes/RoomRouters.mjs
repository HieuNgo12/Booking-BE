import express from "express";
import { createRoom } from "../controllers/RoomControllers.mjs";

const router = express.Router();

router.post("/api/v1/create-room", createRoom);

export default router;
