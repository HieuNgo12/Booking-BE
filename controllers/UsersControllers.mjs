import UserModel from "../models/UsersModel.mjs";
import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import { v2 as cloudinary } from "cloudinary";
import otpGenerator from "otp-generator";
import OtpModel from "../models/OtpModel.mjs";
import SupportModel from "../models/SupportsModel.mjs";

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

//cloudary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const changePassword = async (req, res, next) => {
  try {
    let { currentPassword, newPassword, confirmNewPassword } = req.body;
    const userId = req.user.id;
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(400).json({
        message: "Please log in first!",
      });
    }

    if (!currentPassword) {
      return res.status(400).json({
        message: "Password is required!",
      });
    }
    currentPassword = currentPassword.trim();

    const hashingPassword = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!hashingPassword) {
      return res.status(400).json({
        message: "Current password is incorrect!",
      });
    }

    if (!newPassword) {
      return res.status(400).json({
        message: "New password is required!",
      });
    }
    newPassword = newPassword.trim();

    if (!confirmNewPassword) {
      return res.status(400).json({
        message: "Confirm is required!",
      });
    }
    confirmNewPassword = confirmNewPassword.trim();

    const errors = [];
    if (!validator.isLength(newPassword, { min: 8, max: 100 })) {
      errors.push("New Password must be between 8 and 100 characters.");
    }

    if (!/[A-Z]/.test(newPassword)) {
      errors.push("New Password must include at least one uppercase letter.");
    }

    if (!/[a-z]/.test(newPassword)) {
      errors.push("New Password must include at least one lowercase letter.");
    }

    if (!/[0-9]/.test(newPassword)) {
      errors.push("New Password must include at least one number.");
    }

    if (!/[@$!%*?&.]/.test(newPassword)) {
      errors.push(
        "New Password must include at least one special character (@, $, !, %, *, ?, &, .)."
      );
    }

    if (errors.length > 0) {
      return res.status(400).json({
        message: `New password does not meet requirements! ${errors.join(
          "\n"
        )}`,
      });
    }

    if (currentPassword === confirmNewPassword) {
      return res.status(400).json({
        message: "Current password is not match new passowrd!",
      });
    }

    console.log("check");

    const hashingNewPassword = await bcrypt.compare(newPassword, user.password);

    if (hashingNewPassword) {
      return res.status(400).json({
        message: "Confirm is not match password!",
      });
    }

    const hashPassword = await bcrypt.hashSync(newPassword, salt);

    const updatePassword = await UserModel.findByIdAndUpdate(userId, {
      password: hashPassword,
    });

    if (updatePassword) {
      return res.status(200).json({
        message: "Change password successful!",
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const profile = async (req, res, next) => {
  try {
    const user = req.user;
    const getUser = await UserModel.findById(user.id);
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
    const userId = req.user.id;
    const file = req.file;
    const {
      firstName,
      lastName,
      gender,
      DOB,
      nationality,
      street,
      ward,
      district,
      city,
      country,
      checkPassword,
    } = req.body;

    let dataUser = {
      firstName: firstName,
      lastName: lastName,
      gender: gender,
      DOB: DOB,
      nationality: nationality,
      address: {
        street: street,
        ward: ward,
        district: district,
        city: city,
        country: country,
      },
    };

    let getUser = await UserModel.findById(userId);

    if (!getUser) {
      return res.status(400).json({
        message: "User is found",
      });
    }

    const hashingPasswordLogin = await bcrypt.compare(
      checkPassword,
      getUser.password
    );

    if (!hashingPasswordLogin) {
      return res.status(400).json({
        message: "Password is incorrect",
      });
    }

    if (!file) {
      const updateUser = await UserModel.findByIdAndUpdate(userId, dataUser, {
        new: true,
      });

      if (updateUser) {
        const userDataAccessToken = {
          id: updateUser._id,
          email: updateUser.email,
          firstName: updateUser.firstName,
          lastName: updateUser.lastName,
          avatar: updateUser.avatar,
        };

        const accessToken = jwt.sign(userDataAccessToken, process.env.KEY_JWT, {
          expiresIn: "5m",
        });

        res.cookie("accessToken", accessToken, {
          httpOnly: false,
          path: "/",
          maxAge: 5 * 60 * 1000,
        });
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
            console.log(result.secure_url);
            // lấy secure_url từ đây để lưu vào database.
            dataUser = { ...dataUser, avatar: result.secure_url };
            const updateAvatar = await UserModel.findByIdAndUpdate(
              userId,
              dataUser,
              {
                new: true,
              }
            );
            if (updateAvatar) {
              const userDataAccessToken = {
                id: updateAvatar._id,
                email: updateAvatar.email,
                firstName: updateAvatar.firstName,
                lastName: updateAvatar.lastName,
                avatar: updateAvatar.avatar,
              };

              const accessToken = jwt.sign(
                userDataAccessToken,
                process.env.KEY_JWT,
                {
                  expiresIn: "5m",
                }
              );

              res.cookie("accessToken", accessToken, {
                httpOnly: false,
                path: "/",
                maxAge: 5 * 60 * 1000,
              });

              return res.status(200).json({
                message: "Update information successful!",
              });
            }
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

const changePhone = async (req, res, next) => {
  try {
    const phone = req.body.phone;
    const userId = req.user.id;

    if (!phone) {
      return res.status(400).json({
        message: "Phone is required!",
      });
    }

    let user = await UserModel.findById(userId);

    if (!user) {
      return res.status(400).json({
        message: "User not found",
      });
    }

    user.phone = phone;
    user.verificationStatus.phoneVerified = true;
    const updateUser = await user.save();

    if (updateUser) {
      return res.status(200).json({
        message: "Update phone successful",
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const sentToNewEmail = async (req, res, next) => {
  try {
    let newEmail = req.body.newEmail;
    const currentEmail = req.user.email;

    if (!newEmail) {
      return res.status(400).json({
        message: "Email is required!",
      });
    }
    newEmail = newEmail.trim();

    const validatorEmail = validator.isEmail(newEmail);

    if (!validatorEmail) {
      return res.status(400).json({
        message: "Invalid email",
      });
    }

    if (newEmail === currentEmail) {
      return res.status(200).json({
        message: "New email is not match current email!",
      });
    }

    const checkEmail = await UserModel.findOne({ email: newEmail });

    if (checkEmail) {
      return res.status(400).json({
        message: "Email already exists",
      });
    }

    const otp = otpGenerator.generate(6, {
      digits: true,
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false,
    });

    const createOtp = await OtpModel.create({
      otp: otp,
      email: currentEmail,
      purpose: "changeEmail",
      data: newEmail,
    });

    if (createOtp) {
      const mailOptions = {
        from: "info@test.com",
        to: currentEmail,
        subject: "Change email",
        text: `Otp to change email is: ${otp}`,
      };

      await transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          throw new Error("Error sending email");
        } else {
          console.log("Email sent: " + info.response);
          return res.status(200).json({
            message: "OTP to change email is sent. Please check your email!",
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

const changeEmail = async (req, res, next) => {
  try {
    let { newEmail, otp } = req.body;
    const currentEmail = req.user.email;

    if (!newEmail) {
      return res.status(400).json({
        message: "Email is required!",
      });
    }
    newEmail = newEmail.trim();

    if (!otp) {
      return res.status(400).json({
        message: "Otp is required!",
      });
    }
    newEmail = newEmail.trim();

    const checkOtp = await OtpModel.findOne({
      otp: otp,
      email: currentEmail,
      purpose: "changeEmail",
    });

    if (!checkOtp) {
      return res.status(400).json({
        message: "otp is incorrect!",
      });
    }

    if (newEmail !== checkOtp.data) {
      return res.status(400).json({
        message: "New email is inccorect!",
      });
    }

    const findUser = await UserModel.findByIdAndUpdate(req.user.id);

    if (!findUser) {
      return res.status(400).json({
        message: "User is not found!",
      });
    }

    findUser.email = newEmail;
    findUser.verificationStatus.emailVerified = false;

    await findUser.save();

    if (findUser) {
      const otpToVerify = otpGenerator.generate(6, {
        digits: true,
        lowerCaseAlphabets: false,
        upperCaseAlphabets: false,
        specialChars: false,
      });

      const createOtp = await OtpModel.create({
        otp: otpToVerify,
        email: currentEmail,
        purpose: "verifyEmail",
      });

      if (createOtp) {
        const mailOptions = {
          from: "info@test.com",
          to: newEmail,
          subject: "Your OTP Code",
          text: `Otp to verify email is: ${otp}`,
        };

        await transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            throw new Error("Error sending email");
          } else {
            console.log("Email sent: " + info.response);
            console.log("check");
            return res.status(200).json({
              message:
                "Please verify email first! OTP is sent! Please check your email!",
              emailVerified: false,
            });
          }
        });
        return res.status(200).json({
          message:
            "Please verify email first! OTP is sent! Please check your email!",
          emailVerified: false,
        });
      }
    }
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const changeCurrency = async (req, res, next) => {
  try {
    let currency = req.body.currency;
    const userId = req.user.id;
    if (!currency) {
      return res.status(400).json({
        message: "currency is required!",
      });
    }
    currency = currency.trim();

    const user = await UserModel.findById(userId);

    if (!user) {
      return res.status(400).json({
        message: "User is not found!",
      });
    }

    user.currency = currency;
    await user.save();

    if (user) {
      return res.status(200).json({
        message: "Change currency successful!",
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const changeLanguage = async (req, res, next) => {
  try {
    let language = req.body.language;
    const userId = req.user.id;

    if (!language) {
      return res.status(400).json({
        message: "language is required!",
      });
    }
    language = language.trim();

    const user = await UserModel.findById(userId);

    if (!user) {
      return res.status(400).json({
        message: "User is not found!",
      });
    }

    user.language = language;
    await user.save();

    if (user) {
      return res.status(200).json({
        message: "Change language successful!",
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const changePaymentMethod = async (req, res, next) => {
  try {
    let { cardNumber, nameOnCard, expDate } = req.body;
    const userId = req.user.id;

    console.log(req.body);
    if (!cardNumber) {
      return res.status(400).json({
        message: "Card Number is required!",
      });
    }
    cardNumber = cardNumber.trim();

    if (!nameOnCard) {
      return res.status(400).json({
        message: "Name On Card is required!",
      });
    }
    nameOnCard = nameOnCard.trim();

    if (!expDate) {
      return res.status(400).json({
        message: "Expiry Date is required!",
      });
    }
    expDate = expDate.trim();

    const user = await UserModel.findById(userId);

    if (!user) {
      return res.status(400).json({
        message: "User is not found!",
      });
    }

    user.paymentMethods.card.cardNumber = cardNumber;
    user.paymentMethods.card.nameOnCard = nameOnCard;
    user.paymentMethods.card.expDate = expDate;
    await user.save();

    if (user) {
      return res.status(200).json({
        message: "Change paymentMethods successful!",
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const changeOnlineWallet = async (req, res, next) => {
  try {
    let { phone } = req.body;
    const userId = req.user.id;

    if (!phone) {
      return res.status(400).json({
        message: "Phone  is required!",
      });
    }
    phone = phone.trim();

    const user = await UserModel.findById(userId);

    if (!user) {
      return res.status(400).json({
        message: "User is not found!",
      });
    }

    user.paymentMethods.onlineWallet.phone = phone;
    await user.save();

    if (user) {
      return res.status(200).json({
        message: "Change paymentMethods successful!",
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const changeIdCard = async (req, res, next) => {
  try {
    let { number, fullName, DOI, POI } = req.body;
    const userId = req.user.id;

    if (!number) {
      return res.status(400).json({
        message: "Number ID is required!",
      });
    }
    number = number.trim();

    if (!fullName) {
      return res.status(400).json({
        message: "Full Name is required!",
      });
    }
    fullName = fullName.trim();

    if (!DOI) {
      return res.status(400).json({
        message: "DOI is required!",
      });
    }
    DOI = DOI.trim();

    if (!POI) {
      return res.status(400).json({
        message: "POI is required!",
      });
    }
    POI = POI.trim();

    const user = await UserModel.findById(userId);

    if (!user) {
      return res.status(400).json({
        message: "User is not found!",
      });
    }

    user.idCard.number = number;
    user.idCard.fullName = fullName;
    user.idCard.DOI = DOI;
    user.idCard.POI = POI;
    await user.save();

    if (user) {
      return res.status(200).json({
        message: "Change ID Card successful!",
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const sentEmailSupport = async (req, res, next) => {
  try {
    let { message, subject, email, name } = req.body;
    const user = req.user;
    const listFile = req.files;
    const listResult = [];
    const listImageCid = [];

    if (!message) {
      return res.status(400).json({
        message: "Message is required!",
      });
    }
    message = message.trim();

    if (!subject) {
      return res.status(400).json({
        message: "Subject is required!",
      });
    }
    subject = subject.trim();

    if (user.email !== email) {
      return res.status(400).json({
        message: "Please log in again!",
      });
    }

    const createSupport = await SupportModel.create({
      userId: user.id,
      message: message,
    });

    if (!listFile || listFile.length === 0) {
      if (createSupport) {
        const mailOptions = {
          from: "info@test.com",
          to: email,
          subject: subject,
          text: `Dear ${name} ${message} `,
        };

        await transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            throw new Error("Error sending email");
          } else {
            console.log("Email sent: " + info.response);
            return res.status(200).json({
              message: "Email is sent!",
            });
          }
        });
      }
    }

    for (const file in listFile) {
      console.log(file);
      const dataUrl = `data:${listFile[file].mimetype};base64,${listFile[
        file
      ].buffer.toString("base64")}`;

      const imageCid = `image-${createSupport._id}_${file}`;
      listImageCid.push(imageCid);
      console.log(listImageCid);

      const result = await cloudinary.uploader.upload(dataUrl, {
        public_id: `${createSupport._id}_${file}`,
        resource_type: "auto",
        folder: `booking/support/${createSupport._id}`,
        overwrite: true,
      });
      listResult.push(result.secure_url);

      console.log(listFile.length - 1);

      if (Number(file) === listFile.length - 1) {
        createSupport.listImg = listResult;
        await createSupport.save();
        console.log("check");
        const mailOptions = {
          from: "info@test.com",
          to: email,
          subject: subject,
          attachments: listResult.map((url, index) => ({
            filename: `${createSupport._id}_${index}`,
            path: url,
            cid: listImageCid[index],
          })),
          html: `
          <b>Dear ${name},</b>
          <b>Your request:</b>
          ${listImageCid
            .map(
              (cid) =>
                `<img src="cid:${cid}" style="width: 300px; height: 200px; object-fit: cover;" />`
            )
            .join("")}
          <div>${message}</div>
          <div>Your message will be processed soon. We will support you in at least 3 business days.</div>
        `,
        };

        const sentEmail = await transporter.sendMail(mailOptions);

        if (sentEmail)
          return res.status(200).json({
            message: "Email is sent!",
          });
      }
    }
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const getAllUsers = async (req, res, next) => {
  try {
    const users = await UserModel.find().populate("reviewId");
    return res.status(200).json({
      message: "Get all users",
      data: users,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export {
  profile,
  changePhone,
  changeEmail,
  changeIdCard,
  updateProfile,
  changePassword,
  sentToNewEmail,
  changeCurrency,
  changeLanguage,
  sentEmailSupport,
  changeOnlineWallet,
  changePaymentMethod,
  getAllUsers,
};
