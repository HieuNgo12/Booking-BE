import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import otpGenerator from "otp-generator";
import axios from "axios";
import PaymentModel from "../models/PaymentModel.mjs";
import CryptoJS from "crypto-js"; // npm install crypto-js
import moment from "moment";
import crypto from "crypto";
import qs from "qs";
import BookingModel from "../models/BookingModel.mjs";
// import crypto from "crypto";

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

// vn pay sandbox
const configVnpay = {
  vnp_TmnCode: "1LEJZJ64",
  vnp_HashSecret: "ADTS0PNZMQJTXHHX9EIP5126EZM90Q0Z",
  vnp_Url: "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
  vnp_Api: "https://sandbox.vnpayment.vn/merchant_webapi/api/transaction",
  vnp_ReturnUrl: "http://localhost:8888/order/vnpay_return",
};

const configMomo = {
  accessKey: "F8BBA842ECF85",
  secretKey: "K951B6PE1waDMi640xX08PD3vg6EkVlz",
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

      const mailOptions = {
        from: "info@test.com",
        to: dataPayment.payerDetails.email,
        subject: `Booking ${dataBooking.objectType}`,
        text: `Booking Code is ${dataPayment.paymentGatewayDetails.transactionId}`,
      };

      await transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          throw new Error("Error sending email");
        } else {
          console.log("Email sent: " + info.response);
          return res.status(200).json({
            message: "Payment created successfull",
            data: vnpUrl,
          });
        }
      });

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

function sortObject(obj) {
  let sorted = {};
  let keys = Object.keys(obj).sort();

  keys.forEach((key) => {
    sorted[key] = encodeURIComponent(obj[key]).replace(/%20/g, "+");
  });

  return sorted;
}

