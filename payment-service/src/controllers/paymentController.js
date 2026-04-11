const Payment = require("../models/Payment");
const { processPayment } = require("../config/paymentGateway");
const publisher = require("../events/publisher");
const { enqueueIncomingOrderEvent } = require("../events/orderEventConsumer");
const stripeSecretKey = String(process.env.STRIPE_SECRET_KEY || "").trim();
const stripePublishableKey = String(process.env.STRIPE_PUBLIC_KEY || "").trim();
const stripe = stripeSecretKey ? require("stripe")(stripeSecretKey) : null;

function stripeKeyFingerprint(key) {
  return String(key || "")
    .trim()
    .split("_")[2]
    ?.slice(0, 10);
}

function hasStripeKeyMismatch() {
  if (!stripeSecretKey || !stripePublishableKey) {
    return false;
  }
  return stripeKeyFingerprint(stripeSecretKey) !== stripeKeyFingerprint(stripePublishableKey);
}

function randomPaymentNumber() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const rand = Math.floor(Math.random() * 9000) + 1000;
  return `PAY-${yyyy}${mm}${dd}-${rand}`;
}

function formatPayment(payment) {
  return {
    id: payment._id,
    paymentNumber: payment.paymentNumber,
    orderId: payment.orderId,
    orderNumber: payment.orderNumber,
    userId: payment.userId,
    amount: payment.amount,
    currency: payment.currency,
    method: payment.method,
    status: payment.status,
    gatewayStatus: payment.gatewayStatus,
    transactionRef: payment.transactionRef,
    message: payment.message,
    paidAt: payment.paidAt,
    history: payment.history,
    createdAt: payment.createdAt,
    updatedAt: payment.updatedAt,
  };
}

function ensureOwnerOrPrivileged(req, payment) {
  const role = req.user?.role;
  if (["admin", "pharmacist"].includes(role)) {
    return true;
  }
  return String(payment.userId) === String(req.user?.userId);
}

exports.handleOrderEvents = async (req, res) => {
  const eventType = String(req.body?.eventType || "").trim();
  if (!eventType) {
    return res.status(400).json({
      message: "eventType is required",
    });
  }

  const accepted = await enqueueIncomingOrderEvent({
    eventId: req.body?.eventId || req.headers["x-event-id"],
    source: req.body?.source || "order-service",
    eventType,
    payload: req.body?.payload,
    emittedAt: req.body?.emittedAt,
  });

  return res.status(202).json({
    accepted: true,
    duplicated: accepted.duplicated,
    eventId: accepted.eventId,
    message: accepted.duplicated ? "Duplicate event ignored" : "Event queued for async processing",
  });
};

exports.createPayment = async (req, res) => {
  const orderId = String(req.body.orderId || "").trim();
  const orderNumber = String(req.body.orderNumber || "").trim();
  const currency = String(req.body.currency || "INR").trim().toUpperCase();
  const amount = Number(req.body.amount || 0);
  const method = String(req.body.method || "card").trim().toLowerCase();

  if (!orderId) {
    return res.status(400).json({ message: "orderId is required" });
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    return res.status(400).json({ message: "amount must be greater than 0" });
  }

  const latestSuccess = await Payment.findOne({
    orderId,
    userId: req.user.userId,
    status: "succeeded",
  }).sort({ createdAt: -1 });

  if (latestSuccess) {
    return res.status(200).json({
      message: "Payment already successful for this order",
      payment: formatPayment(latestSuccess),
    });
  }

  const payment = await Payment.create({
    paymentNumber: randomPaymentNumber(),
    orderId,
    orderNumber,
    userId: req.user.userId,
    amount,
    currency,
    method,
    status: "pending",
    gatewayStatus: "processing",
    message: "Payment initiated",
    history: [
      {
        status: "pending",
        message: "Payment initiated",
      },
    ],
  });

  // 🚀 THE FIX: Isolate COD logic from Stripe Gateway logic
  if (method === "cod") {
    payment.status = "pending";
    payment.gatewayStatus = "awaiting_delivery";
    payment.transactionRef = `COD-${Date.now()}`;
    payment.message = "Cash on delivery selected";
    payment.paidAt = null;
  } else {
    // Regular flow for cards
    const gatewayResult = await processPayment({
      amount,
      method,
      forceStatus: req.body.forceStatus,
    });

    payment.status = gatewayResult.success ? "succeeded" : "failed";
    payment.gatewayStatus = gatewayResult.gatewayStatus;
    payment.transactionRef = gatewayResult.transactionRef || req.body.transactionRef;
    payment.message = gatewayResult.message;
    payment.paidAt = gatewayResult.success ? new Date() : null;
  }

  payment.history.push({
    status: payment.status,
    message: payment.message,
  });

  await payment.save();

  try {
    // 🚀 THE FIX: Trigger the 'Order Success' pipeline for both Paid items AND COD
    if (payment.status === "succeeded" || method === "cod") {
      await publisher.publishPaymentSucceeded(payment);
    } else {
      await publisher.publishPaymentFailed(payment);
    }
  } catch (error) {
    console.warn("Payment status sync warning:", error.message);
  }

  return res.status(201).json({
    message: payment.message,
    payment: formatPayment(payment),
  });
};

