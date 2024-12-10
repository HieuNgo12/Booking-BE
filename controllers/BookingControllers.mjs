import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import otpGenerator from "otp-generator";
import twilio from "twilio";
import BookingModel from "../models/BookingModel.mjs";

//hashPassword
const saltRounds = 10;
const salt = bcrypt.genSaltSync(saltRounds);

//nodemailder
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  secure: false,
  port: 587,
  auth: {
    user: process.env.MY_EMAIL,
    pass: process.env.PASS_EMAIL,
  },
});

const getBookingByUserId = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const getBooking = await BookingModel.find({ userId: userId })
      .populate("userId")
      .populate("objectId");

    if (!getBooking || getBooking.length === 0) {
      return res.status(404).json({
        message: "No bookings found for this user",
      });
    }

    if (getBooking) {
      return res.status(200).json({
        message: "Get booking successful",
        data: getBooking,
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const getBookingByBookingId = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const bookingId = req.params.bookingId;
    const getBooking = await BookingModel.findById(bookingId)
      .populate("userId")
      .populate("objectId")
      .populate("bookedRoomId");
    // .populate({
    //   path: "objectId",
    //   populate: {
    //     path: "room",
    //     model: "room",
    //   },
    // });

    if (!getBooking || getBooking.length === 0) {
      return res.status(400).json({
        message: "No bookings found for this booking",
      });
    }

    if (getBooking.userId._id.toString() !== userId) {
      return res.status(400).json({
        message: "You are not owner booking!",
      });
    }

    if (getBooking) {
      return res.status(200).json({
        message: "Get booking successful",
        data: getBooking,
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const createBooking = async (req, res, next) => {
  try {
    // const userId = req.user.id;
    // const createBooking = BookingModel.create(req.body, { userId: userId });
    const createBooking = BookingModel.create(req.body);
    if (createBooking) {
      return res.status(200).json({
        message: "Create booking successful",
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export { getBookingByUserId, createBooking, getBookingByBookingId };
