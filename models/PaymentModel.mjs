import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "booking",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    amount: { type: Number, required: true },
    paymentMethod: {
      type: String,
      required: true,
      enum: ["credit card", "cash", "paypal", "e-banking"],
    },
    paymentDate: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ["completed", "pending", "failed"],
      default: "pending",
    },
    transactionId: { type: String },
  },
  { timestamps: true }
);

const PaymentModel = mongoose.model("payment", paymentSchema);

export default PaymentModel;
