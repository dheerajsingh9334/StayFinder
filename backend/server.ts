import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./src/utils/dbconnect";
import router from "./src/routes/main.routes";
import cors from "cors";
import cookieParser from "cookie-parser";
dotenv.config();

const PORT = process.env.PORT || 3000;
const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.get("/health", (_, res: express.Response) => {
  res.send("StayFinder API is running...");
});

app.use("/api", router);

async function start() {
  try {
    await connectDB();
    console.log("ACCESS_TOKEN_SECRET:", process.env.ACCESS_TOKEN_SECRET);

    app.listen(PORT, () =>
      console.log(`Server running on http://localhost:${PORT}`)
    );
  } catch (error) {
    console.error("Failed to start server:", error);
  }
}
start();
