import PromotionModel from "../models/PromotionsModel.mjs";
import mongoose from "mongoose";
import { v2 as cloudinary } from "cloudinary";

//cloudary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const getPromotion = async (req, res, next) => {
  try {
    const promotion = await PromotionModel.find().populate("objectId");
    return res.status(200).json({
      message: "Get all promotion",
      data: promotion,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const checkCode = async (req, res, next) => {
  try {
    const { code, objectType } = req.params;
    console.log(code);
    console.log(objectType);
    const promotion = await PromotionModel.findOne({ code, objectType });
    if (!promotion) {
      return res.status(400).json({
        message: "Promotion is not found!",
      });
    }

    return res.status(200).json({
      message: "Promotion is found!",
      data: promotion,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const deletePromotion = async (req, res, next) => {
  try {
    const promotionId = req.params.promotionId;
    await PromotionModel.findByIdAndDelete({ promotionId });
    return res.status(200).json({
      message: "Delete promotion successful",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const createPromotion = async (req, res, next) => {
  try {
    const { code, objectId } = req.body;
    const file = req.file;

    const checkCode = await PromotionModel.findOne({ code: code });
    if (checkCode) {
      return res.status(400).json({
        message: "Code already exists",
      });
    }

    let data = {
      ...req.body,
      adminId: mongoose.Types.ObjectId(req.user.id),
    };

    if (!objectId) {
      const promotion = await PromotionModel.create(data);

      if (file) {
        const dataUrl = `data:${file.mimetype};base64,${file.buffer.toString(
          "base64"
        )}`;

        const result = await cloudinary.uploader.upload(dataUrl, {
          public_id: `${promotion._id}_avatar`,
          resource_type: "auto",
          folder: `booking/promotion/${promotion._id}`,
          overwrite: true,
        });

        if (result) {
          promotion.imgPromotion = result.secure_url;
          await promotion.save();

          return res.status(200).json({
            message: "Create promotion successfully!",
            data: promotion,
          });
        }
      }
    }

    data = {
      ...data,
      objectId: mongoose.Types.ObjectId(req.body.objectId),
    };
    const promotion = await PromotionModel.create(data);

    if (file) {
      const dataUrl = `data:${file.mimetype};base64,${file.buffer.toString(
        "base64"
      )}`;

      const result = await cloudinary.uploader.upload(dataUrl, {
        public_id: `${promotion._id}_avatar`,
        resource_type: "auto",
        folder: `booking/promotion/${promotion._id}`,
        overwrite: true,
      });

      if (result) {
        promotion.imgPromotion = result.secure_url;
        await promotion.save();

        return res.status(200).json({
          message: "Create promotion successfully!",
          data: promotion,
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

const applyPromotion = async (req, res, next) => {
  try {
    const { code } = res.body;

    const promotion = await PromotionModel.findOne({ code: code }).populate(
      "objectId"
    );

    if (!promotion) {
      return res.status(400).json({
        message: "Code is not found!",
      });
    }

    const currentDate = new Date();

    if (currentDate > promotion.endDate) {
      return res.status(400).json({
        message: "Code is expired!",
      });
    }

    return res.status(200).json({
      message: "Get all promotion",
      data: promotion,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const editPromotion = async (req, res, next) => {
  try {
    const promotionId = req.params.promotionId;
    const file = req.file;
    let objectId = req.body.objectId;
    console.log(objectId);
    let data = { ...req.body };

    if (objectId) {
      const changeObjectId = mongoose.Types.ObjectId(objectId);
      data = { ...data, objectId: changeObjectId };
    }

    const promotion = await PromotionModel.findById(promotionId);

    if (!promotion) {
      return res.status(400).json({
        message: "promotion is not found!",
      });
    }

    const update = await PromotionModel.findByIdAndUpdate(promotionId, data, {
      new: true,
    });

    if (file) {
      const dataUrl = `data:${file.mimetype};base64,${file.buffer.toString(
        "base64"
      )}`;

      const result = await cloudinary.uploader.upload(dataUrl, {
        public_id: `${update._id}_avatar`,
        resource_type: "auto",
        folder: `booking/promotion/${update._id}`,
        overwrite: true,
      });

      if (result) {
        update.imgPromotion = result.secure_url;
        await update.save();

        return res.status(200).json({
          message: "Update tour successful",
        });
      }
    }

    if (update) {
      return res.status(200).json({
        message: "Update promotion successful",
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
  getPromotion,
  applyPromotion,
  deletePromotion,
  createPromotion,
  editPromotion,
  checkCode,
};
