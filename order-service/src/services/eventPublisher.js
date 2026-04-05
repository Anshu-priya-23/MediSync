const axios = require("axios");
const { randomUUID } = require("node:crypto");
const OutboxEvent = require("../models/OutboxEvent");

const PAYMENT_EVENT_URL = String(process.env.PAYMENT_EVENT_URL || "").trim();
const ANALYTICS_EVENT_URL = String(process.env.ANALYTICS_EVENT_URL || "").trim();
const INTERNAL_SERVICE_SECRET = String(process.env.INTERNAL_SERVICE_SECRET || "").trim();

let workerTimer = null;
let workerTickInProgress = false;

function positiveNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

const OUTBOX_POLL_MS = positiveNumber(process.env.ORDER_OUTBOX_POLL_MS, 1500);
const OUTBOX_BATCH_SIZE = positiveNumber(process.env.ORDER_OUTBOX_BATCH_SIZE, 10);
const OUTBOX_HTTP_TIMEOUT_MS = positiveNumber(process.env.ORDER_EVENT_TIMEOUT_MS, 4000);
const OUTBOX_LOCK_TIMEOUT_MS = positiveNumber(process.env.ORDER_OUTBOX_LOCK_TIMEOUT_MS, 30000);
const OUTBOX_RETRY_BASE_MS = positiveNumber(process.env.ORDER_OUTBOX_RETRY_BASE_MS, 1000);
const OUTBOX_RETRY_MAX_MS = positiveNumber(process.env.ORDER_OUTBOX_RETRY_MAX_MS, 60000);
const OUTBOX_MAX_ATTEMPTS = positiveNumber(process.env.ORDER_OUTBOX_MAX_ATTEMPTS, 8);

function getTargets() {
  return [PAYMENT_EVENT_URL, ANALYTICS_EVENT_URL].filter(Boolean);
}

function retryDelayMs(attempts) {
  const exponent = Math.max(0, Number(attempts || 0) - 1);
  return Math.min(OUTBOX_RETRY_MAX_MS, OUTBOX_RETRY_BASE_MS * 2 ** exponent);
}

function trimErrorMessage(error) {
  const status = error?.response?.status ? `status=${error.response.status}` : "";
  const message = String(error?.message || "unknown error");
  return [status, message].filter(Boolean).join(" ").slice(0, 500);
}

async function enqueueEvent(eventType, payload) {
  const targets = getTargets();

  if (!targets.length) {
    return null;
  }

  return OutboxEvent.create({
    eventId: randomUUID(),
    eventType,
    payload,
    targets,
    status: "pending",
    attempts: 0,
    maxAttempts: OUTBOX_MAX_ATTEMPTS,
    nextAttemptAt: new Date(),
  });
}

async function markEventForRetry(event, errorMessage) {
  const shouldDeadLetter = event.attempts >= event.maxAttempts;

  if (shouldDeadLetter) {
    await OutboxEvent.updateOne(
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
  await OutboxEvent.updateOne(
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
  await OutboxEvent.updateOne(
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

  return OutboxEvent.findOneAndUpdate(
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

  const message = {
    eventId: event.eventId,
    eventType: event.eventType,
    payload: event.payload,
    emittedAt: event.createdAt ? event.createdAt.toISOString() : new Date().toISOString(),
    source: "order-service",
    attempt: event.attempts,
  };

  const deliveryResults = await Promise.allSettled(
    event.targets.map((url) =>
      axios.post(url, message, {
        timeout: OUTBOX_HTTP_TIMEOUT_MS,
        headers,
      })
    )
  );

  const failed = deliveryResults.filter((result) => result.status === "rejected");
  if (!failed.length) {
    await markEventProcessed(event);
    return;
  }

  const errorMessage = failed
    .map((result) => trimErrorMessage(result.reason))
    .filter(Boolean)
    .join(" | ");

  await markEventForRetry(event, errorMessage || "event delivery failed");
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

async function publishOrderCreated(order) {
  try {
    await enqueueEvent("order.created", {
      orderId: String(order._id),
      orderNumber: order.orderNumber,
      userId: String(order.userId),
      totalAmount: Number(order.totalAmount || 0),
      status: order.status,
      paymentStatus: order.paymentStatus,
    });
  } catch (error) {
    console.warn("Outbox enqueue warning (order.created):", error.message);
  }
}

async function publishOrderStatusUpdated(order, previousStatus) {
  try {
    await enqueueEvent("order.status_updated", {
      orderId: String(order._id),
      orderNumber: order.orderNumber,
      userId: String(order.userId),
      previousStatus: previousStatus || "",
      currentStatus: order.status,
      paymentStatus: order.paymentStatus,
    });
  } catch (error) {
    console.warn("Outbox enqueue warning (order.status_updated):", error.message);
  }
}

function startOutboxWorker() {
  if (workerTimer) {
    return;
  }

  processOutboxTick().catch((error) => {
    console.error("Order outbox worker error:", error.message);
  });

  workerTimer = setInterval(() => {
    processOutboxTick().catch((error) => {
      console.error("Order outbox worker error:", error.message);
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
  publishOrderCreated,
  publishOrderStatusUpdated,
  startOutboxWorker,
  stopOutboxWorker,
};
