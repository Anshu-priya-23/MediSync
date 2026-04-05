const Payment = require("../models/Payment");
const { processPayment } = require("../config/paymentGateway");
const publisher = require("../events/publisher");

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
  return res.status(202).json({
    accepted: true,
    message: "Event received",
  });
};

exports.createPayment = async (req, res) => {
  const orderId = String(req.body.orderId || "").trim();
  const orderNumber = String(req.body.orderNumber || "").trim();
  const currency = String(req.body.currency || "INR").trim().toUpperCase();
  const amount = Number(req.body.amount || 0);
  const method = String(req.body.method || "upi").trim().toLowerCase();

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

  const gatewayResult = await processPayment({
    amount,
    method,
    forceStatus: req.body.forceStatus,
  });

  payment.status = gatewayResult.success ? "succeeded" : "failed";
  payment.gatewayStatus = gatewayResult.gatewayStatus;
  payment.transactionRef = gatewayResult.transactionRef;
  payment.message = gatewayResult.message;
  payment.paidAt = gatewayResult.success ? new Date() : null;

  payment.history.push({
    status: payment.status,
    message: gatewayResult.message,
  });

  await payment.save();

  try {
    if (payment.status === "succeeded") {
      await publisher.publishPaymentSucceeded(payment);
    } else {
      await publisher.publishPaymentFailed(payment);
    }
  } catch (error) {
    console.warn("Payment status sync warning:", error.message);
  }

  return res.status(201).json({
    message: gatewayResult.message,
    payment: formatPayment(payment),
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
