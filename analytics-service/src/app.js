import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// ✅ Middleware
app.use(cors());
app.use(express.json());

// ✅ MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected "))
  .catch((err) => console.log(err));

// ✅ Routes
app.use("/api/analytics", analyticsRoutes);

// ✅ Default Route
app.get("/", (req, res) => {
  res.send("Analytics Service is running ");
});

// 🔥 VERY IMPORTANT (SERVER START)
const PORT = process.env.PORT || 5005;

app.listen(PORT, () => {
  console.log(`Analytics Server running on port ${PORT} `);
});
export default app;