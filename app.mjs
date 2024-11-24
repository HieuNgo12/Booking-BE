import express from "express";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import cors from "cors";
import dotenv from "dotenv";
import Serverless from "serverless-http";
import connectToMGDB from "./connection.mjs";
import HotelOrderRouters from "./routes/HieuRoutes/HotelOrderRouters.mjs";
import HotelReviewsRouters from "./routes/HieuRoutes/HotelReviewsRouters.mjs";
import PromotionsRouters from "./routes/HieuRoutes/PromotionsRouters.mjs";
import ToursOrderRouters from "./routes/ThaiRoutes/ToursOrderRouters.mjs";
import ToursReviewsRouters from "./routes/ThaiRoutes/ToursReviewsRouters.mjs";
import WishlistsRouters from "./routes/ThaiRoutes/WishlistsRouters.mjs";
import UserRouters from "./routes/HoaRoutes/UsersRouters.mjs";
import SupportsRouters from "./routes/HoaRoutes/SupportsRouters.mjs";
import ProductsHotelRouters from "./routes/HoaRoutes/ProductsHotelRouters.mjs";
import ProductsToursRouters from "./routes/HoaRoutes/ProductsToursRouters.mjs";

dotenv.config();

const corsConfig = {
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
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

  try {
    await connectToMGDB;
    console.log("Connected to MongoDB successfully.");
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error.message);
    process.exit(1);
  }

  //Hiếu
  app.use("/", HotelOrderRouters);
  app.use("/", HotelReviewsRouters);
  app.use("/", PromotionsRouters);

  //Hòa
  app.use("/", UserRouters);
  app.use("/", SupportsRouters);
  app.use("/", ProductsHotelRouters);
  app.use("/", ProductsToursRouters);

  //Thái
  app.use("/", ToursOrderRouters);
  app.use("/", ToursReviewsRouters);
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
