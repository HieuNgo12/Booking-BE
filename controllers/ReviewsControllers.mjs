import { v2 as cloudinary } from "cloudinary";
import ReviewModel from "../models/ReviewsModel.mjs";
import HotelModel from "../models/HotelModel.mjs";
import TourModel from "../models/TourModel.mjs";
import mongoose from "mongoose";
import BookingModel from "../models/BookingModel.mjs";
//cloudary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const deleteReview = async (req, res, next) => {
  try {
    const reviewId = req.params.reviewId;
    await ReviewModel.findByIdAndDelete({ reviewId });
    return res.status(200).json({
      message: "Delete review successful",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

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
    const review = await ReviewModel.find()
      .populate("objectId")
      .populate("userId");
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
    const hotel = await HotelModel.findByIdAndUpdate(
      req.body.objectId,
      { $push: { reviewId: review._id } },
      { new: true},
      function (err, managerparent) {
        if (err) throw err;
        console.log(managerparent);
      }
    );
    console.log(hotel);
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

export {
  getAllReview,
  createReview,
  getReviewHotelId,
  getReviewTourId,
  deleteReview,
};
