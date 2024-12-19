import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
      default: null,
    },
    hotelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "hotel",
      default: null,
    },
    tourId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "tour",
      default: null,
    },
    objectType: { type: String, required: true },
    comment: { type: String, required: true },
    startDate: { type: Date, default: null },
    endDate: { type: Date, default: null },
    rating: { type: String, default: null },
    img: { type: String, default: null },
    status: { type: String, default: null },
    adminId: { type: Number, default: null },
    replyText: { type: String, required: true },
    isReply: { type: Boolean, default: false },
    imgReply: { type: String, default: null },
    statusReply: { type: String, default: null },
  },
  { timestamps: true }
);

const Review = mongoose.model("review", reviewSchema);
export default Review;
