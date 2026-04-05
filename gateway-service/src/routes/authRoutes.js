const express = require("express");
const proxy = require("express-http-proxy");
const { buildServiceRegistry } = require("../config/serviceRegistry");

const router = express.Router();
const services = buildServiceRegistry();

router.use(
  "/",
  proxy(services.auth, {
    proxyReqPathResolver: (req) => `/api/auth${req.url}`,
  })
);

module.exports = router;
