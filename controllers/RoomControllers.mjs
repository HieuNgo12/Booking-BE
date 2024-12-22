import RoomModel from "../models/RoomModel.mjs";
import mongoose from "mongoose";
import { v2 as cloudinary } from "cloudinary";

//cloudary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const createRoom = async (req, res, next) => {
  try {
    const listImg = [];
    const avatar = req.files?.avatar?.[0];
    const listFile = req.files?.files || [];
    const hotelIdObject = mongoose.Types.ObjectId(req.body.hotelId);
    const newList = { ...req.body, hotelId: hotelIdObject };

    const room = await RoomModel.create(newList);

    const dataUrl = `data:${avatar.mimetype};base64,${avatar.buffer.toString(
      "base64"
    )}`;

    const result = await cloudinary.uploader.upload(dataUrl, {
      public_id: `${room._id}_avatar`,
      resource_type: "auto",
      folder: `booking/room/${room._id}`,
      overwrite: true,
    });

    if (result) {
      room.imgRoom.avatar = result.secure_url;
      await room.save();
    }

    if (!listFile) {
      return res.status(200).json({
        message: "Add room successful",
      });
    }

    for (const file in listFile) {
      const dataUrl = `data:${listFile[file].mimetype};base64,${listFile[
        file
      ].buffer.toString("base64")}`;

      const result = await cloudinary.uploader.upload(dataUrl, {
        public_id: `${room._id}_${file}`,
        resource_type: "auto",
        folder: `booking/room/${room._id}`,
        overwrite: true,
      });

      if (result) {
        listImg.push(result.secure_url);
      }
    }

    room.imgRoom.img = listImg;
    await room.save();

    return res.status(200).json({
      message: "Add room successful",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const getRoomById = async (req, res, next) => {
  try {
    const room = await RoomModel.findOne({ _id: req.params.roomId }).populate("hotelId");
    return res.status(200).json({
      message: "Successfully get room",
      data: room,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};
const getRoomList = async (req, res, next) => {
  try {
    const room = await RoomModel.find({}).populate("hotelId");
    return res.status(200).json({
      message: "Successfully get room",
      data: room,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export { createRoom, getRoomById, getRoomList };
