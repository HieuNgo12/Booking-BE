import TourModel from "../models/TourModel.mjs";

import { v2 as cloudinary } from "cloudinary";

//cloudary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const deleteTour = async (req, res, next) => {
  try {
    const tourId = req.params.tourId;
    await TourModel.findByIdAndDelete({ tourId });
    return res.status(200).json({
      message: "Delete tour successful",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const getTour = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 10;
    const pageSize = parseInt(req.query.pageSize, 10) || 10;

    const total = await TourModel.countDocuments();
    const getTour = await TourModel.find()
      .skip((page - 1) * pageSize)
      .limit(pageSize);

    return res.status(200).json({
      message: "Get tour successful",
      data: getTour,
      total: total,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const editTour = async (req, res, next) => {
  try {
    const tourId = req.params.tourId;
    const avatar = req.files?.avatar?.[0];

    const tour = await TourModel.findById(tourId);

    if (!tour) {
      return res.status(400).json({
        message: "Tour is not found!",
      });
    }

    const update = await TourModel.findByIdAndUpdate(tourId, req.body, {
      new: true,
    });

    if (avatar) {
      const dataUrl = `data:${avatar.mimetype};base64,${avatar.buffer.toString(
        "base64"
      )}`;

      const result = await cloudinary.uploader.upload(dataUrl, {
        public_id: `${update._id}_avatar`,
        resource_type: "auto",
        folder: `booking/tour/${update._id}`,
        overwrite: true,
      });

      console.log("check");

      if (result) {
        update.imgTour.avatar = result.secure_url;
        await update.save();

        return res.status(200).json({
          message: "Update tour successful",
        });
      }
    }

    if (update) {
      return res.status(200).json({
        message: "Update tour successful",
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const searchTour = () => {
  try {
    const { location, checkIn, checkOut, adults, children, room } = res.query;
  } catch (error) {}
};

const addTour = async (req, res, next) => {
  try {
    const avatar = req.files?.avatar?.[0];
    const listFile = req.files?.files || [];
    const listImg = [];

    const tour = await TourModel.create(req.body);

    const dataUrl = `data:${avatar.mimetype};base64,${avatar.buffer.toString(
      "base64"
    )}`;

    const result = await cloudinary.uploader.upload(dataUrl, {
      public_id: `${tour._id}_avatar`,
      resource_type: "auto",
      folder: `booking/tour/${tour._id}`,
      overwrite: true,
    });

    if (result) {
      tour.imgTour.avatar = result.secure_url;
      await tour.save();
    }

    if (!listFile) {
      return res.status(200).json({
        message: "Add tour successful",
      });
    }

    for (const file in listFile) {
      const dataUrl = `data:${listFile[file].mimetype};base64,${listFile[
        file
      ].buffer.toString("base64")}`;

      const result = await cloudinary.uploader.upload(dataUrl, {
        public_id: `${tour._id}_${file}`,
        resource_type: "auto",
        folder: `booking/tour/${tour._id}`,
        overwrite: true,
      });

      if (result) {
        listImg.push(result.secure_url);
      }
    }

    tour.imgTour.listTour = listImg;
    await tour.save();

    return res.status(200).json({
      message: "Add tour successful",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export { searchTour, addTour, getTour, deleteTour, editTour };
