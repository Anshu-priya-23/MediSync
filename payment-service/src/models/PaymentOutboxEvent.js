const mongoose = require("mongoose");

const paymentOutboxEventSchema = new mongoose.Schema(
  {
    eventId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    eventType: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    method: {
      type: String,
      default: "PATCH",
      trim: true,
    },
    targetUrl: {
      type: String,
      required: true,
      trim: true,
    },
    payload: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    status: {
      type: String,
      enum: ["pending", "processing", "processed", "dead_letter"],
      default: "pending",
      index: true,
    },
    attempts: {
      type: Number,
      default: 0,
      min: 0,
    },
    maxAttempts: {
      type: Number,
      default: 8,
      min: 1,
    },
    nextAttemptAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    lockedAt: {
      type: Date,
      default: null,
      index: true,
    },
    processedAt: {
      type: Date,
      default: null,
    },
    lastError: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { timestamps: true }
);

paymentOutboxEventSchema.index({ status: 1, nextAttemptAt: 1, createdAt: 1 });

module.exports = mongoose.model("PaymentOutboxEvent", paymentOutboxEventSchema);
