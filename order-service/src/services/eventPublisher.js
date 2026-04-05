const axios = require("axios");

const PAYMENT_EVENT_URL = String(process.env.PAYMENT_EVENT_URL || "").trim();
const ANALYTICS_EVENT_URL = String(process.env.ANALYTICS_EVENT_URL || "").trim();
const INTERNAL_SERVICE_SECRET = String(process.env.INTERNAL_SERVICE_SECRET || "").trim();

async function publish(eventType, payload) {
  const targets = [PAYMENT_EVENT_URL, ANALYTICS_EVENT_URL].filter(Boolean);

  if (!targets.length) {
    return;
  }

  await Promise.allSettled(
    targets.map((url) =>
      axios.post(
        url,
        {
          eventType,
          payload,
          emittedAt: new Date().toISOString(),
          source: "order-service",
        },
        {
          timeout: Number(process.env.ORDER_EVENT_TIMEOUT_MS || 4000),
          headers: INTERNAL_SERVICE_SECRET
            ? {
                "x-internal-secret": INTERNAL_SERVICE_SECRET,
              }
            : {},
        }
      )
    )
  );
}

async function publishOrderCreated(order) {
  await publish("order.created", {
    orderId: String(order._id),
    orderNumber: order.orderNumber,
    userId: String(order.userId),
    totalAmount: Number(order.totalAmount || 0),
    status: order.status,
    paymentStatus: order.paymentStatus,
  });
}

async function publishOrderStatusUpdated(order, previousStatus) {
  await publish("order.status_updated", {
    orderId: String(order._id),
    orderNumber: order.orderNumber,
    userId: String(order.userId),
    previousStatus: previousStatus || "",
    currentStatus: order.status,
    paymentStatus: order.paymentStatus,
  });
}

function startOutboxWorker() {
  return;
}

function stopOutboxWorker() {
  return;
}

module.exports = {
  publishOrderCreated,
  publishOrderStatusUpdated,
  startOutboxWorker,
  stopOutboxWorker,
};
