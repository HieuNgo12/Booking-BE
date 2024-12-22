import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const mongoURI = `mongodb+srv://${process.env.KEY_NAME}:${process.env.KEY_MGDB}@exclusive.izqci.mongodb.net/Booking_TC_X31`;

const connectToMGDB = async () => {
  try {
    mongoose.set("strictQuery", false);
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      autoIndex: true,
    });
    console.log("Mongo connected");
  } catch (error) {
    console.log("MongoDB connection error: ", error);
    process.exit(1);
  }
};

export default connectToMGDB;
