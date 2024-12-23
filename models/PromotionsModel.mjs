import mongoose from "mongoose";

const promotionSchema = new mongoose.Schema(
  {
    objectId: {
      type: mongoose.Schema.Types.ObjectId,
      // required: true,
      refPath: "objectType",
    },
    objectType: {
      type: String,
      required: true,
      enum: ["hotel", "tour", "flight"],
    },
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "admin",
      required: true,
    },
    code: { type: String, required: true },
    imgPromotion: { type: String },
    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
      required: true,
    },
    discountValue: { type: Number, required: true },
    minimumValue: { type: Number, default: 0 },
    maxDiscount: { type: Number, default: 0 },
    applicableCategories: [{ type: String }],
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    description: { type: String, required: true },
    status: {
      type: String,
      enum: ["active", "inactive", "expired"],
      required: true,
      default: "active",
    },
  },
  { timestamps: true }
);

const PromotionModel = mongoose.model("promotion", promotionSchema);

export default PromotionModel;
