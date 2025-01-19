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
    await TourModel.findByIdAndDelete(tourId);
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
      .populate("reviewId")
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

const getAllTour = async (req, res, next) => {
  try {
    const getTour = await TourModel.find().populate("reviewId");

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

const searchTour = async (req, res) => {
  try {
    console.log("Received endDestination:", req.query.endDestination);
    console.log(
      "Received transportationMethod:",
      req.query.transportationMethod
    );
    const query = {};

    if (req.query.endDestination) {
      query["inforLocation.endDestination"] = new RegExp(
        req.query.endDestination,
        "i"
      );
    }

    if (req.query.startDateBooking) {
      query.startDateBooking = { $gte: new Date(req.query.startDateBooking) };
    }

    if (req.query.budget) {
      query.price = { $lte: parseFloat(req.query.budget) };
    }

    if (req.query.transportationMethod) {
      //console.log("Query transportationMethod condition:", req.query.transportationMethod);
      query.transportationMethod = {
        $eq: req.query.transportationMethod,
      };
    }

    if (req.query.startDestination) {
      query["inforLocation.startDestination"] = new RegExp(
        req.query.startDestination,
        "i"
      );
    }

    console.log("Mongo query:", query);

    const pageSize = 5;
    const pageNumber = parseInt(req.query.page || "1");
    const skip = (pageNumber - 1) * pageSize;

    const tours = await TourModel.find(query).skip(skip).limit(pageSize);

    const total = await TourModel.countDocuments(query);
    //console.log("Tours data:", tours);

    res.json({
      data: tours,
      pagination: {
        total,
        page: pageNumber,
        pages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
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

const getTourById = async (req, res) => {
  const { id } = req.params;
  try {
    const tour = await TourModel.findById(id)
      .populate({
        path: "reviewId",
        populate: {
          path: "userId",
          select: "userName email",
        },
      })
      .exec();
    if (!tour) {
      return res.status(404).json({ message: "Tour not found" });
    }
    res.json(tour);
  } catch (error) {
    console.log("Error:", error);
    res.status(500).json({ message: "Error fetching tour by ID" });
  }
};

export {
  searchTour,
  addTour,
  getTour,
  deleteTour,
  editTour,
  getAllTour,
  getTourById,
};
