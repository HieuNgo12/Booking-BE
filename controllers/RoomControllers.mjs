import RoomModel from "../models/RoomModel.mjs";

const searchRoom = () => {
  try {
    const { location, checkIn, checkOut, adults, children, room } = res.query;
  } catch (error) {}
};

const addRoom = async (req, res, next) => {
  try {
    console.log(req.body);
    const hotel = await RoomModel.create(req.body);
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

export { searchRoom, addRoom };
