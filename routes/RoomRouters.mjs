import express from "express";
import { addRoom, searchRoom } from "../controllers/RoomControllers.mjs";

const router = express.Router();

router.get("/api/v1/search-room", searchRoom);

router.post("/api/v1/add-new-room", addRoom);

export default router;
