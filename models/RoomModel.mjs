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
  availableRoom: { type: Number, required: true },
  imgRoom: { type: String },
  detailRoom: { type: String },
  status: {
    type: String,
    enum: ["available", "occupied", "unavailable"],
    required: true,
  },
});

const RoomModel = mongoose.model("room", roomSchema);

export default RoomModel;
