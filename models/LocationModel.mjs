import mongoose from "mongoose";

const locationShema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true, // Tên địa điểm (bắt buộc)
      trim: true,
    },
    description: {
      type: String, // Mô tả địa điểm
      default: null,
    },
    address: {
      street: { type: String, required: true }, // Đường
      ward: { type: String }, // Phường/Xã
      district: { type: String, required: true }, // Quận/Huyện
      city: { type: String, required: true }, // Thành phố/Tỉnh
      country: { type: String, required: true }, // Quốc gia
    },
    images: {
      type: [String], // Danh sách URL hình ảnh
      default: [],
    },
    category: {
      type: String,
      enum: ["hotel", "restaurant", "tourist_spot", "shopping_mall", "other"], // Loại địa điểm
      required: true,
    },
    rating: {
      type: Number, 
      min: 1,
      max: 5,
      default: 3,
    },
    openingHours: {
      type: String, // Giờ mở cửa (ví dụ: "9:00 AM - 9:00 PM")
      default: null,
    },
    contact: {
      phone: { type: String }, // Số điện thoại liên hệ
      email: { type: String }, // Email liên hệ
    },
    website: {
      type: String, // Website liên hệ
      default: null,
    },
  },
  { timestamps: true }
);

const LocationModel = mongoose.model("location", locationShema);

export default LocationModel;
