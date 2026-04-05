const express = require("express");
const cors = require("cors");

const app = express();

// =====================
// MIDDLEWARES
// =====================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =====================
// STATIC FILES
// =====================
app.use("/uploads", express.static("uploads"));

// =====================
// ROUTES
// =====================
const medicineRoutes = require("./routes/medicineRoutes");
const orderRoutes = require("./routes/orderRoutes");
const userRoutes = require("./routes/userRoutes");



app.use("/api/medicines", medicineRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/users", userRoutes);

// =====================
// HEALTH CHECK
// =====================
app.get("/", (req, res) => {
  res.send("Inventory Service Running 🚀");
});

module.exports = app;