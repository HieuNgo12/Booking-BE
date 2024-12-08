import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    objectId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "objectType", // Động xác định liên kết
    },
    objectType: {
      type: String,
      required: true,
      enum: ["hotel", "tour", "flight"], 
    },
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "payments", 
      default: null,
    },
    bookingStartDate: {
      type: Date,
      required: true,
    },
    bookingEndDate: {
      type: Date,
      required: true,
    },
    totalPersons: {
      type: Number,
      required: true,
    },
    totalAmount: {
      type: Number, // Nên lưu số để dễ tính toán
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed"],
      default: "pending",
    },
    specialRequests: {
      type: String, 
      default: null,
    },
    cancellationPolicy: {
      type: String, 
      default: null,
    },
    contactInfo: {
      name: { type: String },
      email: { type: String },
      phone: { type: String },
    },
  },
  { timestamps: true }
);

const BookingModel = mongoose.model("booking", bookingSchema);

export default BookingModel;
