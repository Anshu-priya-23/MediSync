const mongoose = require("mongoose");

const paymentHistorySchema = new mongoose.Schema(
  {
    status: { type: String, required: true },
    message: { type: String, default: "" },
    at: { type: Date, default: Date.now },
  },
  { _id: false }
);

const paymentSchema = new mongoose.Schema(
  {
    paymentNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    orderId: {
      type: String,
      required: true,
      index: true,
    },
    orderNumber: {
      type: String,
      default: "",
      trim: true,
    },
    userId: {
      type: String,
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: "INR",
      trim: true,
    },
    method: {
      type: String,
      default: "upi",
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "succeeded", "failed", "refunded"],
      default: "pending",
      index: true,
    },
    gatewayStatus: {
      type: String,
      default: "",
      trim: true,
    },
    transactionRef: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },
    message: {
      type: String,
      default: "",
      trim: true,
    },
    paidAt: {
      type: Date,
      default: null,
    },
    history: {
      type: [paymentHistorySchema],
      default: [],
    },
  },
  { timestamps: true, optimisticConcurrency: true }
);

paymentSchema.index({ orderId: 1, userId: 1, createdAt: -1 });

module.exports = mongoose.model("Payment", paymentSchema);
