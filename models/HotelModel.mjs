import mongoose from "mongoose";

const hotelSchema = new mongoose.Schema(
  {
    hotelName: { type: String, required: true },
    address: {
      street: { type: String, required: true, default: null },
      ward: { type: String, required: true, default: null },
      district: { type: String, required: true, default: null },
      city: { type: String, required: true, default: null },
      country: { type: String, required: true, default: null },
    },
    phone: { type: String, required: true, default: null },
    availableRooms: { type: Number, required: true, default: null },
    priceAveragePerNight: { type: Number, required: true, default: null },
    description: { type: String, default: null },
    star: { type: Number, default: null },
    imgHotel: {
      avatar: { type: String, default: null },
      img: [{ type: String, default: null }],
    },
    imgHotel: [{ type: String, default: null }],
    category: {
      type: String,
      enum: ["hotel", "homestay", "resort"],
      default: null,
    },
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
