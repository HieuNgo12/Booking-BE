import mongoose from "mongoose";

const flightSchema = new mongoose.Schema(
  {
    airlineName: { type: String, required: true },
    flightNumber: { type: String, required: true},
    availableSeats: { type: Number, required: true },
    departureAirport: { type: String, required: true },
    destinationAirport: { type: String, required: true },
    departureDate: { type: Date, required: true },
    destinationDate: { type: Date, required: false },
    price: { type: Number, required: true },
    status: {
      type: String,
      enum: ["scheduled", "cancelled", "completed", "delayed"],
      required: true,
      default: "scheduled",
    },
  },
  { timestamps: true }
);

const FlightModel = mongoose.model("flight", flightSchema);

export default FlightModel;
