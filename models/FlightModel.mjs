import mongoose from "mongoose";

const flightSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    tourId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "tour",
      required: true,
    },
    airlineName: { type: String, required: true },
    availableSeats: { type: Number, required: true },
    departureAirport: { type: String, required: true },
    destinationAirport: { type: String, required: true },
    departureDate: { type: Date, required: true },
    destinationDate: { type: Date, required: true },
    price: { type: Number, required: true },
    status: {
      type: String,
      enum: ["scheduled", "cancelled", "completed"],
      required: true,
    },
  },
  { timestamps: true }
);

const FlightModel = mongoose.model("flight", flightSchema);

export default FlightModel;
