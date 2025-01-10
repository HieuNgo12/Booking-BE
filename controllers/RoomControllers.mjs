import RoomModel from "../models/RoomModel.mjs";
import mongoose from "mongoose";
import { v2 as cloudinary } from "cloudinary";
import HotelModel from "../models/HotelModel.mjs";

//cloudary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const deleteRoom = async (req, res, next) => {
  try {
    const roomId = req.params.roomId;
    await RoomModel.findByIdAndDelete({ roomId });
    return res.status(200).json({
      message: "Delete room successful",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const getRoom = async (req, res, next) => {
  try {
    const rooms = await RoomModel.find().populate("hotelId");
    if (rooms) {
      return res.status(200).json({
        message: "Get room successful",
        data: rooms,
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const getRoomByHotelId = async (req, res, next) => {
  try {
    const hotelId = req.query.hotelId;
    console.log(hotelId);
    const rooms = await RoomModel.find().populate("hotelId");
    console.log(rooms);
    const filterRooms = rooms.filter(
      (item) => item.hotelId._id.toString() === hotelId
    );

    if (rooms) {
      return res.status(200).json({
        message: "Get room successful",
        data: filterRooms,
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

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
    const room = await RoomModel.findOne({ _id: req.params.roomId }).populate(
      "hotelId"
    );
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
const searchRoom = async (req, res, next) => {
  try {
    const hotel = await HotelModel.find({
      "address.city": { $regex: req.body.place },
    });
    console.log(hotel[0]._id);
    let roomList = [];
    for (let i = 0; i < hotel.length; i++) {
      const page = req.query.page;
      const query = req.query.query;
      let room = await RoomModel.find({ hotelId: hotel[i]._id }).populate(
        "hotelId"
      );
      roomList.push(room);
    }
    // console.log(room);
    // console.log(room);
    return res.status(200).json({
      message: "Successfully get room",
      data: roomList,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const editRoom = async (req, res, next) => {
  try {
    const roomId = req.params.roomId;
    const avatar = req.files?.avatar?.[0];

    const room = await RoomModel.findById(roomId);

    if (!room) {
      return res.status(400).json({
        message: "Room is not found!",
      });
    }

    const update = await RoomModel.findByIdAndUpdate(roomId, req.body, {
      new: true,
    });

    if (avatar) {
      const dataUrl = `data:${avatar.mimetype};base64,${avatar.buffer.toString(
        "base64"
      )}`;

      const result = await cloudinary.uploader.upload(dataUrl, {
        public_id: `${update._id}_avatar`,
        resource_type: "auto",
        folder: `booking/room/${update._id}`,
        overwrite: true,
      });

      if (result) {
        update.imgRoom.avatar = result.secure_url;
        await update.save();
        return res.status(200).json({
          message: "Update room successful",
        });
      }
    }

    if (update) {
      return res.status(200).json({
        message: "Update room successful",
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
  getRoom,
  createRoom,
  getRoomByHotelId,
  editRoom,
  deleteRoom,
  getRoomList,
  getRoomById,
  searchRoom,
};
