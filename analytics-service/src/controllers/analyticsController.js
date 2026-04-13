import axios from "axios";
import { getDashboardData } from "../services/aggregationService.js";
import Settings from "../models/settings.js";

const SALES_STATUSES = new Set(["confirmed", "ready_for_pickup", "picked_up", "completed", "delivered"]);

function isSalesOrder(order) {
  const status = String(order?.status || "").trim().toLowerCase();
  const paymentStatus = String(order?.paymentStatus || "").trim().toLowerCase();

  if (status && SALES_STATUSES.has(status)) {
    return true;
  }

  return paymentStatus === "paid";
}

// ================= DASHBOARD =================
export const getDashboard = async (req, res) => {
  try {
    let inventory = [];

    try {
      const invRes = await axios.get("http://localhost:5002/api/medicines");
      inventory = Array.isArray(invRes.data) ? invRes.data : [];
    } catch {
      console.log("⚠️ Inventory API not available");
      inventory = [];
    }

    // ✅ FIXED: supplierSet added
    const supplierSet = new Set();

    inventory.forEach(item => {
      if (item?.supplierId) {
        const id = item.supplierId.toString();
        supplierSet.add(`Supplier ${id.slice(-4)}`);
      }
    });

    const fallbackSuppliers = supplierSet.size;

    // ================= TOTAL SALES =================
    let totalSales = 0;

    try {
      const orderRes = await axios.get(
        "http://localhost:5003/api/orders/analytics"
      );

      const orders = orderRes.data?.items || [];

      orders.forEach(order => {
        if (isSalesOrder(order)) {
          totalSales += order.totalAmount || 0;
        }
      });

    } catch (err) {
      console.log("⚠️ Orders API error:", err.message);
      totalSales = 0;
    }

    let data = {};
    try {
      data = await getDashboardData();
    } catch {
      data = {
        cards: {
          totalSuppliers: 0,
          totalMedicines: 0,
          lowStock: 0,
          outOfStock: 0,
          expiringSoon: 0,
          expiryDays: 90
        },
        supplierData: [],
        categoryData: [],
        trendData: []
      };
    }

    const totalSuppliers =
      data?.cards?.totalSuppliers > 0
        ? data.cards.totalSuppliers
        : fallbackSuppliers;

    res.json({
      ...data,
      cards: {
        ...data.cards,
        totalSuppliers,
        totalSales
      }
    });

  } catch (err) {
    console.log("❌ DASHBOARD ERROR:", err.message);

    res.json({
      cards: {
        totalSuppliers: 0,
        totalMedicines: 0,
        lowStock: 0,
        outOfStock: 0,
        expiringSoon: 0,
        expiryDays: 90,
        totalSales: 0
      },
      supplierData: [],
      categoryData: [],
      trendData: []
    });
  }
};

// ================= REPORTS =================
export const getReports = async (req, res) => {
  try {
    let orders = [];

    try {
      const orderRes = await axios.get(
        "http://localhost:5003/api/orders/analytics"
      );
      orders = orderRes.data?.items || [];
    } catch (err) {
      console.log("⚠️ Orders API error:", err.message);
      orders = [];
    }

    let totalSales = 0;
    let totalOrders = orders.length;
    let totalCancelled = 0;

    const dailyMap = {};
    const weeklyMap = {};
    const monthlyMap = {};

    orders.forEach(order => {
      const amount = order.totalAmount || 0;

      const rawDate =
        order.placedAt?.$date ||
        order.createdAt?.$date ||
        order.placedAt ||
        order.createdAt;

      const date = new Date(rawDate);
      if (isNaN(date)) return;

      if (isSalesOrder(order)) {
        totalSales += amount;

        const dayKey = date.toISOString().split("T")[0];
        dailyMap[dayKey] = (dailyMap[dayKey] || 0) + amount;

        const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
        const week = Math.ceil(
          ((date - firstDay) / (1000 * 60 * 60 * 24) +
            firstDay.getDay() +
            1) / 7
        );

        const weekKey = `W${week}`;
        weeklyMap[weekKey] = (weeklyMap[weekKey] || 0) + amount;

        const monthKey = date.toLocaleString("default", { month: "short" });
        monthlyMap[monthKey] = (monthlyMap[monthKey] || 0) + amount;
      }

      if (order.status === "cancelled") {
        totalCancelled++;
      }
    });

    const dailyData = Object.entries(dailyMap)
      .sort((a, b) => new Date(a[0]) - new Date(b[0]))
      .slice(-7)
      .map(([day, value]) => ({
        day: new Date(day).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short"
        }),
        value
      }));

    const weeklyData = Object.entries(weeklyMap).map(([week, value]) => ({
      week,
      value
    }));

    const monthlyData = Object.entries(monthlyMap).map(([month, value]) => ({
      month,
      value
    }));

    res.json({
      totalSales,
      totalOrders,
      totalCancelled,
      dailyData,
      weeklyData,
      monthlyData
    });

  } catch {
    res.json({
      totalSales: 0,
      totalOrders: 0,
      totalCancelled: 0,
      dailyData: [],
      weeklyData: [],
      monthlyData: []
    });
  }
};

