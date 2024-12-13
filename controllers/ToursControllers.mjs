import TourModel from "../models/TourModel.mjs";

const getTour = async (req, res, next) => {
  try {
    const getTour = await TourModel.find();
    return res.status(200).json({
      message: "Get hotel successful",
      data: getTour,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const editTour = async (req, res, next) => {
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

const deleteTour = async (req, res, next) => {
  try {
    const tourId = req.params.tourId;
    await TourModel.findByIdAndDelete({ tourId });
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

const searchTour = () => {
  try {
    const { location, checkIn, checkOut, adults, children, room } = res.query;
  } catch (error) {}
};

const addTour = async (req, res, next) => {
  try {
    console.log(req.body);
    const hotel = await TourModel.create(req.body);
    return res.status(200).json({
      message: "Add tour successful",
      data: hotel,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export { searchTour, addTour, getTour, deleteTour , editTour};
