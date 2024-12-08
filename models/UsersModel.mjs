import mongoose from "mongoose";

const userShema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: false,
      default: null,
    },
    gender: {
      type: Boolean,
      required: false,
      default: true,
    },
    DOB: {
      type: Date,
      required: false,
      default: null,
    },
    nationality: {
      type: String,
      required: false,
      default: null,
    },
    address: {
      street: { type: String, default: null },
      ward: { type: String, default: null },
      district: { type: String, default: null },
      city: { type: String, default: null },
      country: { type: String, default: null },
    },
    avatar: {
      type: String,
      default:
        "https://res.cloudinary.com/dsxlqhn53/image/upload/booking/user/default.jpg",
    },
    idCard: {
      type: String,
      required: false,
      default: null,
    },
    membershipLevel: {
      type: String,
      enum: ["bronze", "silver", "gold", "platinum", "diamond"],
      default: "bronze",
    },
    currency: {
      type: String,
      enum: ["usd", "vnd", "euro", "yen"],
      default: "usd",
    },
    language: {
      type: String,
      enum: ["English", "VietNam", "Japan"],
      default: "English",
    },
    loyaltyPoints: {
      type: Number,
      default: 0,
    },
    totalSpent: {
      type: Number,
      default: 0,
    },
    logInAttempt: {
      type: Number,
      default: 5,
    },
    timeSuspended: {
      type: Date,
      default: null,
    },
    verificationStatus: {
      emailVerified: { type: Boolean, default: false },
      phoneVerified: { type: Boolean, default: false },
      idCardVerified: { type: Boolean, default: false },
      paymentVerified: { type: Boolean, default: false },
    },
    paymentMethods: {
      type: [
        {
          type: { type: String },
          enum: ["payCash", "visa", "paypal", "E-banking"],
          cardNumber: String,
          expiry: String,
          email: String,
        },
      ],
    },
    bookingHistory: {
      type: [
        {
          bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking" },
          type: { type: String, enum: ["hotel", "tour"] },
          status: { type: String, enum: ["pending", "completed", "cancelled"] },
        },
      ],
    },
    role: {
      type: String,
      enum: ["user", "admin", "moderator"],
      default: "user",
    },
    status: {
      type: String,
      required: true,
      enum: ["pendding", "active", "suspended", "deleted"],
      default: "pendding",
    },
    supportId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "support",
    },
    reviewId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "review",
    },
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "payment",
    },
    wishListId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "wishList",
    },
  },
  { timestamps: true }
);

const UserModel = mongoose.model("user", userShema);

export default UserModel;
