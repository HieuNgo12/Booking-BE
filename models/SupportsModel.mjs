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
    statusReply: {
      type: Boolean,
      default: false,
    },
    reply: {
      timeReply: {
        type: Date,
        default: Date.now, 
      },
      messageReply: {
        type: String,
        trim: true,
      },
      imgSupport: [
        {
          type: String,
          trim: true,
        },
      ],
    },
    status: {
      type: String,
      enum: ["open", "in-progress", "closed"],
      default: "open",
    },
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "admin",
    },
  },
  { timestamps: true }
);

const SupportModel = mongoose.model("support", supportSchema);

export default SupportModel;
