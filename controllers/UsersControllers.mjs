import UserModel from "../models/UsersModel.mjs";
import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

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

const changePassword = async (req, res, next) => {
  try {
    const { password, newPassword, confirmNewPassword } = req.body;
    const userId = req.user.sub;
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const profile = async (req, res, next) => {
  try {
    const getUser = await UserModel.findOne();
    return res.status(200).json({
      message: "Get user successful!",
      data: getUser,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const getUser = await UserModel.findOne();
    return res.status(200).json({
      message: "Get user successful!",
      data: getUser,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export { changePassword, profile, updateProfile };
