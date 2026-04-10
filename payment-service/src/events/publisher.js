const axios = require("axios");
const { randomUUID } = require("node:crypto");
const PaymentOutboxEvent = require("../models/PaymentOutboxEvent");

const ORDER_SERVICE_INTERNAL_URL = (
  process.env.ORDER_SERVICE_INTERNAL_URL || "http://127.0.0.1:5003/api/orders/internal"
).replace(/\/+$/, "");

const INTERNAL_SERVICE_SECRET = String(process.env.INTERNAL_SERVICE_SECRET || "").trim();

let workerTimer = null;
let workerTickInProgress = false;

function positiveNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

const OUTBOX_POLL_MS = positiveNumber(process.env.PAYMENT_OUTBOX_POLL_MS, 1500);
const OUTBOX_BATCH_SIZE = positiveNumber(process.env.PAYMENT_OUTBOX_BATCH_SIZE, 10);
const OUTBOX_HTTP_TIMEOUT_MS = positiveNumber(process.env.PAYMENT_EVENT_TIMEOUT_MS, 5000);
const OUTBOX_LOCK_TIMEOUT_MS = positiveNumber(process.env.PAYMENT_OUTBOX_LOCK_TIMEOUT_MS, 30000);
const OUTBOX_RETRY_BASE_MS = positiveNumber(process.env.PAYMENT_OUTBOX_RETRY_BASE_MS, 1000);
const OUTBOX_RETRY_MAX_MS = positiveNumber(process.env.PAYMENT_OUTBOX_RETRY_MAX_MS, 60000);
const OUTBOX_MAX_ATTEMPTS = positiveNumber(process.env.PAYMENT_OUTBOX_MAX_ATTEMPTS, 8);

function retryDelayMs(attempts) {
  const exponent = Math.max(0, Number(attempts || 0) - 1);
  return Math.min(OUTBOX_RETRY_MAX_MS, OUTBOX_RETRY_BASE_MS * 2 ** exponent);
}

function trimErrorMessage(error) {
  const status = error?.response?.status ? `status=${error.response.status}` : "";
  const message = String(error?.message || "unknown error");
  return [status, message].filter(Boolean).join(" ").slice(0, 500);
}

async function enqueueSyncOrderPaymentStatus(orderId, paymentStatus, status, metadata = {}) {
  if (!orderId) {
    return null;
  }

  return PaymentOutboxEvent.create({
    eventId: randomUUID(),
    eventType: "payment.status_updated",
    method: "PATCH",
    targetUrl: `${ORDER_SERVICE_INTERNAL_URL}/${encodeURIComponent(orderId)}/payment-status`,
    payload: {
      paymentStatus,
      status,
      metadata,
    },
    status: "pending",
    attempts: 0,
    maxAttempts: OUTBOX_MAX_ATTEMPTS,
    nextAttemptAt: new Date(),
  });
}

async function markEventForRetry(event, errorMessage) {
  const shouldDeadLetter = event.attempts >= event.maxAttempts;

  if (shouldDeadLetter) {
    await PaymentOutboxEvent.updateOne(
      { _id: event._id },
      {
        $set: {
          status: "dead_letter",
          processedAt: new Date(),
          lockedAt: null,
          lastError: errorMessage,
        },
      }
    );
    return;
  }

  const delayMs = retryDelayMs(event.attempts);
  await PaymentOutboxEvent.updateOne(
    { _id: event._id },
    {
      $set: {
        status: "pending",
        nextAttemptAt: new Date(Date.now() + delayMs),
        lockedAt: null,
        lastError: errorMessage,
      },
    }
  );
}

async function markEventProcessed(event) {
  await PaymentOutboxEvent.updateOne(
    { _id: event._id },
    {
      $set: {
        status: "processed",
        processedAt: new Date(),
        lockedAt: null,
        lastError: "",
      },
    }
  );
}

async function claimNextPendingEvent() {
  const now = new Date();
  const staleLockThreshold = new Date(now.getTime() - OUTBOX_LOCK_TIMEOUT_MS);

  return PaymentOutboxEvent.findOneAndUpdate(
    {
      status: "pending",
      nextAttemptAt: { $lte: now },
      $or: [{ lockedAt: null }, { lockedAt: { $lte: staleLockThreshold } }],
    },
    {
      $set: {
        status: "processing",
        lockedAt: now,
      },
      $inc: {
        attempts: 1,
      },
    },
    {
      sort: { nextAttemptAt: 1, createdAt: 1 },
      new: true,
    }
  );
}

async function deliverEvent(event) {
  const headers = INTERNAL_SERVICE_SECRET
    ? {
        "x-internal-secret": INTERNAL_SERVICE_SECRET,
      }
    : {};

  await axios({
    method: String(event.method || "PATCH").toLowerCase(),
    url: event.targetUrl,
    data: event.payload || {},
    timeout: OUTBOX_HTTP_TIMEOUT_MS,
    headers,
  });

  await markEventProcessed(event);
}

async function processOutboxTick() {
  if (workerTickInProgress) {
    return;
  }

  workerTickInProgress = true;
  try {
    for (let index = 0; index < OUTBOX_BATCH_SIZE; index += 1) {
      const event = await claimNextPendingEvent();
      if (!event) {
        break;
      }

      try {
        await deliverEvent(event);
      } catch (error) {
        await markEventForRetry(event, trimErrorMessage(error));
      }
    }
  } finally {
    workerTickInProgress = false;
  }
}

async function publishPaymentSucceeded(payment) {
  try {
    await enqueueSyncOrderPaymentStatus(payment.orderId, "paid", "confirmed", {
      paymentId: String(payment._id || ""),
      transactionRef: payment.transactionRef || "",
    });
  } catch (error) {
    console.warn("Outbox enqueue warning (payment success):", error.message);
  }
}

async function publishPaymentFailed(payment) {
  try {
    await enqueueSyncOrderPaymentStatus(payment.orderId, "failed", "payment_pending", {
      paymentId: String(payment._id || ""),
      transactionRef: payment.transactionRef || "",
    });
  } catch (error) {
    console.warn("Outbox enqueue warning (payment failed):", error.message);
  }
}

async function publishPaymentRefunded(payment) {
  try {
    await enqueueSyncOrderPaymentStatus(payment.orderId, "refunded", "cancelled", {
      paymentId: String(payment._id || ""),
      transactionRef: payment.transactionRef || "",
    });
  } catch (error) {
    console.warn("Outbox enqueue warning (payment refunded):", error.message);
  }
}

function startOutboxWorker() {
  if (workerTimer) {
    return;
  }

  processOutboxTick().catch((error) => {
    console.error("Payment outbox worker error:", error.message);
  });

  workerTimer = setInterval(() => {
    processOutboxTick().catch((error) => {
      console.error("Payment outbox worker error:", error.message);
    });
  }, OUTBOX_POLL_MS);

  if (typeof workerTimer.unref === "function") {
    workerTimer.unref();
  }
}

function stopOutboxWorker() {
  if (!workerTimer) {
    return;
  }

  clearInterval(workerTimer);
  workerTimer = null;
}

module.exports = {
  publishPaymentSucceeded,
  publishPaymentFailed,
  publishPaymentRefunded,
  startOutboxWorker,
  stopOutboxWorker,
};
