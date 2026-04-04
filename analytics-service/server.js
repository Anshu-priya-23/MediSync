import app from "./src/app.js";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 5005;

// ================= DB CONNECTION =================
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected ");

    // ================= START SERVER =================
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT} `);
    });
  })
  .catch((err) => {
    console.error("MongoDB Connection Failed ", err);
  });