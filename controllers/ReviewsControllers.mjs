import { v2 as cloudinary } from "cloudinary";
import ReviewModel from "../models/ReviewsModel.mjs";
import HotelModel from "../models/HotelModel.mjs";
import TourModel from "../models/TourModel.mjs";

//cloudary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const getReviewHotelId = async (req, res, next) => {
  try {
    const hotelId = req.params.hotelId;
    const review = await HotelModel.findById(hotelId).populate("reviewId");
    return res.status(200).json({
      message: "Get review successfully",
      data: review,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const getReviewTourId = async (req, res, next) => {
  try {
    const tourId = req.params.tourId;
    const review = await TourModel.findById(tourId).populate("reviewId");
    return res.status(200).json({
      message: "Get review successfully",
      data: review,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const getAllReview = async (req, res, next) => {
  try {
    const review = await ReviewModel.find().populate("objectId");
    return res.status(200).json({
      message: "Get review successfully",
      data: review,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const createReview = async (req, res, next) => {
  try {
    const review = await ReviewModel.create(req.body);
    return res.status(200).json({
      message: "Create review successfully",
      data: review,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export { getAllReview, createReview, getReviewHotelId, getReviewTourId };
