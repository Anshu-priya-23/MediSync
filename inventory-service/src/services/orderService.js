const Order = require("../models/Order");
const mongoose = require("mongoose");
const redis = require("../config/redis");


// ======================
// GET ORDERS BY SUPPLIER (WITH CACHE)
// ======================
exports.getOrdersBySupplier = async (supplierId) => {
  const cacheKey = `orders:${supplierId}`;

  try {
    const cached = await redis.get(cacheKey);

    if (cached) {
      console.log("Cache HIT ✅");
      return JSON.parse(cached);
    }

    console.log("Cache MISS ❌");

    const orders = await Order.find({ supplierId }).sort({ createdAt: -1 });

    await redis.set(cacheKey, JSON.stringify(orders), "EX", 60);

    return orders;

  } catch (error) {
    console.error("Redis error, fallback to DB:", error.message);
    return await Order.find({ supplierId }).sort({ createdAt: -1 });
  }
};



// ======================
// DASHBOARD STATS (RAW)
// ======================
exports.getOrderStats = async (supplierId) => {
  return await Order.aggregate([
    {
      $match: {
        supplierId: new mongoose.Types.ObjectId(supplierId),
      },
    },
    {
      $facet: {
        totalOrders: [{ $count: "count" }],

        totalBought: [
          { $unwind: "$medicines" },
          {
            $group: {
              _id: null,
              total: { $sum: "$medicines.quantity" },
            },
          },
        ],

        totalReturned: [
          { $match: { status: "Returned" } },
          { $count: "count" },
        ],

        totalCancelled: [
          { $match: { status: "Cancelled" } },
          { $count: "count" },
        ],
      },
    },
  ]);
};



// ======================
// FINAL STATS (WITH CACHE)
// ======================
exports.getSupplierStats = async (supplierId) => {
  const cacheKey = `stats:${supplierId}`;

  try {
    const cached = await redis.get(cacheKey);

    if (cached) {
      console.log("Stats Cache HIT ✅");
      return JSON.parse(cached);
    }

    console.log("Stats Cache MISS ❌");

    const id = new mongoose.Types.ObjectId(supplierId);

    const result = await Order.aggregate([
      {
        $match: { supplierId: id },
      },
      {
        $facet: {
          totalOrders: [{ $count: "count" }],

          totalBought: [
            { $unwind: "$medicines" },
            {
              $group: {
                _id: null,
                total: { $sum: "$medicines.quantity" },
              },
            },
          ],

          totalReturned: [
            { $match: { status: "Returned" } },
            { $count: "count" },
          ],

          totalCancelled: [
            { $match: { status: "Cancelled" } },
            { $count: "count" },
          ],
        },
      },
    ]);

    const finalData = {
      totalOrders: result[0].totalOrders[0]?.count || 0,
      totalBought: result[0].totalBought[0]?.total || 0,
      totalReturned: result[0].totalReturned[0]?.count || 0,
      totalCancelled: result[0].totalCancelled[0]?.count || 0,
    };

    await redis.set(cacheKey, JSON.stringify(finalData), "EX", 60);

    return finalData;

  } catch (error) {
    console.error("Redis error, fallback to DB:", error.message);

    const id = new mongoose.Types.ObjectId(supplierId);

    const result = await Order.aggregate([
      { $match: { supplierId: id } },
      {
        $facet: {
          totalOrders: [{ $count: "count" }],
          totalBought: [
            { $unwind: "$medicines" },
            {
              $group: {
                _id: null,
                total: { $sum: "$medicines.quantity" },
              },
            },
          ],
          totalReturned: [
            { $match: { status: "Returned" } },
            { $count: "count" },
          ],
          totalCancelled: [
            { $match: { status: "Cancelled" } },
            { $count: "count" },
          ],
        },
      },
    ]);

    return {
      totalOrders: result[0].totalOrders[0]?.count || 0,
      totalBought: result[0].totalBought[0]?.total || 0,
      totalReturned: result[0].totalReturned[0]?.count || 0,
      totalCancelled: result[0].totalCancelled[0]?.count || 0,
    };
  }
};