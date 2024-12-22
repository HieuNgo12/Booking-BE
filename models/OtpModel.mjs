import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "booking",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    email: { type: String, required: true, default: null },
    otp: { type: String, required: true, default: null },
    data: { type: String, required: false, default: null },
    purpose: {
      type: String,
      required: true,
      default: null,
      enum: ["verifyEmail", "resetPassword", "changeEmail"],
    },
    status: {
      type: String,
      enum: ["active", "used", "expired"],
      required: true,
      default: "active",
    },
  },
  { timestamps: true }
);

const OtpModel = mongoose.model("otp", otpSchema);

export default OtpModel;
