import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import otpGenerator from "otp-generator";
import twilio from "twilio";
import AdminModel from "../models/AdminModel.mjs";
import PaymentModel from "../models/PaymentModel.mjs";
import UserModel from "../models/UsersModel.mjs";
import BookingModel from "../models/BookingModel.mjs";
import HotelModel from "../models/HotelModel.mjs";
import TourModel from "../models/TourModel.mjs";
import ReviewModel from "../models/ReviewsModel.mjs";
import SupportModel from "../models/SupportsModel.mjs";
import PromotionModel from "../models/PromotionsModel.mjs";
import moment from "moment"; // Thư viện moment để xử lý thời gian
import { v2 as cloudinary } from "cloudinary";
import OtpModel from "../models/OtpModel.mjs";

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

const getAllAdmin = async (req, res, next) => {
  try {
    const admins = await AdminModel.find();
    const adminOnly = admins.filter((item) => item.role === "admin");
    return res.status(200).json({
      message: "Get admin successful",
      data: adminOnly,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const logIn = async (req, res, next) => {
  try {
    let { email, password } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required!",
      });
    }
    email = email.trim();

    const validatorEmail = validator.isEmail(email);

    if (!validatorEmail) {
      return res.status(400).json({
        message: "Invalid email",
      });
    }

    if (!password) {
      return res.status(400).json({
        message: "Password is required!",
      });
    }
    password = password.trim();

    let checkEmail = await AdminModel.findOne({ email: email });

    if (!checkEmail) {
      return res.status(400).json({
        message: "Email is incorrect! Please check your email again!",
      });
    }

    const hashingPasswordLogin = await bcrypt.compare(
      password,
      checkEmail.password
    );

    const currentDate = new Date();
    const MAX_TIME_SUSPENDED = 5 * 60 * 1000;
    const checkTimeSuspend = currentDate - checkEmail.timeSuspended;

    if (
      checkTimeSuspend < MAX_TIME_SUSPENDED &&
      checkEmail.logInAttempt === 0
    ) {
      return res.status(400).json({
        message:
          "Your account will be automatically locked during 5 mins. Please log in after 5 mins again!",
      });
    }

    if (
      checkTimeSuspend >= MAX_TIME_SUSPENDED &&
      checkEmail.logInAttempt === 0
    ) {
      checkEmail.timeSuspended = null;
      checkEmail.logInAttempt = 5;
      await checkEmail.save();
    }

    if (!hashingPasswordLogin) {
      checkEmail.logInAttempt = checkEmail.logInAttempt - 1;
      await checkEmail.save();
      if (checkEmail.logInAttempt !== 0) {
        return res.status(400).json({
          message: `Password is incorrect! Please check your password again! After 5 incorrect entries, your account will be automatically locked! You have ${checkEmail.logInAttempt} times left to try!`,
        });
      } else {
        (checkEmail.timeSuspended = currentDate), await checkEmail.save();
        return res.status(400).json({
          message:
            "Your account will be automatically locked during 5 mins. Please log in after 5 mins again!",
        });
      }
    }

    if (checkEmail.verificationStatus.emailVerified === false) {
      const checkOTP = await OtpModel.findOne({
        email: email,
        purpose: "verifyEmail",
      });

      if (checkOTP) {
        const mailOptions = {
          from: "info@test.com",
          to: email,
          subject: "Your OTP Code",
          text: `Otp to verify email is: ${checkOTP.otp}`,
        };

        await transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            throw new Error("Error sending email");
          } else {
            console.log("Email sent: " + info.response);
            return res.status(400).json({
              message:
                "Please verify email first! OTP is sent! Please check your email!",
              emailVerified: false,
            });
          }
        });

        return res.status(400).json({
          message:
            "Please verify email first! OTP is sent! Please check your email!",
          emailVerified: false,
        });
      } else {
        const otp = otpGenerator.generate(6, {
          digits: true,
          lowerCaseAlphabets: false,
          upperCaseAlphabets: false,
          specialChars: false,
        });

        const newOtp = await OtpModel.create({
          email: email,
          otp: otp,
          purpose: "verifyEmail",
        });
        if (newOtp) {
          const mailOptions = {
            from: "info@test.com",
            to: email,
            subject: "Your OTP Code",
            text: `Otp to verify email is: ${otp}`,
          };

          await transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              throw new Error("Error sending email");
            } else {
              console.log("Email sent: " + info.response);
              return res.status(400).json({
                message:
                  "Please verify email first! OTP is sent! Please check your email!",
                emailVerified: false,
              });
            }
          });
          return res.status(400).json({
            message:
              "Please verify email first! OTP is sent! Please check your email!",
            emailVerified: false,
          });
        }
      }
    }

    if (
      (hashingPasswordLogin && checkEmail.role === "admin") ||
      (hashingPasswordLogin && checkEmail.role === "super")
    ) {
      (checkEmail.logInAttempt = 5), (checkEmail.timeSuspended = null);
      await checkEmail.save();

      const userDataAccessToken = {
        id: checkEmail._id,
        email: checkEmail.email,
        firstName: checkEmail.firstName,
        lastName: checkEmail.lastName,
        avatar: checkEmail.avatar,
      };

      const userDataRefreshToken = {
        id: checkEmail._id,
      };

      const accessToken = jwt.sign(userDataAccessToken, process.env.KEY_JWT, {
        expiresIn: "5m",
      });

      const refreshToken = jwt.sign(userDataRefreshToken, process.env.KEY_JWT, {
        expiresIn: "1h",
      });

      res.cookie("accessToken", accessToken, {
        httpOnly: false,
        path: "/",
        // secure: true,
        sameSite: "None",
        maxAge: 5 * 60 * 1000,
      });

      res.cookie("refreshToken", refreshToken, {
        httpOnly: false,
        path: "/",
        // secure: true,
        sameSite: "None",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.status(200).json({
        message: "Log in successful!",
        accessToken: accessToken,
        refreshToken: refreshToken,
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const signUp = async (req, res, next) => {
  try {
    let { email, password, firstName, lastName, confirmPassword, workplace } =
      req.body;
    if (!firstName) {
      return res.status(400).json({
        message: "First name is required!",
      });
    }
    firstName = firstName.trim();

    if (!lastName) {
      return res.status(400).json({
        message: "Last Name is required!",
      });
    }
    lastName = lastName.trim();

    if (!email) {
      return res.status(400).json({
        message: "Email is required!",
      });
    }
    email = email.trim();

    const validatorEmail = validator.isEmail(email);

    if (!validatorEmail) {
      return res.status(400).json({
        message: "Invalid email",
      });
    }

    const checkEmail = await AdminModel.findOne({ email: email });
    if (checkEmail) {
      return res.status(400).json({
        message: "Email already exists",
      });
    }

    const checkAdminWord = email.includes("admin");
    if (checkAdminWord) {
      return res.status(400).json({
        message: "Email does not include admin",
      });
    }

    if (!password) {
      return res.status(400).json({
        message: "Password is required!",
      });
    }
    password = password.trim();

    if (!confirmPassword) {
      return res.status(400).json({
        message: "Confirm password is required!",
      });
    }
    confirmPassword = confirmPassword.trim();

    const errors = [];
    if (!validator.isLength(password, { min: 8, max: 100 })) {
      errors.push("Password must be between 8 and 100 characters.");
    }

    if (!/[A-Z]/.test(password)) {
      errors.push("Password must include at least one uppercase letter.");
    }

    if (!/[a-z]/.test(password)) {
      errors.push("Password must include at least one lowercase letter.");
    }

    if (!/[0-9]/.test(password)) {
      errors.push("Password must include at least one number.");
    }

    if (!/[@$!%*?&.]/.test(password)) {
      errors.push(
        "Password must include at least one special character (@, $, !, %, *, ?, &, .)."
      );
    }

    if (errors.length > 0) {
      return res.status(400).json({
        message: `Password does not meet requirements! ${errors.join("\n")}`,
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        message: "Confirm is not match password!",
      });
    }

    const hashPassword = await bcrypt.hashSync(password, salt);

    const newUser = await AdminModel.create({
      email: email,
      password: hashPassword,
      firstName: firstName,
      lastName: lastName,
      workplace: workplace,
    });

    if (newUser) {
      const otp = otpGenerator.generate(6, {
        digits: true,
        lowerCaseAlphabets: false,
        upperCaseAlphabets: false,
        specialChars: false,
      });

      const mailOptions = {
        from: "info@test.com",
        to: email,
        subject: "Verify email",
        text: `Hi ${firstName} ${lastName}. Otp to verify email is: ${otp}`,
      };

      await transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          throw new Error("Error sending email");
        } else {
          console.log("Email sent: " + info.response);

          return res.status(200).json({
            message: "Create account is successful!",
          });
        }
      });
    } else {
      return res.status(400).json({
        message: "Create account is failed!",
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const verifyEmail = async (req, res, next) => {
  try {
    let otp = req.body.otp;
    if (!otp) {
      return res.status(400).json({
        message: "OTP is required!",
      });
    }
    otp = otp.trim();

    const checkOtp = await OtpModel.findOne({
      otp: otp,
      purpose: "verifyEmail",
    });

    if (!checkOtp) {
      return res.status(400).json({
        message: "OTP is incorrect! Please check it again!",
      });
    }

    const user = await AdminModel.findOne({ email: checkOtp.email });

    if (!user) {
      return res.status(400).json({
        message: "User is not found!",
      });
    }

    user.verificationStatus.emailVerified = true;
    await user.save();

    const deleteOTP = await OtpModel.findOneAndDelete({
      otp: otp,
      purpose: "verifyEmail",
    });

    if (user && deleteOTP) {
      const mailOptions = {
        from: "info@test.com",
        to: checkOtp.email,
        subject: "Your email is verify!",
        text: `Your email is verify! Now you can acccess!`,
      };

      await transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          throw new Error("Error sending email");
        } else {
          console.log("Email sent: " + info.response);
          return res.status(200).json({
            message: "Your email is verify!",
          });
        }
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const resetPassword = async (req, res, next) => {
  try {
    let { otp, password, confirmPassword } = req.body;
    if (!otp) {
      return res.status(400).json({
        message: "Otp is required!",
      });
    }
    otp = otp.trim();

    const user = await OtpModel.findOne({ otp: otp, purpose: "resetPassword" });

    if (!user) {
      return res.status(400).json({
        message: "OTP is not found!",
      });
    }

    const currentDate = new Date();

    if (user.expiresAt < currentDate) {
      return res.status(400).json({
        message: "OTP is expired! Please take a new OTP!",
      });
    }

    if (!password) {
      return res.status(400).json({
        message: "Password is required!",
      });
    }
    password = password.trim();

    const errors = [];
    if (!validator.isLength(password, { min: 8, max: 100 })) {
      errors.push("Password must be between 8 and 100 characters.");
    }

    if (!/[A-Z]/.test(password)) {
      errors.push("Password must include at least one uppercase letter.");
    }

    if (!/[a-z]/.test(password)) {
      errors.push("Password must include at least one lowercase letter.");
    }

    if (!/[0-9]/.test(password)) {
      errors.push("Password must include at least one number.");
    }

    if (!/[@$!%*?&.]/.test(password)) {
      errors.push(
        "Password must include at least one special character (@, $, !, %, *, ?, &, .)."
      );
    }

    if (errors.length > 0) {
      return res.status(400).json({
        message: `Password does not meet requirements! ${errors.join("\n")}`,
      });
    }

    if (!confirmPassword) {
      return res.status(400).json({
        message: "ConfirmPassword is required!",
      });
    }
    confirmPassword = confirmPassword.trim();

    if (password !== confirmPassword) {
      return res.status(400).json({
        message: "Password is not match ConfirmPassword",
      });
    }

    const hashPassword = bcrypt.hashSync(password, salt);

    const changePassword = await AdminModel.findOneAndUpdate(
      {
        email: user.email,
      },
      {
        password: hashPassword,
      },
      { new: true }
    );

    await OtpModel.findOneAndDelete({
      otp: otp,
    });

    if (changePassword) {
      const mailOptions = {
        from: "info@test.com",
        to: user.email,
        subject: "Reset password is successful!",
        text: `Your password is changed. New password is: ${password}`,
      };

      await transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          throw new Error("Error sending email");
        } else {
          console.log("Email sent: " + info.response);
          return res.status(200).json({
            message: "Reset password is successful!",
          });
        }
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    let email = req.body.email;
    if (!email) {
      return res.status(400).json({
        message: "Email is required!",
      });
    }
    email = email.trim();

    const validatorEmail = validator.isEmail(email);

    if (!validatorEmail) {
      return res.status(400).json({
        message: "Invalid email",
      });
    }

    const checkEmail = await AdminModel.findOne({ email: email });

    if (!checkEmail) {
      return res.status(400).json({
        message: "Email is not found!",
      });
    }

    const otp = otpGenerator.generate(6, {
      digits: true,
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false,
    });

    const newOtp = await OtpModel.create({
      email: email,
      otp: otp,
      purpose: "resetPassword",
    });

    if (!newOtp) {
      return res.status(400).json({
        message: "Create OTP failed! Please try it again!",
      });
    }

    const mailOptions = {
      from: "info@test.com",
      to: email,
      subject: "Your OTP Code",
      text: `Otp to reset password is: ${otp}`,
    };

    await transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        throw new Error("Error sending email");
      } else {
        console.log("Email sent: " + info.response);
        return res.status(200).json({
          message: "OTP is sent successful!",
        });
      }
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const dashboard = async (req, res, next) => {
  try {
    // const totalSale = await PaymentModel.find();
    const totalCustomer = await UserModel.countDocuments();
    const totalBooking = await BookingModel.countDocuments();
    const allBooking = await BookingModel.find();
    const totalHotel = await HotelModel.countDocuments();
    const totalTour = await TourModel.countDocuments();
    const totalReview = await ReviewModel.countDocuments();
    const totalSupport = await SupportModel.countDocuments();
    const totalPromotion = await PromotionModel.countDocuments();

    const startOfDay = moment().startOf("day").toDate(); // 00:00:00
    const endOfDay = moment().endOf("day").toDate(); // 23:59:59

    // Truy vấn MongoDB
    const bookingsToday = await BookingModel.find({
      createdAt: {
        $gte: startOfDay, // Lớn hơn hoặc bằng đầu ngày
        $lt: endOfDay, // Nhỏ hơn cuối ngày
      },
    }).sort({ createdAt: -1 }); // Sắp xếp giảm dần để lấy booking mới nhất

    return res.status(200).json({
      totalCustomer: totalCustomer,
      totalBooking: totalBooking,
      totalHotel: totalHotel,
      totalTour: totalTour,
      totalReview: totalReview,
      totalSupport: totalSupport,
      totalPromotion: totalPromotion,
      bookingsToday: bookingsToday,
      allBooking: bookingsToday,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const monthly = async (req, res, next) => {
  try {
    const data = await BookingModel.aggregate([
      // 1. Chỉ lấy booking có status "confirmed" hoặc "completed"
      {
        $match: { status: { $in: ["confirmed", "completed"] } },
      },

      // 2. Lookup để lấy thông tin Room liên kết với bookedRoomId
      {
        $unwind: {
          path: "$bookedRoomId",
          preserveNullAndEmptyArrays: true,
        },
      },

      // 3. Lookup để lấy thông tin User từ userId
      {
        $lookup: {
          from: "user", // Collection User
          localField: "userId",
          foreignField: "_id",
          as: "userDetails",
        },
      },

      // 4. Nhóm dữ liệu theo tháng và năm
      {
        $group: {
          _id: {
            month: { $month: "$createdAt" },
            year: { $year: "$createdAt" },
          },
          totalRevenue: { $sum: "$totalAmount" },
          bookings: { $push: "$$ROOT" }, // Lưu trữ tất cả booking vào mảng
        },
      },

      // 5. Sắp xếp dữ liệu theo thời gian
      {
        $sort: { "_id.year": 1, "_id.month": 1 },
      },
    ]);

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const daily = async (req, res, next) => {
  try {
    const data = await BookingModel.aggregate([
      {
        $match: {
          status: { $in: ["confirmed", "completed"] },
        },
      },
      {
        $group: {
          _id: {
            day: { $dayOfMonth: "$createdAt" },
            month: { $month: "$createdAt" },
            year: { $year: "$createdAt" },
          },
          dailyRevenue: { $sum: "$totalAmount" },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 },
      },
    ]);

    // Chuyển dữ liệu sang định dạng FE cần
    const formattedData = data.map((item) => ({
      day: `${item._id.year}-${String(item._id.month).padStart(
        2,
        "0"
      )}-${String(item._id.day).padStart(2, "0")}`,
      totalRevenue: item.dailyRevenue || 0, // Đảm bảo có giá trị
    }));

    return res.status(200).json(formattedData);
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const bookingMonthly = async (req, res, next) => {
  try {
    const data = await BookingModel.aggregate([
      { $match: { status: { $in: ["confirmed", "completed"] } } },
      { $unwind: "$bookedRoomId" },
      {
        $group: {
          _id: "$bookedRoomId",
          productRevenue: { $sum: "$totalAmount" },
          totalBookings: { $sum: 1 },
        },
      },
      { $sort: { productRevenue: -1 } },
    ]);
    res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const updateProfileUser = async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const file = req.file;

    console.log(req.body);
    let getUser = await UserModel.findById(userId);

    if (!getUser) {
      return res.status(400).json({
        message: "User is found",
      });
    }

    let updateUser = await UserModel.findByIdAndUpdate(userId, req.body);

    if (!file) {
      if (updateUser) {
        return res.status(200).json({
          message: "Update information successful!",
        });
      }
    } else {
      const dataUrl = `data:${file.mimetype};base64,${file.buffer.toString(
        "base64"
      )}`;
      cloudinary.uploader.upload(
        dataUrl,
        {
          public_id: userId,
          resource_type: "auto",
          folder: "booking/user",
          overwrite: true,

          // có thể thêm field folder nếu như muốn tổ chức
        },
        async (err, result) => {
          if (err) {
            return res
              .status(500)
              .json({ error: "File upload failed.", details: err });
          }
          if (result) {
            updateUser.avatar = result.secure_url;
            await updateUser.save();
            return res.status(200).json({
              message: "Update information successful!",
            });
          }
        }
      );
    }
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const userId = req.params.userId;
    await UserModel.findByIdAndDelete({ userId });
    return res.status(200).json({
      message: "Delete user successful",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const deleteAdmin = async (req, res, next) => {
  try {
    const adminId = req.params.adminId;
    // await AdminModel.findByIdAndDelete({ adminId });
    return res.status(200).json({
      message: "Delete user successful",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export {
  verifyEmail,
  deleteUser,
  deleteAdmin,
  getAllAdmin,
  logIn,
  signUp,
  resetPassword,
  forgotPassword,
  dashboard,
  monthly,
  daily,
  bookingMonthly,
  updateProfileUser,
};
