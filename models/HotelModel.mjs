import mongoose from "mongoose";

const hotelSchema = new mongoose.Schema(
  {
    hotelName: { type: String, required: true },
    address: {
      number: { type: String, required: true, default: null },
      street: { type: String, required: true, default: null },
      ward: { type: String, required: true, default: null },
      district: { type: String, required: true, default: null },
      city: { type: String, required: true, default: null },
      zipcode: { type: String, required: true, default: null },
    },
    availableRooms: { type: Number, required: true, default: null },
    priceAveragePerNight: { type: Number, required: true, default: null },
    detailHotel: { type: String, default: null },
    imgHotel: { type: String, default: null },
    status: {
      type: String,
      enum: ["pending", "active", "inactive"],
      default: "pending",
    },
    reviewId: [{ type: mongoose.Schema.Types.ObjectId, ref: "review" }],
    bookingId: [{ type: mongoose.Schema.Types.ObjectId, ref: "booking" }],
    roomId: [{ type: mongoose.Schema.Types.ObjectId, ref: "room" }],
  },
  { timestamps: true }
);

const HotelModel = mongoose.model("hotel", hotelSchema);

export default HotelModel;
