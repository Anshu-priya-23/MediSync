function buildServiceRegistry() {
  return {
    auth: process.env.AUTH_SERVICE_URL || "http://127.0.0.1:5001",
    inventory: process.env.INVENTORY_SERVICE_URL || "http://127.0.0.1:5002",
    orders: process.env.ORDER_SERVICE_URL || "http://127.0.0.1:5003",
    payments: process.env.PAYMENT_SERVICE_URL || "http://127.0.0.1:5004",
    analytics: process.env.ANALYTICS_SERVICE_URL || "http://127.0.0.1:5005",
  };
}

module.exports = {
  buildServiceRegistry,
};
