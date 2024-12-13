import HotelModel from "../models/HotelModel.mjs";

const getHotel = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const pageSize = parseInt(req.query.pageSize, 10) || 10;

    const total = await HotelModel.countDocuments();
    const hotels = await HotelModel.find()
      .skip((page - 1) * pageSize)
      .limit(pageSize);

    return res.status(200).json({
      message: "Get hotel successful",
      data: hotels,
      total: total,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const editHotel = async (req, res, next) => {
  try {
    const getHotel = await HotelModel.find();
    return res.status(200).json({
      message: "Get hotel successful",
      data: getHotel,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const deleteHotel = async (req, res, next) => {
  try {
    const hotelId = req.params.hotelId;
    await HotelModel.findByIdAndDelete({ hotelId });
    return res.status(200).json({
      message: "Delete hotel successful",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const searchHotel = () => {
  try {
    const { location, checkIn, checkOut, adults, children, room } = res.query;
  } catch (error) {}
};

const addHotel = async (req, res, next) => {
  try {
    const hotel = await HotelModel.create(req.body);
    console.log(req.body)
    return res.status(200).json({
      message: "Add hotel successful",
      data: hotel,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export { searchHotel, addHotel, getHotel, editHotel, deleteHotel };
