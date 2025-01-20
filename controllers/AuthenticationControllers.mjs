import UserModel from "../models/UsersModel.mjs";
import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import otpGenerator from "otp-generator";
import Vonage from "@vonage/server-sdk";
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

// twillio
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
// const client = twilio(accountSid, authToken);
// const message = await client.messages.create({
//   body: "test",
//   from: "+12028319342",
//   to: "+84985671678",
// });

// vonage
// const vonage = new Vonage({
//   apiKey: process.env.KEY_VONAGE,
//   apiSecret: process.env.PASS_VONAGE,
// });

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

    let checkEmail = await UserModel.findOne({ email: email });

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

    if (hashingPasswordLogin && checkEmail.role === "user") {
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
        // secure: false,
        // sameSite: "None",
        maxAge: 5 * 60 * 1000,
      });

      res.cookie("refreshToken", refreshToken, {
        httpOnly: false,
        path: "/",
        // secure: false,
        // sameSite: "None",
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

const logInByGG = async (req, res, next) => {
  try {
    let { email, password } = req.body;

    if (email) {
      res.status(400).json({
        message: "Email is required!",
      });
    }
    email = email.trim();

    if (password) {
      res.status(400).json({
        message: "Password is required!",
      });
    }
    password = password.trim();

    let checkEmail = await UserModel.findOne({ email: email });

    if (!checkEmail) {
      res.status(400).json({
        message: "Email is incorrect! Please check your email again!",
      });
    }

    const hashingPasswordLogin = bcrypt.hashSync(password, checkEmail.salt);

    const currentDate = new Date();
    const MAX_TIME_SUSPENDED = 5 * 60 * 1000;

    if (checkEmail.timeSuspended) {
      const checkTimeSuspend = checkEmail.timeSuspended + MAX_TIME_SUSPENDED;
      if (checkTimeSuspend < currentDate) {
        res.status(400).json({
          message:
            "Your account will be automatically locked during 5 mins. Please log in after 5 mins again!",
        });
      }
    }

    if (hashingPasswordLogin !== password) {
      let attmept = checkEmail.logInAttempt;
      attmept = attmept - 1;
      checkEmail = {
        logInAttempt: count,
      };
      await checkEmail.save();
      res.status(400).json({
        message: `Password is incorrect! Please check your password again! After 5 incorrect entries, your account will be automatically locked! You have ${count} times left to try!`,
      });
    }

    if (checkEmail.logInAttempt === 0) {
      checkEmail = {
        timeSuspended: currentDate,
      };
      await checkEmail.save();
    }

    if (hashingPasswordLogin === password && role === "user") {
      checkEmail = {
        logInAttempt: 5,
        timeSuspended: null,
      };
      const userData = {
        sub: checkEmail._id,
        email: checkEmail.email,
        emailVerified: checkEmail.verificationStatus.emailVerified,
        role: checkEmail.role,
      };

      const token = jwt.sign(userData, process.env.KEY_JWT, {
        expiresIn: "1h",
      });
      res.cookie("accessToken", token, {
        httpOnly: true,
        secure: false,
        path: "/",
        sameSite: "None",
        maxAge: 3600000,
      });
      res.status(200).json({
        message: "Log in is successful!",
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
    let { email, password, firstName, lastName, confirmPassword } = req.body;
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

    const checkEmail = await UserModel.findOne({ email: email });
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

    const newUser = await UserModel.create({
      email: email,
      password: hashPassword,
      firstName: firstName,
      lastName: lastName,
    });

    if (newUser) {
      const otp = otpGenerator.generate(6, {
        digits: true,
        lowerCaseAlphabets: false,
        upperCaseAlphabets: false,
        specialChars: false,
      });

      await OtpModel.create({
        otp: otp,
        email: email,
        purpose: "verifyEmail",
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

    const changePassword = await UserModel.findOneAndUpdate(
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

    const checkEmail = await UserModel.findOne({ email: email });

    if (!checkEmail) {
      return res.status(400).json({
        message: "Email is not found!",
      });
    }

    const checkOTP = await OtpModel.findOne({
      email: email,
      purpose: "resetPassword",
    });

    if (checkOTP) {
      const currentDate = new Date();
      const MAX_TIME = 5 * 60 * 1000;

      if (currentDate - checkOTP.createdAt < MAX_TIME) {
        const mailOptions = {
          from: "info@test.com",
          to: email,
          subject: "Your OTP Code",
          text: `Otp to reset password is: ${checkOTP.otp}`,
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
      } else {
        const otp = otpGenerator.generate(6, {
          digits: true,
          lowerCaseAlphabets: false,
          upperCaseAlphabets: false,
          specialChars: false,
        });

        const createOtp = await OtpModel.create({
          email: email,
          otp: otp,
          purpose: "resetPassword",
        });

        if (!createOtp) {
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
      }
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

    const user = await UserModel.findOne({ email: checkOtp.email });

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

export { logIn, logInByGG, signUp, resetPassword, forgotPassword, verifyEmail };
