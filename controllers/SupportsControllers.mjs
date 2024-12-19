import SupportModel from "../models/SupportsModel.mjs";
import nodemailer from "nodemailer";

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
    const support = await SupportModel.find().populate("userId");
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

export { getAllSupport, replySupport };
