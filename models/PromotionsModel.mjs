import mongoose from "mongoose";

const promotionSchema = new mongoose.Schema(
  {
    objectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Object",
      required: true,
    },
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "admin",
      required: true,
    },
    objectType: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    img: { type: String },
    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
      required: true,
    },
    discountValue: { type: Number, required: true },
    minimumValue: { type: Number },
    maxDiscount: { type: Number },
    applicableCategories: [{ type: String }],
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    description: { type: String, required: true },
    status: { type: String, enum: ["active", "inactive"], required: true },
  },
  { timestamps: true }
);

const PromotionModel = mongoose.model("promotion", promotionSchema);

export default PromotionModel;
