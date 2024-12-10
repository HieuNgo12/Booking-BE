import RoomModel from "../models/RoomModel.mjs";

const createRoom = async (req, res, next) => {
  try {
    const hotel = await RoomModel.create(req.body);
    return res.status(200).json({
      message: "Add room successful",
      data: hotel,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export { createRoom };