exports.createStripeIntent = async (req, res) => {
  try {
    if (!stripe) {
      return res.status(500).json({
        message: "Stripe is not configured on payment-service. Missing STRIPE_SECRET_KEY.",
      });
    }

    if (hasStripeKeyMismatch()) {
      return res.status(500).json({
        message: "Stripe keys are misconfigured. STRIPE_SECRET_KEY and STRIPE_PUBLIC_KEY must belong to the same Stripe account.",
      });
    }

    const { amount, orderId } = req.body;
    
    // 🚀 THE FIX: Minimum amount bypass for test mode. 
    // Forces minimum to Rs 50 so Stripe doesn't block small test orders
    const finalAmount = amount < 50 ? 50 : amount;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(finalAmount * 100),
      currency: "inr",
      metadata: { orderId, userId: req.user.userId },
    });

    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      publishableKey: stripePublishableKey || undefined,
    });
  } catch (error) {
    console.error("Stripe Intent Error:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.getStripeConfig = async (_req, res) => {
  if (!stripePublishableKey) {
    return res.status(500).json({
      message: "Stripe publishable key is missing on payment-service.",
    });
  }

  if (hasStripeKeyMismatch()) {
    return res.status(500).json({
      message: "Stripe keys are misconfigured. STRIPE_SECRET_KEY and STRIPE_PUBLIC_KEY must belong to the same Stripe account.",
    });
  }

  return res.status(200).json({
    publishableKey: stripePublishableKey,
  });
};

exports.syncStripePayment = async (req, res) => {
  return res.status(501).json({
    message: "Stripe sync is not enabled in this local setup",
  });
};

exports.getPaymentByOrderId = async (req, res) => {
  const orderId = String(req.params.orderId || "").trim();

  const payments = await Payment.find({ orderId }).sort({ createdAt: -1 }).limit(50);

  const visible = payments.filter((payment) => ensureOwnerOrPrivileged(req, payment));

  return res.status(200).json({
    items: visible.map(formatPayment),
  });
};

exports.getPaymentById = async (req, res) => {
  const payment = await Payment.findById(req.params.paymentId);
  if (!payment) {
    return res.status(404).json({ message: "Payment not found" });
  }

  if (!ensureOwnerOrPrivileged(req, payment)) {
    return res.status(403).json({ message: "Forbidden" });
  }

  return res.status(200).json({ payment: formatPayment(payment) });
};

exports.listPayments = async (req, res) => {
  const filter = {};
  if (req.query.status) {
    filter.status = String(req.query.status).trim().toLowerCase();
  }

  const payments = await Payment.find(filter).sort({ createdAt: -1 }).limit(200);

  return res.status(200).json({
    items: payments.map(formatPayment),
  });
};
