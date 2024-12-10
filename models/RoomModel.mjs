import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({
  hotelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "hotel",
    required: true,
  },
  promotionId: { type: mongoose.Schema.Types.ObjectId, ref: "promotion" },
  roomName: { type: String, required: true },
  roomType: { type: String, required: true },
  pricePerNight: { type: Number, required: true },
  checkInDate: { type: Date },
  checkOutDate: { type: Date },
  availableRoom: { type: Number, required: true, default: true },
  imgRoom: { type: String, default: null },
  detailRoom: { type: String },
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
