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

const getBooking = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const pageSize = parseInt(req.query.pageSize, 10) || 10;
    const objectType = req.query.objectType;
    const total = await BookingModel.countDocuments();
    const getBooking = await BookingModel.find({ objectType })
      .populate("userId")
      .populate("objectId")
      .populate("paymentId")
      .populate("bookedRoomId")
      .skip((page - 1) * pageSize)
      .limit(pageSize * 5);

    if (getBooking) {
      return res.status(200).json({
        message: "Get hotel booking successful",
        data: getBooking,
        total: total,
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const adminGetBookingByUserId = async (req, res, next) => {
  try {
    const userId = req.params.userId;
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

const getBookingByUserId = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const objectType = req.params.objectType;
    const getBooking = await BookingModel.find({ userId: userId })
      .populate("userId")
      .populate("reviewId")
      .populate("objectId");

    const filterBooking = getBooking.filter(
      (item) => item.objectType === objectType
    );

    if (!filterBooking || filterBooking.length === 0) {
      return res.status(404).json({
        message: "No bookings found for this user",
      });
    }

    if (filterBooking) {
      return res.status(200).json({
        message: "Get booking successful",
        data: filterBooking,
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const adminGetBookingByBookingId = async (req, res, next) => {
  try {
    const bookingId = req.params.bookingId;
    const getBooking = await BookingModel.findById(bookingId)
      .populate("userId")
      .populate("objectId")
      .populate("bookedRoomId");

    if (!getBooking || getBooking.length === 0) {
      return res.status(400).json({
        message: "No bookings found for this booking",
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

const adminGetBookingByRoomId = async (req, res, next) => {
  try {
    const roomId = req.params.roomId;
    const getBooking = await BookingModel.find()
      .populate("userId")
      .populate("bookedRoomId");

    const filterRoom = getBooking.filter(
      (item) =>
        item.bookedRoomId?._id?.toString() === roomId &&
        item.objectType === "hotel"
    );

    if (!filterRoom || filterRoom.length === 0) {
      return res.status(400).json({
        message: "No bookings found for this booking",
      });
    }

    if (filterRoom) {
      return res.status(200).json({
        message: "Get booking successful",
        data: filterRoom,
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

const getBookingByBookingIdNoToken = async (req, res, next) => {
  try {
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

const searchBooking = async (req, res, next) => {
  try {
    const { bookingId, pinCode, objectType } = req.params;

    const getBooking = await BookingModel.findOne({
      _id: bookingId,
      pinCode: pinCode,
      objectType: objectType,
    })
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
    const {
      firstName,
      lastName,
      email,
      phone,
      objectType,
      objectId,
      bookingStartDate,
      bookingEndDate,
      totalPersons,
      totalAmount,
      discount,
    } = req.body;

    const createBooking = await BookingModel.create({
      // userId: userId ? userId : null,
      objectId,
      objectType,
      contactInfo: {
        name: `${firstName} ${lastName}`,
        email,
        phone,
      },
      bookingStartDate,
      bookingEndDate,
      totalAmount,
      totalPersons,
      discount,
    });

    if (createBooking) {
      return res.status(200).json({
        message: "Create booking successful",
        data: createBooking,
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const getBookingByBookingID = async (req, res, next) => {
  try {
    const getBooking = await BookingModel.findOne({
      _id: req.params.bookingId,
    });
    console.log(getBooking);
    res.status(200).json({
      mes: "Get Booking Successfully",
      data: getBooking,
    });
  } catch (e) {
    res.status(500).json({
      mes: "Internal Server Error",
      error: e.message,
    });
  }
};

const updateContact = async (req, res, next) => {
  try {
    const bookingId = req.params.bookingId;
    console.log(req.body);
    const { phone, name, email, status } = req.body;
    let updateContact = await BookingModel.findById(bookingId);

    if (!updateContact) {
      return res.status(400).json({
        message: "Booking is not found!",
      });
    }

    console.log(status);
    updateContact.contactInfo.phone = phone;
    updateContact.contactInfo.name = name;
    updateContact.contactInfo.email = email;
    updateContact.status = status;

    await updateContact.save();

    console.log("check");

    return res.status(200).json({
      message: "Update booking successful",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export {
  getBookingByBookingIdNoToken,
  adminGetBookingByBookingId,
  adminGetBookingByUserId,
  adminGetBookingByRoomId,
  getBookingByUserId,
  createBooking,
  getBookingByBookingId,
  getBooking,
  getBookingByBookingID,
  updateContact,
  searchBooking,
};
