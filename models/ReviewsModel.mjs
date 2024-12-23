import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    objectId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "objectType",
    },
    objectType: {
      type: String,
      required: true,
      enum: ["hotel", "tour", "flight"],
    },
    objectType: { type: String, required: true },
    comment: { type: String, required: true, default: null },
    rating: { type: String, required: true, default: null },
    imgReview: [{ type: String, default: null }],
    status: {
      type: String,
      default: "pendding",
      enum: ["pendding", "active", "suspended", "deleted"],
    },
    replayInfo: {
      adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "admin",
        default: null,
      },
      replyText: { type: String, default: null },
      isReply: { type: Boolean, default: false },
      imgReply: [{ type: String, default: null }],
    },
  },
  { timestamps: true }
);

const ReviewModel = mongoose.model("review", reviewSchema);

export default ReviewModel;
