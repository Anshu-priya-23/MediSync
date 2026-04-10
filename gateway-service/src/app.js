const express = require("express");
const cors = require("cors");
const axios = require("axios");
const { buildServiceRegistry } = require("./config/serviceRegistry");

const app = express();
const services = buildServiceRegistry();

app.use(cors());
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

app.get("/health", (req, res) => {
  res.status(200).json({
    service: "gateway-service",
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

const hopByHopHeaders = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
]);

function copyHeadersToClient(response, res) {
  Object.entries(response.headers || {}).forEach(([key, value]) => {
    const lower = String(key || "").toLowerCase();
    if (hopByHopHeaders.has(lower)) {
      return;
    }

    if (typeof value !== "undefined") {
      res.setHeader(key, value);
    }
  });
}

function createForwarder(target, upstreamPrefix) {
  return async (req, res) => {
    const safeTarget = String(target || "").replace(/\/+$/, "");
    const safePrefix = String(upstreamPrefix || "").replace(/\/+$/, "");

    if (!safeTarget) {
      return res.status(500).json({ message: "Gateway target is not configured" });
    }

    const url = `${safeTarget}${safePrefix}${req.url}`;

    try {
      const response = await axios({
        method: req.method,
        url,
        params: req.query,
        data: ["GET", "HEAD"].includes(req.method.toUpperCase()) ? undefined : req.body,
        timeout: Number(process.env.GATEWAY_TIMEOUT_MS || 15000),
        validateStatus: () => true,
        headers: {
          ...(req.headers.authorization
            ? { authorization: req.headers.authorization }
            : {}),
          ...(req.headers["idempotency-key"]
            ? { "idempotency-key": req.headers["idempotency-key"] }
            : {}),
          ...(req.headers["x-internal-secret"]
            ? { "x-internal-secret": req.headers["x-internal-secret"] }
            : {}),
          ...(req.headers["content-type"]
            ? { "content-type": req.headers["content-type"] }
            : {}),
        },
      });

      copyHeadersToClient(response, res);
      return res.status(response.status).send(response.data);
    } catch (error) {
      return res.status(502).json({
        message: "Gateway forwarding failed",
        detail: error.message,
      });
    }
  };
}

app.use("/api/auth", createForwarder(services.auth, "/api/auth"));
app.use("/api/medicines", createForwarder(services.inventory, "/api/medicines"));
app.use("/api/users", createForwarder(services.inventory, "/api/users"));
app.use("/api/orders", createForwarder(services.orders, "/api/orders"));
app.use("/api/payments", createForwarder(services.payments, "/api/payments"));

module.exports = app;
