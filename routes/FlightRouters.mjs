import express from "express";
import { createFlight, getFlight } from "../controllers/FlightControllers.mjs";
import { isLogInAdmin, validateToken } from "../middleware/validate.mjs";

const router = express.Router();

// router.get("/api/v1/search-flight", searchFlight);

router.get("/api/v1/get-flight", getFlight);

router.post("/api/v1/create-flight", validateToken, isLogInAdmin, createFlight);

export default router;
