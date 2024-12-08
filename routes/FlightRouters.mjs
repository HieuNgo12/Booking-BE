import express from "express";
import { createFlight } from "../controllers/FlightControllers.mjs";

const router = express.Router();

// router.get("/api/v1/search-flight", searchFlight);

// router.post("/api/v1/add-new-flight", addFlight);

router.get(
  "/api/v1/get-flight-by-userId"
  //   validateToken,
  //   isLogInUser,
);

router.post(
  "/api/v1/create-flight",
  //   validateToken,
  //   isLogInUser,
  createFlight
);

export default router;
