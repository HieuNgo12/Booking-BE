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

const getFlight = async (req, res, next) => {
  try {
    const getFlight = await FlightModel.find();
    return res.status(200).json({
      message: "Get flight successful",
      data: getFlight,
    });
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

export { getFlight, createFlight };
