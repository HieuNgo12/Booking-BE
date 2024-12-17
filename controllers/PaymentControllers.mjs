import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import otpGenerator from "otp-generator";
import twilio from "twilio";
import PaymentModel from "../models/PaymentModel.mjs";

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

const getPaymentByUserId = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const getPayment = PaymentModel.findById(userId);
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const createPayment = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const createPayment = PaymentModel.create(req.body, { userId: userId });
    if (createPayment) {
      return res.status(200).json({
        message: "Create payment successful",
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export { getPaymentByUserId, createPayment };
