import mongoose from "mongoose";

const wishlistSchema = new mongoose.Schema(
  {
    tourId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "tour",
      required: true,
    },
    hotelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "hotel",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    objectType: { type: String, required: true, enum: ["hotel", "tour"] },
    startDate: { type: Date , default : null},
    endDate: { type: Date , default : null},
    isExpired : { type: Boolean, default : null },
    price: { type: Number },
    status: { type: String, enum: ["active", "removed"], default: "active" },
  },
  { timestamps: true }
);

const WishlistModel = mongoose.model("tour", wishlistSchema);

export default WishlistModel;
