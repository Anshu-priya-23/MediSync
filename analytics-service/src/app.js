import express from "express";
import cors from "cors";
import analyticsRoutes from "./routes/analyticsRoutes.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/analytics", analyticsRoutes);

// Default Route
app.get("/", (req, res) => {
  res.send("Analytics Service is running");
});

export default app;