import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({
  hotelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "hotel",
    required: true,
  },
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: "objectType",
  },
  objectType: {
    type: String,
    required: true,
    enum: ["hotel", "tour", "flight"],
    default: "hotel",
  },  
  promotionId: { type: mongoose.Schema.Types.ObjectId, ref: "promotion" },
  roomName: {
    type: String,
    required: true,
    enum: ["standard room", "executive room", "family room", "penthouse"],
  },
  roomType: {
    type: String,
    required: true,
    enum: ["single", "double", "twin", "triple", "family", "doom", "suite"],
  },
  pricePerNight: { type: Number, required: true },
  availableRoom: {
    type: Boolean,
    default: true,
  },
  imgRoom: {
    avatar: { type: String },
    img: [{ type: String }],
  },
  description: { type: String },
  amenities: { type: [String] },
  maxOccupancy: { type: Number, required: true },
  dimensions: { type: String },
  status: {
    type: String,
    enum: ["available", "occupied", "unavailable"],
    required: true,
    default: "available",
  },
});

const RoomModel = mongoose.model("room", roomSchema);

export default RoomModel;
