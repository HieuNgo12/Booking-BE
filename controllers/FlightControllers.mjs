import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import otpGenerator from "otp-generator";
import FlightModel from "../models/FlightModel.mjs";
import dayjs from "dayjs";

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

const deleteFlight = async (req, res, next) => {
  try {
    const flightId = req.params.flightId;
    await FlightModel.findByIdAndDelete(flightId);
    return res.status(200).json({
      message: "Delete Flight successful",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

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

const getFlightById = async (req, res, next) => {
  try {
    console.log(req.params.flightId);
    const getFlight = await FlightModel.findById(req.params.flightId);
    console.log(getFlight);
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
    const createFlight = await FlightModel.create(req.body);
    if (createFlight) {
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

const editFlight = async (req, res, next) => {
  try {
    const flightId = req.params.flightId;

    console.log(req.body);
    const flight = await FlightModel.findById(flightId);

    if (!flight) {
      return res.status(400).json({
        message: "Flight is not found!",
      });
    }

    const update = await FlightModel.findByIdAndUpdate(flightId, req.body, {
      new: true,
    });

    if (update) {
      return res.status(200).json({
        message: "Update flight successful",
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const searchFlight = async (req, res, next) => {
  try {
    const {
      departureAirport,
      destinationAirport,
      passengers,
      classFlight,
      departureDate,
      returnDate,
      trip,
    } = req.query;

    const checkAirport = await FlightModel.find({
      departureAirport,
      destinationAirport,
    });

    const checkClassFlight = checkAirport.filter((flight) =>
      flight.classFlight.some(
        (item) => item.type === classFlight && item.seats >= passengers
      )
    );

    const dateObject = new Date(departureDate);
    const checkDepartureDate = checkClassFlight.filter((item) => {
      const departureDate = item.departureDate.toISOString().split("T")[0];
      const targetDate = dateObject.toISOString().split("T")[0];
      return departureDate === targetDate;
    });

    if (checkDepartureDate.length === 0) {
      return res.status(200).json({
        message: "Flight is not found!",
        data: checkDepartureDate,
      });
    }

    if (trip === "one") {
      return res.status(200).json({
        message: "Flight is found!",
        data: checkDepartureDate,
      });
    } else if (trip === "two") {
      const checkAirportReturn = await FlightModel.find({
        departureAirport: destinationAirport,
        destinationAirport: departureAirport,
      });

      const checkClassFlightReturn = checkAirportReturn.filter((flight) =>
        flight.classFlight.some(
          (item) => item.type === classFlight && item.seats >= passengers
        )
      );

      const dateObjectReturn = new Date(returnDate);

      const checkReturnDate = checkClassFlightReturn.filter((item) => {
        const returnDate = item.departureDate.toISOString().split("T")[0];
        const targetDate = dateObjectReturn.toISOString().split("T")[0];
        return returnDate === targetDate;
      });

      const newArr = checkDepartureDate.map((item) => {
        const loop1 = checkReturnDate.filter(
          (item2) => item2.airlineName === item.airlineName
        );
        return {
          ...item._doc,
          returnInfo: loop1,
        };
      });

      console.log(newArr);
      return res.status(200).json({
        message: "Flight is found!",
        data: newArr,
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export {
  getFlight,
  createFlight,
  editFlight,
  deleteFlight,
  searchFlight,
  getFlightById,
};
