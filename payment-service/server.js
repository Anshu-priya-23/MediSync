require("dotenv").config();
const dns = require("node:dns/promises");
const mongoose = require("mongoose");
const app = require("./src/app");

const PORT = process.env.PORT || 5004;

dns.setServers(["8.8.8.8", "1.1.1.1"]);

async function startServer() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not configured for payment-service");
    }

    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
    });

    console.log("Payment Service connected to MongoDB");

    app.listen(PORT, () => {
      console.log(`Payment Service running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Payment Service failed to start:", error.message);
    process.exit(1);
  }
}

startServer();
