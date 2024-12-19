import mongoose from "mongoose";

const tourSchema = new mongoose.Schema(
  {
    tourName: { type: String, required: true, default: null },
    tourCode: { type: String, required: true, default: null },
    startDateBooking: { type: Date, required: true, default: null },
    endDateBooking: { type: Date, required: true, default: null },
    price: { type: Number, required: true, default: null },
    capacity: { type: Number, required: true, default: null },
    description: { type: String, default: null },
    tourRestrictions: [{ type: String, default: null }],
    transportationMethod: [{ type: String, default: null }],
    status: {
      type: String,
      enum: ["pending", "available", "cancelled"],
      default: "available",
    },
    duration: { type: String, default: null },
    inforLocation: {
      startDestination: { type: String, required: true, default: null },
      endDestination: { type: String, required: true, default: null },
      destination: [{ type: String, required: true, default: null }],
      travelSchedule: [{ type: String, default: null }],
    },
    imgTour: {
      avatar: { type: String, default: null },
      listTour: [{ type: String, default: null }],
    },
    priceIncludes: [
      {
        type: String,
      },
    ],
    priceExcludes: [
      {
        type: String,
      },
    ],
    cancellationPolicy: [
      {
        type: String,
      },
    ],
    promotionId: { type: mongoose.Schema.Types.ObjectId, ref: "promotion" },
    flightId: { type: mongoose.Schema.Types.ObjectId, ref: "flight" },
    reviewId: [{ type: mongoose.Schema.Types.ObjectId, ref: "review" }],
    bookingId: [{ type: mongoose.Schema.Types.ObjectId, ref: "booking" }],
    locationId: [{ type: mongoose.Schema.Types.ObjectId, ref: "location" }],
  },
  { timestamps: true }
);

const TourModel = mongoose.model("tour", tourSchema);

export default TourModel;
