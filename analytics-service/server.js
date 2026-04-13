import dns from "node:dns";
import app from "./src/app.js";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

// Set DNS servers BEFORE making any network calls
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const PORT = process.env.PORT || 5005;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB Connection Failed", err);
  });