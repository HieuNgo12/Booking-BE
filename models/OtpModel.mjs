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
    email: { type: String, required: true, default: false },
    otp: { type: String, required: true, default: false },
    purpose: {
      type: String,
      required: true,
      default: false,
      enum: ["verify", "resetPassword"],
    },
    status: {
      type: String,
      enum: ["active", "used", "expired"],
      required: true,
      default: "active",
    },
    expiresAt: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 60 * 1000),
    },
    createdAt: {
      type: Date,
      expires: 60,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const OtpModel = mongoose.model("otp", otpSchema);

export default OtpModel;
