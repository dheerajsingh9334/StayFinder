import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./src/utils/dbconnect";
import router from "./src/routes/main.routes";
import cors from "cors";
import cookieParser from "cookie-parser";
dotenv.config();
import "./src/services/email.listner";
const PORT = process.env.PORT || 3000;
const app = express();

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
    // console.log("ACCESS_TOKEN_SECRET:", process.env.ACCESS_TOKEN_SECRET);

    app.listen(PORT, () =>
      console.log(`Server running on http://localhost:${PORT}`),
    );
  } catch (error) {
    console.error("Failed to start server:", error);
  }
}
start();
