const express = require("express");
const cors = require("cors");
const analyticsRoutes = require("./routes/analyticsRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/analytics", analyticsRoutes);

module.exports = app;
