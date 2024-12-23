import mongoose from "mongoose";

const adminSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    workplace: { type: String, required: true },
    phone: { type: String, required: false },
    gender: { type: Boolean, required: false },
    DOB: { type: Date, required: false },
    address: {
      number: { type: String, default: null },
      street: { type: String, default: null },
      ward: { type: String, default: null },
      district: { type: String, default: null },
      city: { type: String, default: null },
    },
    zipcode: { type: String, default: null },
    avatar: {
      type: String,
      default:
        "https://res.cloudinary.com/dsxlqhn53/image/upload/booking/user/default.jpg",
    },
    idCard: { type: String, required: false },
    isIdCardNumberVerified: { type: Boolean, default: false },
    failedLoginAttempts: { type: Number, default: 0 },
    timeSuspended: { type: Date, default: null },
    verificationStatus: {
      emailVerified: { type: Boolean, required: false, default: false },
      phoneVerified: { type: Boolean, required: false, default: false },
      idCardVerified: { type: Boolean, required: false, default: false },
    },
    role: {
      type: String,
      enum: ["super", "admin", "support"],
      required: false,
      default: "admin",
    },
    status: {
      type: String,
      enum: ["pending", "active", "inactive"],
      default: "pending",
    },
    supportId: { type: mongoose.Schema.Types.ObjectId, ref: "support" },
    promotionId: { type: mongoose.Schema.Types.ObjectId, ref: "promotion" },
  },
  { timestamps: true }
);

const AdminModel = mongoose.model("admin", adminSchema);

export default AdminModel;
