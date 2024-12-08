import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import otpGenerator from "otp-generator";
import FlightModel from "../models/FlightModel.mjs";

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
      .populate("userId", "name email")
      .populate("objectId")
      .exec()
      .catch((err) => console.error("Error:", err));
    console.log(getBooking);



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

const createFlight = async (req, res, next) => {
  try {
    // const userId = req.user.id;
    // const createBooking = BookingModel.create(req.body, { userId: userId });
    const createBooking = await FlightModel.create(req.body);
    if (createBooking) {
      return res.status(200).json({
        message: "Create flight successful",
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export { getBookingByUserId, createFlight };
