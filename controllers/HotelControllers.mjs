import HotelModel from "../models/HotelModel.mjs";
import { v2 as cloudinary } from "cloudinary";
import RoomModel from "../models/RoomModel.mjs";

//cloudary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const deleteHotel = async (req, res, next) => {
  try {
    const hotelId = req.params.hotelId;
    await RoomModel.deleteMany({ hotelId: hotelId });
    await HotelModel.findByIdAndDelete(hotelId);
    return res.status(200).json({
      message: "Delete hotel successful",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const getHotel = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const pageSize = parseInt(req.query.pageSize, 10) || 10;

    const total = await HotelModel.countDocuments();

    const hotels = await HotelModel.find()
      .populate("reviewId")
      .skip((page - 1) * pageSize)
      .limit(pageSize);

    return res.status(200).json({
      message: "Get hotel successful",
      data: hotels,
      total: total,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const getAllHotel = async (req, res, next) => {
  try {
    const hotels = await HotelModel.find({});
    return res.status(200).json({
      message: "Get all hotel successful",
      data: hotels,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const editHotel = async (req, res, next) => {
  try {
    const hotelId = req.params.hotelId;
    const avatar = req.files?.avatar?.[0];

    const hotel = await HotelModel.findById(hotelId);

    if (!hotel) {
      return res.status(400).json({
        message: "Hotel is not found!",
      });
    }

    const update = await HotelModel.findByIdAndUpdate(hotelId, req.body, {
      new: true,
    });

    if (avatar) {
      const dataUrl = `data:${avatar.mimetype};base64,${avatar.buffer.toString(
        "base64"
      )}`;

      const result = await cloudinary.uploader.upload(dataUrl, {
        public_id: `${update._id}_avatar`,
        resource_type: "auto",
        folder: `booking/hotel/${update._id}`,
        overwrite: true,
      });

      if (result) {
        update.imgHotel.avatar = result.secure_url;
        await update.save();
        return res.status(200).json({
          message: "Update hotel successful",
        });
      }
    }

    if (update) {
      return res.status(200).json({
        message: "Update hotel successful",
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const searchHotel = () => {
  try {
    const { location, checkIn, checkOut, adults, children, room } = res.query;
  } catch (error) {}
};

const addHotel = async (req, res, next) => {
  try {
    const avatar = req.files?.avatar?.[0];
    const listFile = req.files?.arrImg || [];
    const listImg = [];
    const hotel = await HotelModel.create(req.body);

    const dataUrl = `data:${avatar.mimetype};base64,${avatar.buffer.toString(
      "base64"
    )}`;

    const result = await cloudinary.uploader.upload(dataUrl, {
      public_id: `${hotel._id}_avatar`,
      resource_type: "auto",
      folder: `booking/hotel/${hotel._id}`,
      overwrite: true,
    });

    if (result) {
      hotel.imgHotel.avatar = result.secure_url;
      await hotel.save();
    }

    if (!listFile) {
      return res.status(200).json({
        message: "Add hotel successful",
      });
    }

    for (const file in listFile) {
      const dataUrl = `data:${listFile[file].mimetype};base64,${listFile[
        file
      ].buffer.toString("base64")}`;

      const result = await cloudinary.uploader.upload(dataUrl, {
        public_id: `${hotel._id}_${file}`,
        resource_type: "auto",
        folder: `booking/hotel/${hotel._id}`,
        overwrite: true,
      });

      if (result) {
        listImg.push(result.secure_url);
      }
    }

    hotel.imgHotel.img = listImg;
    await hotel.save();

    return res.status(200).json({
      message: "Add hotel successful",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const getHotelById = async (req, res, next) => {
  try {
    const hotel = await HotelModel.findOne({
      _id: req.params.hotelId,
    })
      .populate("roomId")
      .populate({
        path: "reviewId",
        populate: [{ path: "userId" }],
      });
    return res.status(200).json({
      message: "Get hotel successful",
      data: hotel,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const getHotelList = async (req, res, next) => {
  try {
    console.log(req.body);
    const page = req.body.page;
    const query = req.body.query;
    const hotels = await HotelModel.find({
      // "address.city":  req.body.place ,
    });

    return res.status(200).json({
      message: "Get all hotel successful",
      data: hotels,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const getHotelListByQuery = async (req, res, next) => {
  try {
    console.log(req.body);
    const page = req.body.page;
    const limit = req.body.limit;
    const place = req.body.place;
    const bodyQuery = place
      ? { hotelName: { $regex: place, $options: "i" } }
      : {};
    const hotels = await HotelModel.find(bodyQuery)
      .populate("roomId")
      .populate("reviewId")
      .sort({
        createdAt: -1,
      })
      .limit(limit)
      .skip(limit * page);

    return res.status(200).json({
      message: "Get all hotel successful",
      data: hotels,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};
const getMinPrice = async (req, res, next) => {
  try {
    console.log(req.body);
    const page = req.body.page;
    const query = req.body.query;
    const hotels = await HotelModel.find({
      // "address.city":  req.body.place ,
    });

    return res.status(200).json({
      message: "Get all hotel successful",
      data: hotels,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};
export {
  searchHotel,
  addHotel,
  getHotel,
  getAllHotel,
  editHotel,
  deleteHotel,
  getHotelById,
  getHotelList,
  getHotelListByQuery,
};
