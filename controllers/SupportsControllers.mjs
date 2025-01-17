import SupportModel from "../models/SupportsModel.mjs";
import nodemailer from "nodemailer";
import mongoose from "mongoose";
import UserModel from "../models/UsersModel.mjs";

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

const getAllSupport = async (req, res, next) => {
  try {
    const support = await SupportModel.find()
      .populate("userId")
      .populate("adminId");
    return res.status(200).json({
      message: "Get support successfuly",
      data: support,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const getSupportByUserId = async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const test = mongoose.Types.ObjectId(userId);
    console.log(test);
    const support = await SupportModel.find({ userId: test })
      .populate("userId")
      .populate("adminId");

    console.log(support);
    return res.status(200).json({
      message: "Get support successfuly",
      data: support,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const getSupportBySupportId = async (req, res, next) => {
  try {
    const supportId = req.params.supportId;
    const support = await SupportModel.findById(supportId)
      .populate("userId")
      .populate("adminId");

    console.log(support);
    return res.status(200).json({
      message: "Get support successfuly",
      data: support,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const replySupport = async (req, res, next) => {
  try {
    let { messageReply, subject } = req.body;
    const supportId = req.params.supportId;
    const adminId = req.user.id;
    const listFile = req.files;
    const listResult = [];
    const listImageCid = [];

    if (!messageReply) {
      return res.status(400).json({
        message: "Message is required!",
      });
    }
    messageReply = messageReply.trim();

    if (!subject) {
      return res.status(400).json({
        message: "Subject is required!",
      });
    }
    subject = subject.trim();

    let createSupport = await SupportModel.findById(supportId);

    const user = await UserModel.findById(createSupport.userId);

    createSupport.reply.messageReply = messageReply;
    createSupport.adminId = mongoose.Types.ObjectId(adminId);
    createSupport.statusReply = true;

    await createSupport.save();

    if (!listFile || listFile.length === 0) {
      const mailOptions = {
        from: "info@test.com",
        to: user.email,
        subject: subject,
        text: `Dear  ${messageReply} `,
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

    for (const file in listFile) {
      const dataUrl = `data:${listFile[file].mimetype};base64,${listFile[
        file
      ].buffer.toString("base64")}`;

      const imageCid = `image-${createSupport._id}_${file}`;
      listImageCid.push(imageCid);

      const result = await cloudinary.uploader.upload(dataUrl, {
        public_id: `${createSupport._id}_${file}`,
        resource_type: "auto",
        folder: `booking/support/${createSupport._id}`,
        overwrite: true,
      });
      listResult.push(result.secure_url);

      if (Number(file) === listFile.length - 1) {
        createSupport.listImg = listResult;
        await createSupport.save();

        const mailOptions = {
          from: "info@test.com",
          to: user.email,
          subject: subject,
          attachments: listResult.map((url, index) => ({
            filename: `${createSupport._id}_${index}`,
            path: url,
            cid: listImageCid[index],
          })),
          html: `
            <b>Your request:</b>
            ${listImageCid
              .map(
                (cid) =>
                  `<img src="cid:${cid}" style="width: 300px; height: 200px; object-fit: cover;" />`
              )
              .join("")}
            <div>${messageReply}</div>
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

export {
  getAllSupport,
  replySupport,
  getSupportByUserId,
  getSupportBySupportId,
};
