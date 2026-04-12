const axios = require("axios");
const Order = require("../models/Order");
const mongoose = require("mongoose");
const redis = require("../config/redis");

// const ORDER_URL = (process.env.ORDER_SERVICE_URL || "http://127.0.0.1:5004").replace(/\/+$/, "");

// const orderApi = axios.create({
//   baseURL: ORDER_URL,
//   timeout: Number(process.env.INVENTORY_TIMEOUT_MS || 7000),
// });

// function toTtlSeconds(ttlMs, fallbackSeconds) {
//   const parsed = Math.floor(Number(ttlMs) / 1000);
//   return Number.isFinite(parsed) && parsed > 0 ? parsed : fallbackSeconds;
// }





const ORDER_SERVICE_INTERNAL_URL = String(
  process.env.ORDER_SERVICE_INTERNAL_URL || "http://127.0.0.1:5004/api/orders/internal"
).replace(/\/+$/, "");
const INTERNAL_SERVICE_SECRET = String(process.env.INTERNAL_SERVICE_SECRET || "").trim();

function statusEquals(value, expected) {
  return String(value || "").trim().toLowerCase() === expected;
}

async function fetchSupplierOrdersFromOrderService(supplierId) {
  const safeSupplierId = String(supplierId || "").trim();
  console.log("safeSupplierId",safeSupplierId);
  const url = `${ORDER_SERVICE_INTERNAL_URL}/supplier/${encodeURIComponent(safeSupplierId)}/orders`;
  const headers = INTERNAL_SERVICE_SECRET
    ? { "x-internal-secret": INTERNAL_SERVICE_SECRET }
    : {};

  const response = await axios.get(url, {
    headers,
    timeout: Number(process.env.ORDER_SERVICE_TIMEOUT_MS || 9000),
  });
  console.log("res ssssssssss",response.data);

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
    await redis.set(cacheKey, JSON.stringify(orders), "EX", 60);
    return orders;
  } catch (error) {
    console.error("Supplier orders fetch failed:", error);
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

    await redis.set(cacheKey, JSON.stringify(finalData), "EX", 60);
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










// ======================
// GET ORDERS BY SUPPLIER (WITH CACHE)
// ======================
// exports.getOrdersBySupplier = async (supplierId) => {
//   const cacheKey = `orders:${supplierId}`;

//   try {
//     const cached = await redis.get(cacheKey);

//     if (cached) {
//       console.log("Cache HIT ✅");
//       return JSON.parse(cached);
//     }

//     console.log("Cache MISS ❌");

//     const orders = await Order.find({ supplierId }).sort({ createdAt: -1 });

//     await redis.set(cacheKey, JSON.stringify(orders), "EX", 60);

//     return orders;

//   } catch (error) {
//     console.error("Redis error, fallback to DB:", error.message);
//     return await Order.find({ supplierId }).sort({ createdAt: -1 });
//   }
// };



// ======================
// DASHBOARD STATS (RAW)
// ======================
// exports.getOrderStats = async (supplierId) => {
//   return await Order.aggregate([
//     {
//       $match: {
//         supplierId: new mongoose.Types.ObjectId(supplierId),
//       },
//     },
//     {
//       $facet: {
//         totalOrders: [{ $count: "count" }],

//         totalBought: [
//           { $unwind: "$medicines" },
//           {
//             $group: {
//               _id: null,
//               total: { $sum: "$medicines.quantity" },
//             },
//           },
//         ],

//         totalReturned: [
//           { $match: { status: "Returned" } },
//           { $count: "count" },
//         ],

//         totalCancelled: [
//           { $match: { status: "Cancelled" } },
//           { $count: "count" },
//         ],
//       },
//     },
//   ]);
// };



// // ======================
// // FINAL STATS (WITH CACHE)
// // ======================
// exports.getSupplierStats = async (supplierId) => {
//   const cacheKey = `stats:${supplierId}`;

//   try {
//     const cached = await redis.get(cacheKey);

//     if (cached) {
//       console.log("Stats Cache HIT ✅");
//       return JSON.parse(cached);
//     }

//     console.log("Stats Cache MISS ❌");

//     const id = new mongoose.Types.ObjectId(supplierId);

//     const result = await Order.aggregate([
//       {
//         $match: { supplierId: id },
//       },
//       {
//         $facet: {
//           totalOrders: [{ $count: "count" }],

//           totalBought: [
//             { $unwind: "$medicines" },
//             {
//               $group: {
//                 _id: null,
//                 total: { $sum: "$medicines.quantity" },
//               },
//             },
//           ],

//           totalReturned: [
//             { $match: { status: "Returned" } },
//             { $count: "count" },
//           ],

//           totalCancelled: [
//             { $match: { status: "Cancelled" } },
//             { $count: "count" },
//           ],
//         },
//       },
//     ]);

//     const finalData = {
//       totalOrders: result[0].totalOrders[0]?.count || 0,
//       totalBought: result[0].totalBought[0]?.total || 0,
//       totalReturned: result[0].totalReturned[0]?.count || 0,
//       totalCancelled: result[0].totalCancelled[0]?.count || 0,
//     };

//     await redis.set(cacheKey, JSON.stringify(finalData), "EX", 60);

//     return finalData;

//   } catch (error) {
//     console.error("Redis error, fallback to DB:", error.message);

//     const id = new mongoose.Types.ObjectId(supplierId);

//     const result = await Order.aggregate([
//       { $match: { supplierId: id } },
//       {
//         $facet: {
//           totalOrders: [{ $count: "count" }],
//           totalBought: [
//             { $unwind: "$medicines" },
//             {
//               $group: {
//                 _id: null,
//                 total: { $sum: "$medicines.quantity" },
//               },
//             },
//           ],
//           totalReturned: [
//             { $match: { status: "Returned" } },
//             { $count: "count" },
//           ],
//           totalCancelled: [
//             { $match: { status: "Cancelled" } },
//             { $count: "count" },
//           ],
//         },
//       },
//     ]);

//     return {
//       totalOrders: result[0].totalOrders[0]?.count || 0,
//       totalBought: result[0].totalBought[0]?.total || 0,
//       totalReturned: result[0].totalReturned[0]?.count || 0,
//       totalCancelled: result[0].totalCancelled[0]?.count || 0,
//     };
//   }
// };