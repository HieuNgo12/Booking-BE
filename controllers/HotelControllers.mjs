import HotelModel from "../models/HotelModel.mjs";

const getHotel = async (req, res, next) => {
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

const searchHotel = () => {
  try {
    const { location, checkIn, checkOut, adults, children, room } = res.query;
  } catch (error) {}
};

const addHotel = async (req, res, next) => {
  try {
    const hotel = await HotelModel.create(req.body);
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

export { searchHotel, addHotel, getHotel };
