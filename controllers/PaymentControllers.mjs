import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import otpGenerator from "otp-generator";
import twilio from "twilio";
import PaymentModel from "../models/PaymentModel.mjs";
import CryptoJS from "crypto-js"; // npm install crypto-js
import moment from "moment";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import qs from "qs";
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

// zaolo pay sandbox
const config = {
  appid: "554",
  key1: "8NdU5pG5R2spGHGhyO99HN1OhD8IQJBn",
  key2: "uUfsWgfLkRLzq6W2uNXTCxrfxs51auny",
  endpoint: "https://sandbox.zalopay.com.vn/v001/tpe/createorder",
  endpointStatus: "https://sb-openapi.zalopay.vn/v2/query",
};

const createPayment = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const { paymentMethod } = req.body;

    const bookingDetail = await BookingModel.findById(bookingId);

    const dataPayment = {
      bookingId: bookingDetail._id,
      amount: bookingDetail.totalAmount,
      currency: "VND",
      paymentMethod,
      payerDetails: bookingDetail.contactInfo,
      description: `Thanh toán hóa đơn - ${bookingDetail.objectType} - ${
        bookingDetail._id
      } - ${new Date()}`,
    };

    const createPayment = await PaymentModel.create(dataPayment);
    bookingDetail.paymentId = createPayment._id;

    await bookingDetail.save();

    if (createPayment) {
      req.paymentId = createPayment._id;
      req.dataBooking = bookingDetail;
      next();
    }
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const createPaymentZalo = async (req, res, next) => {
  try {
    const paymentId = req.paymentId;
    const dataBooking = req.dataBooking;

    const dataPayment = await PaymentModel.findById(paymentId);

    const embeddata = {
      merchantinfo: "Thanh toán thành công!",
      redirecturl: `http://localhost:5173/${dataBooking.objectType}-confirm-page/${dataBooking._id}`,
    };

    const items = [{}];
    const transID = Math.floor(Math.random() * 1000000);
    const apptransid = `${moment().format("YYMMDD")}_${transID}`;

    const order = {
      appid: config.appid,
      apptransid: apptransid,
      appuser: "demo",
      apptime: Date.now(),
      item: JSON.stringify(items),
      embeddata: JSON.stringify(embeddata),
      amount: dataBooking.totalAmount,
      description: `ZaloPay Integration Demo - Thanh toán cho đơn hàng : ${dataBooking._id} - Mã thanh toán : ${apptransid}`,
      bankcode: "zalopayapp",
      // callback_url:
      //   "https://aedb-42-119-84-109.ngrok-free.app/api/v1/callback-from-zalo",
    };

    const data =
      config.appid +
      "|" +
      order.apptransid +
      "|" +
      order.appuser +
      "|" +
      order.amount +
      "|" +
      order.apptime +
      "|" +
      order.embeddata +
      "|" +
      order.item;
    order.mac = CryptoJS.HmacSHA256(data, config.key1).toString();

    const params = new URLSearchParams();
    for (const key in order) {
      params.append(key, order[key]);
    }

    const response = await fetch(config.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    const responseData = await response.json();

    if (response.ok) {
      dataPayment.paymentGatewayDetails.provider = "ZaloPay";
      dataPayment.paymentGatewayDetails.transactionId = apptransid;
      await dataPayment.save();

      return res.status(200).json({
        message: "Payment created successfully",
        data: responseData,
      });
    } else {
      dataPayment.paymentGatewayDetails.provider = "ZaloPay";
      dataPayment.paymentGatewayDetails.transactionId = apptransid;
      dataPayment.status = "failed";

      await dataPayment.save();

      return res.status(200).json({
        message: "Payment created failed",
        data: responseData,
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const callBackFromZalo = async (req, res, next) => {
  const result = {};
  try {
    let dataStr = req.body.data;
    let reqMac = req.body.mac;

    const configCallBack = {
      key2: "trMrHtvjo6myautxDUiAcYsVtaeQ8nhf",
    };

    let mac = CryptoJS.HmacSHA256(dataStr, configCallBack.key2).toString();
    console.log("mac =", mac);

    if (reqMac !== mac) {
      // callback không hợp lệ
      console.log("check");
      result.return_code = -1;
      result.return_message = "mac not equal";
    } else {
      // thanh toán thành công
      // merchant cập nhật trạng thái cho đơn hàng
      let dataJson = JSON.parse(dataStr, config.key2);
      console.log(
        "update order's status = success where app_trans_id =",
        dataJson["app_trans_id"]
      );

      result.return_code = 1;
      result.return_message = "success";

      return res.status(200).send("Callback received successfully");
    }
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const checkStatusFromZalo = async (req, res, next) => {
  try {
    let postData = {
      app_id: config.appid,
      app_trans_id: req.params.app_trans_id,
    };

    let data =
      postData.app_id + "|" + postData.app_trans_id + "|" + config.key1;
    postData.mac = CryptoJS.HmacSHA256(data, config.key1).toString();

    const params = qs.stringify(postData);

    const response = await fetch(config.endpointStatus, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params,
    });

    const result = await response.json();
    if (result) {
      return res.status(200).json({
        message: result.return_message,
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

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

const createPaymentMomo = async (req, res, next) => {
  try {
    const embeddata = {
      merchantinfo: "embeddata123",
      redirecturl: "https://www.youtube.com/",
    };

    const items = [{}];
    const transID = Math.floor(Math.random() * 1000000);

    const order = {
      appid: config.appid,
      apptransid: `${moment().format("YYMMDD")}_${transID}`,
      appuser: "demo",
      apptime: Date.now(), // miliseconds
      item: JSON.stringify(items),
      embeddata: JSON.stringify(embeddata),
      amount: 50000,
      description: "ZaloPay Integration Demo",
      bankcode: "zalopayapp",
      callback_url:
        "https://f999-115-73-170-7.ngrok-free.app/api/v1/callback-from-zalo",
    };

    const data =
      config.appid +
      "|" +
      order.apptransid +
      "|" +
      order.appuser +
      "|" +
      order.amount +
      "|" +
      order.apptime +
      "|" +
      order.embeddata +
      "|" +
      order.item;
    order.mac = CryptoJS.HmacSHA256(data, config.key1).toString();

    const params = new URLSearchParams();
    for (const key in order) {
      params.append(key, order[key]);
    }

    console.log(params);

    const response = await fetch(config.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    return res.status(200).json({
      message: "Payment created successfully",
      data: await response.json(),
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export {
  checkStatusFromZalo,
  getPaymentByUserId,
  createPaymentZalo,
  callBackFromZalo,
  createPayment,
  createPaymentMomo,
};
