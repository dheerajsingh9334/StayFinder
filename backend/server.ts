import express from "express";
import dotenv from "dotenv";
import path from "path";

dotenv.config({
  path: path.join(process.cwd(), ".env"),
});

import { connectDB } from "./src/utils/dbconnect";
import router from "./src/routes/main.routes";
import cors from "cors";
import cookieParser from "cookie-parser";
import compression from "compression";
import "./src/listener/email.listner";
import "./src/listener/payment.listeners";
import "./src/listener/booking.listner";

import { redisClient } from "./src/config/redis";
import { bookingQueue } from "./src/queue/booking.queue";

const PORT = process.env.PORT || 3000;
const app = express();

app.use(compression());
app.use(express.json());
app.use(cookieParser());
const allowedOrigins = [
  "http://localhost:5173",
  "https://stay-finder-blue.vercel.app",
];
app.use(
  cors({
    origin: (origin, cb) =>
      !origin || allowedOrigins.includes(origin)
        ? cb(null, true)
        : cb(new Error("CORS blocked")),
    credentials: true,
  }),
);

app.get("/health", (req, res: express.Response) => {
  console.log(req.ip);
  res.send("StayFinder API is running...");
  console.log(req.ip);
});

app.use("/api", router);

async function start() {
  try {
    await connectDB();
    const res = await redisClient.ping();
    console.log("redis status", res);
    await bookingQueue.add(
      "recovery-job",
      {},
      {
        removeOnComplete: true,
      },
    );

    // console.log("ACCESS_TOKEN_SECRET:", process.env.ACCESS_TOKEN_SECRET);

    app.listen(PORT, () =>
      console.log(`Worker ${process.pid} listening on port ${PORT}`),
    );
  } catch (error) {
    console.error("Failed to start server:", error);
  }
}
start();