// ================= SUPPLIERS =================
export const getSuppliers = async (req, res) => {
  try {
    const response = await axios.get("http://localhost:5002/api/medicines");

    const inventory = Array.isArray(response.data) ? response.data : [];

    if (!inventory.length) {
      return res.json([]);
    }

    const supplierMap = new Map();

    inventory.forEach(item => {
      const supplierId = item?.supplierId;

      if (supplierId && !supplierMap.has(supplierId)) {
        supplierMap.set(supplierId, {
          _id: supplierId,
          name: `Supplier ${supplierId.toString().slice(-4)}`,
          email: "N/A",
          status: "Active"
        });
      }
    });

    res.json(Array.from(supplierMap.values()));

  } catch (err) {
    console.error("❌ Supplier error:", err.message);
    res.json([]);
  }
};

// ================= STOCK =================
export const getStock = async (req, res) => {
  try {
    let inventory = [];

    try {
      const response = await axios.get("http://localhost:5002/api/medicines");
      inventory = Array.isArray(response.data) ? response.data : [];
    } catch {
      inventory = [];
    }

    const formatted = inventory.map(item => ({
      _id: item._id || Math.random(),
      name: item.name || "Unknown",
      category: item.category || "Others",
      supplier: item.supplierId
        ? `Supplier ${item.supplierId.toString().slice(-4)}`
        : "Unknown",
      stock: item.stock ?? 0,
      min: item.minThreshold ?? item.min ?? 0,
      expiry: item.expiryDate || item.expiry || null
    }));

    res.json(formatted);

  } catch {
    res.json([]);
  }
};

// ================= SETTINGS =================
export const getSettings = async (req, res) => {
  try {
    const settings = await Settings.findOne();
    res.json(settings || {});
  } catch {
    res.json({});
  }
};

// ================= UPDATE PROFILE =================
export const updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;

    const updated = await Settings.findOneAndUpdate(
      {},
      { profile: { name, email } },
      { new: true, upsert: true }
    );

    try {
      await axios.put(
        "http://localhost:5001/api/auth/update-profile",
        { name, email }
      );
    } catch {
      console.log("⚠️ Auth sync failed");
    }

    res.json(updated);

  } catch {
    res.json({});
  }
};

// ================= UPDATE PREFERENCES =================
export const updatePreferences = async (req, res) => {
  try {
    const { lowStock, expiryDays } = req.body;

    let settings = await Settings.findOne();

    if (!settings) {
      settings = new Settings({
        preferences: { lowStock, expiryDays }
      });
    } else {
      settings.preferences = { lowStock, expiryDays };
    }

    await settings.save();

    res.json(settings);

  } catch {
    res.json({});
  }
};

// ================= CHANGE PASSWORD =================
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.json({ message: "All fields required" });
    }

    try {
      const response = await axios.put(
        "http://localhost:5001/api/auth/change-password",
        { currentPassword, newPassword }
      );

      res.json(response.data);

    } catch {
      res.json({
        message: "Auth service not reachable / password update failed"
      });
    }

  } catch {
    res.json({ message: "Error updating password" });
  }
};