import express from "express";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import cors from "cors";
import dotenv from "dotenv";
import Serverless from "serverless-http";
import connectToMGDB from "./connection.mjs";
import HotelRouters from "./routes/HotelRouters.mjs";
import PromotionsRouters from "./routes/PromotionsRouters.mjs";
import TourRouters from "./routes/TourRouters.mjs";
import ReviewsRouters from "./routes/ReviewsRouters.mjs";
import WishlistsRouters from "./routes/WishlistsRouters.mjs";
import UserRouters from "./routes/UsersRouters.mjs";
import AdminRouters from "./routes/AdminRouter.mjs";
import SupportsRouters from "./routes/SupportsRouters.mjs";
import AuthenticationRouters from "./routes/AuthenticationRouter.mjs";
import BookingRouters from "./routes/BookingRouter.mjs";
import RoomRouters from "./routes/RoomRouters.mjs";
import FlightRouters from "./routes/FlightRouters.mjs";
import PaymentRouters from "./routes/PaymentRouter.mjs";

dotenv.config();

const corsConfig = {
  origin: ["http://localhost:5173"],
  methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

const App = async () => {
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(cookieParser());
  app.use(morgan("dev"));
  app.use(cors(corsConfig));

  app.use(
    morgan(":method :url :status :res[content-length] - :response-time ms")
  );

  connectToMGDB();

  app.use("/", AdminRouters);
  app.use("/", AuthenticationRouters);
  app.use("/", BookingRouters);
  app.use("/", FlightRouters);
  app.use("/", HotelRouters);
  app.use("/", PaymentRouters);
  app.use("/", PromotionsRouters);
  app.use("/", RoomRouters);
  app.use("/", SupportsRouters);
  app.use("/", TourRouters);
  app.use("/", ReviewsRouters);
  app.use("/", UserRouters);
  app.use("/", WishlistsRouters);

  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: "Internal server error" });
  });

  if (process.env.NODE_ENV === "dev") {
    app.listen(8080, () => {
      console.log(
        `Server is running on port 8080. Check the app on http://localhost:8080`
      );
    });
  }

  return app;
};

const app = await App();
export const handler = Serverless(app);
