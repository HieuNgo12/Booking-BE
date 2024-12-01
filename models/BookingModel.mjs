import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
      default: null,
    },
    hotelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "hotel",
      default: null,
    },
    tourId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "tour",
      default: null,
    },
    fightId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "flight",
      default: null,
    },
    objectType: { type: String, required: true, enum: ["hotel, tour"] },
    paymentId: { type: Number, required: true },
    bookingStartDate: { type: Date, required: true },
    bookingEndDate: { type: Date, required: true },
    totalPersons: { type: Number, required: true },
    totalAmount: { type: String, required: true },
    status: { type: String, default: null },
  },
  { timestamps: true }
);

const BookingModel = mongoose.model("booking", bookingSchema);

export default BookingModel;
