import express from "express";
import { addFlight, searchFlight } from "../controllers/FlightControllers.mjs";

const router = express.Router();

router.get("/api/v1/search-flight", searchFlight);

router.post("/api/v1/add-new-flight", addFlight);

export default router;
