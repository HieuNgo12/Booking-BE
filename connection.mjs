import mongoose from "mongoose";

const connectToMGDB = () => {
  mongoose
    .connect(
      `mongodb+srv://${process.env.KEY_NAME}:${process.env.KEY_MGDB}@cluster0.dquat.mongodb.net/`
    )
    .then(() => {
      console.log("kết nối tới database thành công");
    })
    .catch((err) => {
      console.log("kết nối tới database thất bại", err);
    });
};

export default connectToMGDB;
