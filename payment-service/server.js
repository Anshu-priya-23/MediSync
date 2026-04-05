require("dotenv").config();
const dns = require("node:dns/promises");
const mongoose = require("mongoose");
const app = require("./src/app");
const { startOutboxWorker, stopOutboxWorker } = require("./src/events/publisher");
const { startOrderEventWorker, stopOrderEventWorker } = require("./src/events/orderEventConsumer");

const PORT = process.env.PORT || 5004;

dns.setServers(["8.8.8.8", "1.1.1.1"]);

let httpServer = null;
let shuttingDown = false;

async function shutdown(signal) {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;
  console.log(`Payment Service received ${signal}, shutting down...`);

  stopOutboxWorker();
  stopOrderEventWorker();

  if (httpServer) {
    await new Promise((resolve) => httpServer.close(resolve));
  }

  await mongoose.connection.close().catch(() => null);
  process.exit(0);
}

async function startServer() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not configured for payment-service");
    }

    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
    });

    console.log("Payment Service connected to MongoDB");

    startOutboxWorker();
    startOrderEventWorker();

    httpServer = app.listen(PORT, () => {
      console.log(`Payment Service running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Payment Service failed to start:", error.message);
    process.exit(1);
  }
}

["SIGINT", "SIGTERM"].forEach((signal) => {
  process.on(signal, () => {
    shutdown(signal).catch((error) => {
      console.error("Payment Service shutdown error:", error.message);
      process.exit(1);
    });
  });
});

startServer();
