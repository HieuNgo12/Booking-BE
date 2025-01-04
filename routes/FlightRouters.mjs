import express from "express";
import {
  getFlightById,
  searchFlight,
  createFlight,
  deleteFlight,
  editFlight,
  getFlight,
} from "../controllers/FlightControllers.mjs";
import { isLogInAdmin, validateToken } from "../middleware/validate.mjs";

const router = express.Router();

router.get("/api/v1/get-flight", getFlight);

router.get("/api/v1/search-flight", searchFlight);

router.get("/api/v1/get-flight-by-id/:flightId", getFlightById);

//admin
router.post("/api/v1/create-flight", validateToken, isLogInAdmin, createFlight);

router.patch(
  "/api/v1/edit-flight/:flightId",
  validateToken,
  isLogInAdmin,
  editFlight
);

router.delete(
  "/api/v1/delete-flight/:flightId",
  validateToken,
  isLogInAdmin,
  deleteFlight
);

export default router;
