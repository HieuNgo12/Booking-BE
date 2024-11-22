import cookieParser from "cookie-parser";

import express from "express";
import indexRouter from "./routes/index.mjs";
import usersRouter from "./routes/users.mjs";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use("/", indexRouter);
app.use("/users", usersRouter);

app.listen(8080, () => {
    console.log(
      "Server is running on port 8080. Check the app on http://localhost:8080"
    );
  });
  
console.log();
export default app;
