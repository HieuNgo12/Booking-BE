import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "booking",
      required: true,
      // default: false,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      // required: true,
      // default: false,
    },
    amount: { type: Number, required: true },
    currency: {
      type: String,
      default: "VND",
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ["Cash", "PayPal", "Momo", "ZaloPay", "VNPay"],
    },
    paymentDate: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ["completed", "pending", "failed"],
      default: "pending",
    },
    payerDetails: {
      name: { type: String, required: true },
      email: { type: String },
      phone: { type: String },
    },
    paymentGatewayDetails: {
      provider: { type: String }, // Nhà cung cấp cổng thanh toán (VD: "MoMo", "VNPay")
      transactionId: { type: String }, // Mã giao dịch từ cổng thanh toán
    },
    description: { type: String },
    tax: { type: Number, default: 0 },
    prepay: { type: Number, default: 0 },
    refund: {
      isRefunded: { type: Boolean, default: false },
      refundDate: { type: Date },
      refundAmount: { type: Number },
    },
  },
  { timestamps: true }
);

const PaymentModel = mongoose.model("payment", paymentSchema);

export default PaymentModel;
