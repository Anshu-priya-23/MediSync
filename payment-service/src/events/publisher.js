const axios = require("axios");

const ORDER_SERVICE_INTERNAL_URL = (
  process.env.ORDER_SERVICE_INTERNAL_URL || "http://127.0.0.1:5003/api/orders/internal"
).replace(/\/+$/, "");

const INTERNAL_SERVICE_SECRET = String(process.env.INTERNAL_SERVICE_SECRET || "").trim();

async function syncOrderPaymentStatus(orderId, paymentStatus, status) {
  if (!orderId) {
    return;
  }

  await axios.patch(
    `${ORDER_SERVICE_INTERNAL_URL}/${orderId}/payment-status`,
    {
      paymentStatus,
      status,
    },
    {
      timeout: Number(process.env.PAYMENT_EVENT_TIMEOUT_MS || 5000),
      headers: INTERNAL_SERVICE_SECRET
        ? {
            "x-internal-secret": INTERNAL_SERVICE_SECRET,
          }
        : {},
    }
  );
}

async function publishPaymentSucceeded(payment) {
  await syncOrderPaymentStatus(payment.orderId, "paid", "confirmed");
}

async function publishPaymentFailed(payment) {
  await syncOrderPaymentStatus(payment.orderId, "failed", "payment_pending");
}

module.exports = {
  publishPaymentSucceeded,
  publishPaymentFailed,
};
