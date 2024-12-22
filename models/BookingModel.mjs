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
      refPath: "objectType",
    },
    objectType: {
      type: String,
      required: true,
      enum: ["hotel", "tour", "flight"],
    },
    bookedRoomId: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "room",
      },
    ],
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "payments",
      default: null,
    },
    bookingStartDate: { type: Date, required: true },
    bookingEndDate: { type: Date, required: true },
    totalPersons: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    discount: { type: Number, default: 0, ref: "promotion" },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed"],
      default: "pending",
    },
    specialRequests: { type: String, default: null },
    cancellationPolicy: { type: String, default: null },
    contactInfo: {
      name: { type: String },
      email: { type: String },
      phone: { type: String },
    },
    services: [
      {
        name: { type: String },
        price: { type: Number },
      },
    ],
    bookingReference: { type: String, unique: true, required: true },
    internalNotes: { type: String, default: null },
  },
  { timestamps: true }
);

const BookingModel = mongoose.model("booking", bookingSchema);

export default BookingModel;
