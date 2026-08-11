import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import indexRouter from "./routes/indexRouter.js";
import globalErrorHandler from "./middlewares/globalErrorHandler.js";
import AppError from "./middlewares/appError.js";
import { corsOptions } from "./config/cors.js";


const app = express();

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/healthcheck", async (req, res) => {
  res.status(200).send("HealthCheck - OK with EB!!!");
});

app.use("/api", indexRouter);

app.all("/*splat", (req, res, next) => {
  next(
    new AppError(`<Custom Stack Trace Error Message>`, 404, {
      errors: [
        {
          field: "path",
          message: `Can't find ${req.originalUrl} on this server!`,
        },
      ],
    })
  );
});

app.use(globalErrorHandler);

export default app;
