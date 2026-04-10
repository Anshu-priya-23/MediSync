const express = require("express");
const proxy = require("express-http-proxy");
const { buildServiceRegistry } = require("../config/serviceRegistry");

const router = express.Router();
const services = buildServiceRegistry();

const forwardHeaders = (proxyReqOpts, srcReq) => {
  if (srcReq.headers.authorization) {
    proxyReqOpts.headers.authorization = srcReq.headers.authorization;
  }

  if (srcReq.headers["idempotency-key"]) {
    proxyReqOpts.headers["idempotency-key"] = srcReq.headers["idempotency-key"];
  }

  if (srcReq.headers["x-internal-secret"]) {
    proxyReqOpts.headers["x-internal-secret"] = srcReq.headers["x-internal-secret"];
  }

  return proxyReqOpts;
};

router.use(
  "/medicines",
  proxy(services.inventory, {
    proxyReqPathResolver: (req) => `/api/medicines${req.url}`,
    proxyReqOptDecorator: forwardHeaders,
  })
);

router.use(
  "/users",
  proxy(services.inventory, {
    proxyReqPathResolver: (req) => `/api/users${req.url}`,
    proxyReqOptDecorator: forwardHeaders,
  })
);

router.use(
  "/orders",
  proxy(services.orders, {
    proxyReqPathResolver: (req) => `/api/orders${req.url}`,
    proxyReqOptDecorator: forwardHeaders,
  })
);

router.use(
  "/payments",
  proxy(services.payments, {
    proxyReqPathResolver: (req) => `/api/payments${req.url}`,
    proxyReqOptDecorator: forwardHeaders,
  })
);

module.exports = router;
