import mongoose from "mongoose";

const supportSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    listImg: [
      {
        type: String,
        trim: true,
      },
    ],
    reply: {
      adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "admin",
        default: null,
      },
      timeReply: {
        type: Date,
      },
      statusReply: {
        type: String,
        enum: ["pending", "replied", "resolved"],
        default: "pending",
      },
      text: {
        type: String,
        trim: true,
      },
      note: {
        type: String,
        trim: true,
      },
      imgSupport: {
        type: String,
        trim: true,
      },
    },
    status: {
      type: String,
      enum: ["open", "in-progress", "closed"],
      default: "open",
    },
  },
  { timestamps: true }
);

const SupportModel = mongoose.model("support", supportSchema);

export default SupportModel;
