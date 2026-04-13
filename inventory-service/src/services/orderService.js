const axios = require("axios");
const redis = require("../config/redis");

const ORDER_SERVICE_INTERNAL_URL = String(
  process.env.ORDER_SERVICE_INTERNAL_URL || "http://127.0.0.1:5003/api/orders/internal"
).replace(/\/+$/, "");
const INTERNAL_SERVICE_SECRET = String(process.env.INTERNAL_SERVICE_SECRET || "").trim();
const SUPPLIER_ORDERS_CACHE_TTL_SECONDS = Number(process.env.SUPPLIER_ORDERS_CACHE_TTL_SECONDS || 15);
const SUPPLIER_STATS_CACHE_TTL_SECONDS = Number(process.env.SUPPLIER_STATS_CACHE_TTL_SECONDS || 15);

function statusEquals(value, expected) {
  return String(value || "").trim().toLowerCase() === expected;
}

async function fetchSupplierOrdersFromOrderService(supplierId) {
  const safeSupplierId = String(supplierId || "").trim();
  const url = `${ORDER_SERVICE_INTERNAL_URL}/supplier/${encodeURIComponent(safeSupplierId)}/orders`;
  const headers = INTERNAL_SERVICE_SECRET
    ? { "x-internal-secret": INTERNAL_SERVICE_SECRET }
    : {};

  const response = await axios.get(url, {
    headers,
    timeout: Number(process.env.ORDER_SERVICE_TIMEOUT_MS || 9000),
  });

  return Array.isArray(response.data) ? response.data : [];
}

// ======================
// GET ORDERS BY SUPPLIER (WITH CACHE)
// ======================
exports.getOrdersBySupplier = async (supplierId) => {
  const safeSupplierId = String(supplierId || "").trim();
  const cacheKey = `orders:${safeSupplierId}`;

  try {
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const orders = await fetchSupplierOrdersFromOrderService(safeSupplierId);
    await redis.set(cacheKey, JSON.stringify(orders), "EX", SUPPLIER_ORDERS_CACHE_TTL_SECONDS);
    return orders;
  } catch (error) {
    console.error("Supplier orders fetch failed:", error.message);
    return [];
  }
};

// ======================
// DASHBOARD STATS (RAW)
// ======================
exports.getOrderStats = async (supplierId) => {
  const orders = await exports.getOrdersBySupplier(supplierId);
  return [
    {
      totalOrders: [{ count: orders.length }],
      totalBought: [
        {
          total: orders.reduce(
            (sum, order) =>
              sum +
              (order.medicines || []).reduce(
                (inner, med) => inner + Number(med?.quantity || 0),
                0
              ),
            0
          ),
        },
      ],
      totalReturned: [{ count: orders.filter((order) => statusEquals(order.status, "returned")).length }],
      totalCancelled: [{ count: orders.filter((order) => statusEquals(order.status, "cancelled")).length }],
    },
  ];
};

// ======================
// FINAL STATS (WITH CACHE)
// ======================
exports.getSupplierStats = async (supplierId) => {
  const safeSupplierId = String(supplierId || "").trim();
  const cacheKey = `stats:${safeSupplierId}`;

  try {
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const orders = await exports.getOrdersBySupplier(safeSupplierId);
    const finalData = {
      totalOrders: orders.length,
      totalBought: orders.reduce(
        (sum, order) =>
          sum +
          (order.medicines || []).reduce(
            (inner, med) => inner + Number(med?.quantity || 0),
            0
          ),
        0
      ),
      totalReturned: orders.filter((order) => statusEquals(order.status, "returned")).length,
      totalCancelled: orders.filter((order) => statusEquals(order.status, "cancelled")).length,
    };

    await redis.set(cacheKey, JSON.stringify(finalData), "EX", SUPPLIER_STATS_CACHE_TTL_SECONDS);
    return finalData;
  } catch (error) {
    console.error("Supplier stats fetch failed:", error.message);
    return {
      totalOrders: 0,
      totalBought: 0,
      totalReturned: 0,
      totalCancelled: 0,
    };
  }
};