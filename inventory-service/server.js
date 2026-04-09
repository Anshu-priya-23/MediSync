require("dotenv").config();
const mongoose = require("mongoose");

const app = require("./src/app");

const PORT = process.env.PORT || 5002;

console.log("MongoDB Connecting...");
console.log("PORT =", PORT);

mongoose
  .connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 10000,
  })
  .then(() => {
    console.log("MongoDB Connected ✅");
  })
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:");
    console.error(err.message);
  });

const redis = require("./src/config/redis");

redis.on("connect", () => {
  console.log("Redis Connected ✅");
});

redis.on("error", (err) => {
  console.log("Redis Error:", err.message);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} 🚀`);
});
