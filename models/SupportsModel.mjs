const mongoose = require("mongoose");

const supportSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "admin",
      required: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    img: {
      type: String,
      trim: true,
    },
    reply: {
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
        required: true,
        trim: true,
      },
      note: {
        type: String,
        trim: true,
      },
      imgString: {
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