const createPaymentVnpay = async (req, res, next) => {
  try {
    const paymentId = req.paymentId;
    const dataBooking = req.dataBooking;

    const dataPayment = await PaymentModel.findById(paymentId);
  
    process.env.TZ = "Asia/Ho_Chi_Minh";

    let date = new Date();
    let createDate = moment(date).format("YYYYMMDDHHmmss");

    let ipAddr =
      req.headers["x-forwarded-for"] ||
      req.socket?.remoteAddress ||
      req.connection?.remoteAddress ||
      "::1";

    let tmnCode = configVnpay.vnp_TmnCode;
    let secretKey = configVnpay.vnp_HashSecret;
    let vnpUrl = configVnpay.vnp_Url;
    // let returnUrl = configVnpay.vnp_ReturnUrl;
    let orderId = moment(date).format("DDHHmmss");

    let bankCode = req.body.bankCode || "NCB";

    let locale = "vn";
    let currCode = "VND";

    let vnp_Params = {
      vnp_Version: "2.1.0",
      vnp_Command: "pay",
      vnp_TmnCode: tmnCode,
      vnp_Locale: locale,
      vnp_CurrCode: currCode,
      vnp_TxnRef: orderId,
      vnp_OrderInfo: "Thanh toan cho ma GD:" + orderId,
      vnp_OrderType: "other",
      vnp_Amount: dataBooking.totalAmount * 100,
      vnp_ReturnUrl: `http://localhost:5173/${dataBooking.objectType}-confirm-page/${dataBooking._id}`,
      vnp_IpAddr: ipAddr,
      vnp_CreateDate: createDate,
    };

    if (bankCode) {
      vnp_Params["vnp_BankCode"] = bankCode;
    }

    vnp_Params = sortObject(vnp_Params);

    let signData = qs.stringify(vnp_Params, { encode: false });
    let hmac = crypto.createHmac("sha512", secretKey);
    let signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

    vnp_Params["vnp_SecureHash"] = signed;
    vnpUrl += "?" + qs.stringify(vnp_Params, { encode: false });

    dataPayment.paymentGatewayDetails.provider = "VNPay";
    dataPayment.paymentGatewayDetails.transactionId = orderId;
    await dataPayment.save();

    const mailOptions = {
      from: "info@test.com",
      to: dataPayment.payerDetails.email,
      subject: `Booking ${dataBooking.objectType}`,
      text: `Booking Code is ${dataPayment.paymentGatewayDetails.transactionId}`,
    };

    await transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        throw new Error("Error sending email");
      } else {
        console.log("Email sent: " + info.response);
        return res.status(200).json({
          message: "Payment created successfull",
          data: vnpUrl,
        });
      }
    });

    return res.status(200).json({
      message: "Payment created successfull",
      data: vnpUrl,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const vnpayReturn = async (req, res, next) => {
  try {
    let vnp_Params = req.query;

    let secureHash = vnp_Params["vnp_SecureHash"];

    delete vnp_Params["vnp_SecureHash"];
    delete vnp_Params["vnp_SecureHashType"];

    vnp_Params = sortObject(vnp_Params);

    let tmnCode = configVnpay.vnp_TmnCode;
    let secretKey = configVnpay.vnp_HashSecret;

    let signData = qs.stringify(vnp_Params, { encode: false });

    let hmac = crypto.createHmac("sha512", secretKey);
    let signed = hmac.update(new Buffer(signData, "utf-8")).digest("hex");

    // if (secureHash === signed) {
    //   //Kiem tra xem du lieu trong db co hop le hay khong va thong bao ket qua

    //   res.render("success", { code: vnp_Params["vnp_ResponseCode"] });
    // } else {
    //   res.render("success", { code: "97" });
    // }

    if (secureHash === signed) {
      res.status(200).json({
        message: "Payment verification successful",
        code: vnp_Params["vnp_ResponseCode"],
      });
    } else {
      res.status(400).json({
        message: "Payment verification failed",
        code: "97",
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const createPaymentMomo = async (req, res, next) => {
  try {
    const paymentId = req.paymentId;
    const dataBooking = req.dataBooking;

    const dataPayment = await PaymentModel.findById(paymentId);

    var partnerCode = "MOMO";
    var orderId = partnerCode + new Date().getTime();
    var orderInfo = "Thanh toan cho ma GD:" + orderId;
    var redirectUrl = `http://localhost:5173/${dataBooking.objectType}-confirm-page/${dataBooking._id}`;
    var ipnUrl = "https://www.youtube.com/";
    var requestType = "payWithMethod";
    var amount = dataBooking.totalAmount;
    var requestId = orderId;
    var extraData = "";
    var orderGroupId = "";
    var autoCapture = true;
    var lang = "vi";

    var rawSignature =
      "accessKey=" +
      configMomo.accessKey +
      "&amount=" +
      amount +
      "&extraData=" +
      extraData +
      "&ipnUrl=" +
      ipnUrl +
      "&orderId=" +
      orderId +
      "&orderInfo=" +
      orderInfo +
      "&partnerCode=" +
      partnerCode +
      "&redirectUrl=" +
      redirectUrl +
      "&requestId=" +
      requestId +
      "&requestType=" +
      requestType;
    console.log("--------------------RAW SIGNATURE----------------");
    console.log(rawSignature);

    var signature = crypto
      .createHmac("sha256", configMomo.secretKey)
      .update(rawSignature)
      .digest("hex");
    console.log("--------------------SIGNATURE----------------");
    console.log(signature);

    const requestBody = JSON.stringify({
      partnerCode: partnerCode,
      partnerName: "Test",
      storeId: "MomoTestStore",
      requestId: requestId,
      amount: amount,
      orderId: orderId,
      orderInfo: orderInfo,
      redirectUrl: redirectUrl,
      ipnUrl: ipnUrl,
      lang: lang,
      requestType: requestType,
      autoCapture: autoCapture,
      extraData: extraData,
      orderGroupId: orderGroupId,
      signature: signature,
    });

    try {
      const response = await axios.post(
        "https://test-payment.momo.vn/v2/gateway/api/create",
        requestBody,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      dataPayment.paymentGatewayDetails.provider = "MOMO";
      dataPayment.paymentGatewayDetails.transactionId = orderId;
      await dataPayment.save();

      const mailOptions = {
        from: "info@test.com",
        to: dataPayment.payerDetails.email,
        subject: `Booking ${dataBooking.objectType}`,
        text: `Booking Code is ${orderId}`,
      };

      await transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          throw new Error("Error sending email");
        } else {
          console.log("Email sent: " + info.response);
          return res.status(200).json({
            message: "Payment created successfull",
            data: response.data.payUrl,
          });
        }
      });

      return res.status(200).json({
        message: "Payment created successfull",
        data: response.data.payUrl,
      });
    } catch (error) {
      console.error(`Lỗi tạo thanh toán MoMo: ${error.message}`);
      res.status(500).json({ message: "Không thể tạo thanh toán." });
    }
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
  createPaymentVnpay,
  vnpayReturn,
  createPaymentMomo,
};
