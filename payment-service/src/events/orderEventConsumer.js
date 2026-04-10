const { randomUUID } = require("node:crypto");
const IncomingOrderEvent = require("../models/IncomingOrderEvent");
const Payment = require("../models/Payment");
const publisher = require("./publisher");

let workerTimer = null;
let workerTickInProgress = false;

function positiveNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

const INBOX_POLL_MS = positiveNumber(process.env.PAYMENT_EVENT_INBOX_POLL_MS, 1500);
const INBOX_BATCH_SIZE = positiveNumber(process.env.PAYMENT_EVENT_INBOX_BATCH_SIZE, 10);
const INBOX_LOCK_TIMEOUT_MS = positiveNumber(process.env.PAYMENT_EVENT_INBOX_LOCK_TIMEOUT_MS, 30000);
const INBOX_RETRY_BASE_MS = positiveNumber(process.env.PAYMENT_EVENT_INBOX_RETRY_BASE_MS, 1000);
const INBOX_RETRY_MAX_MS = positiveNumber(process.env.PAYMENT_EVENT_INBOX_RETRY_MAX_MS, 60000);
const INBOX_MAX_ATTEMPTS = positiveNumber(process.env.PAYMENT_EVENT_INBOX_MAX_ATTEMPTS, 8);

function retryDelayMs(attempts) {
  const exponent = Math.max(0, Number(attempts || 0) - 1);
  return Math.min(INBOX_RETRY_MAX_MS, INBOX_RETRY_BASE_MS * 2 ** exponent);
}

function trimErrorMessage(error) {
  return String(error?.message || "unknown error").slice(0, 500);
}

async function enqueueIncomingOrderEvent({
  eventId,
  source,
  eventType,
  payload,
  emittedAt,
}) {
  const resolvedEventId = String(eventId || "").trim() || randomUUID();
  const safePayload = payload && typeof payload === "object" ? payload : {};
  const parsedDate = emittedAt ? new Date(emittedAt) : new Date();
  const resolvedEmittedAt = Number.isNaN(parsedDate.getTime()) ? new Date() : parsedDate;

  try {
    await IncomingOrderEvent.create({
      eventId: resolvedEventId,
      source: String(source || "order-service").trim() || "order-service",
      eventType: String(eventType || "").trim(),
      payload: safePayload,
      emittedAt: resolvedEmittedAt,
      status: "pending",
      attempts: 0,
      maxAttempts: INBOX_MAX_ATTEMPTS,
      nextAttemptAt: new Date(),
    });

    return { eventId: resolvedEventId, duplicated: false };
  } catch (error) {
    if (error?.code === 11000) {
      return { eventId: resolvedEventId, duplicated: true };
    }
    throw error;
  }
}

async function markEventForRetry(event, errorMessage) {
  const shouldDeadLetter = event.attempts >= event.maxAttempts;

  if (shouldDeadLetter) {
    await IncomingOrderEvent.updateOne(
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
  await IncomingOrderEvent.updateOne(
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
  await IncomingOrderEvent.updateOne(
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
  const staleLockThreshold = new Date(now.getTime() - INBOX_LOCK_TIMEOUT_MS);

  return IncomingOrderEvent.findOneAndUpdate(
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

async function handleOrderStatusUpdated(payload) {
  const orderId = String(payload?.orderId || "").trim();
  const currentStatus = String(payload?.currentStatus || payload?.status || "").trim().toLowerCase();
  if (!orderId || currentStatus !== "cancelled") {
    return;
  }

  const latestSucceededPayment = await Payment.findOne({
    orderId,
    status: "succeeded",
  }).sort({ createdAt: -1 });

  if (!latestSucceededPayment) {
    return;
  }

  latestSucceededPayment.status = "refunded";
  latestSucceededPayment.gatewayStatus = "refunded";
  latestSucceededPayment.message = "Refund completed for cancelled order";
  latestSucceededPayment.history.push({
    status: "refunded",
    message: "Auto-refund triggered by order cancellation event",
  });
  await latestSucceededPayment.save();

  await publisher.publishPaymentRefunded(latestSucceededPayment);
}

async function processIncomingEvent(event) {
  const eventType = String(event.eventType || "").trim().toLowerCase();

  if (eventType === "order.status_updated") {
    await handleOrderStatusUpdated(event.payload || {});
    return;
  }

  if (eventType === "order.created") {
    return;
  }
}

async function processInboxTick() {
  if (workerTickInProgress) {
    return;
  }

  workerTickInProgress = true;
  try {
    for (let index = 0; index < INBOX_BATCH_SIZE; index += 1) {
      const event = await claimNextPendingEvent();
      if (!event) {
        break;
      }

      try {
        await processIncomingEvent(event);
        await markEventProcessed(event);
      } catch (error) {
        await markEventForRetry(event, trimErrorMessage(error));
      }
    }
  } finally {
    workerTickInProgress = false;
  }
}

function startOrderEventWorker() {
  if (workerTimer) {
    return;
  }

  processInboxTick().catch((error) => {
    console.error("Payment inbox worker error:", error.message);
  });

  workerTimer = setInterval(() => {
    processInboxTick().catch((error) => {
      console.error("Payment inbox worker error:", error.message);
    });
  }, INBOX_POLL_MS);

  if (typeof workerTimer.unref === "function") {
    workerTimer.unref();
  }
}

function stopOrderEventWorker() {
  if (!workerTimer) {
    return;
  }

  clearInterval(workerTimer);
  workerTimer = null;
}

module.exports = {
  enqueueIncomingOrderEvent,
  startOrderEventWorker,
  stopOrderEventWorker,
};
