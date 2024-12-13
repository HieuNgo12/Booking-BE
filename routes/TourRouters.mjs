import express from "express";
import { addTour, searchTour, getTour, deleteTour, editTour } from "../controllers/ToursControllers.mjs";
import { isLogInAdmin, validateToken } from "../middleware/validate.mjs";

const router = express.Router();

router.get("/api/v1/get-tour", getTour);

router.patch("/api/v1/edit-tour/:tourId", validateToken, isLogInAdmin, editTour);

router.delete("/api/v1/delete-tour/:tourId", validateToken, isLogInAdmin, deleteTour);

router.get("/api/v1/search-tour", searchTour);

router.post("/api/v1/add-new-tour", addTour);

export default router;
