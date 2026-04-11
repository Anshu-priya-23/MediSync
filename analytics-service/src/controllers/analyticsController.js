import axios from "axios";
import { getDashboardData } from "../services/aggregationService.js";
import Settings from "../models/settings.js";


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

    const supplierSet = new Set();
    inventory.forEach(item => {
      if (item.supplier) supplierSet.add(item.supplier);
    });

    const totalSuppliers = supplierSet.size;

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

    res.json({
      ...data,
      cards: {
        ...data.cards,
        totalSuppliers
      }
    });

  } catch {
    res.json({
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
    });
  }
};


// ================= REPORTS =================
export const getReports = async (req, res) => {
  try {
    let orders = [];

    try {
      const orderRes = await axios.get("http://localhost:5003/api/orders");
      orders = Array.isArray(orderRes.data) ? orderRes.data : [];
    } catch {
      console.log("⚠️ Orders API down");
      orders = [];
    }

    let totalSales = 0;
    let totalOrders = orders.length;
    let totalCancelled = 0;

    const supplierMap = {};
    const monthMap = {};

    orders.forEach(order => {
      const amount = order.amount || 0;
      const supplier = order.supplier || "Unknown";

      if (order.status === "Completed") {
        totalSales += amount;

        supplierMap[supplier] = (supplierMap[supplier] || 0) + 1;

        const date = new Date(order.date || new Date());
        const month = date.toLocaleString("default", { month: "short" });

        monthMap[month] = (monthMap[month] || 0) + amount;
      }

      if (order.status === "Cancelled") {
        totalCancelled++;
      }
    });

    const supplierData = Object.entries(supplierMap).map(
      ([supplier, total]) => ({ supplier, total })
    );

    const monthlyData = Object.entries(monthMap).map(
      ([month, value]) => ({ month, value })
    );

    res.json({
      totalSales,
      totalOrders,
      totalCancelled,
      supplierData,
      monthlyData
    });

  } catch {
    res.json({
      totalSales: 0,
      totalOrders: 0,
      totalCancelled: 0,
      supplierData: [],
      monthlyData: []
    });
  }
};


// ================= SUPPLIERS =================
export const getSuppliers = async (req, res) => {
  try {
    let inventory = [];

    try {
      const response = await axios.get("http://localhost:5002/api/medicines");
      inventory = Array.isArray(response.data) ? response.data : [];
    } catch {
      inventory = [];
    }

    const supplierSet = new Set();

    inventory.forEach(item => {
      if (item.supplier) supplierSet.add(item.supplier);
    });

    const suppliers = Array.from(supplierSet).map((name, index) => ({
      _id: index + 1,
      name,
      email: "-",
      status: "Active"
    }));

    res.json(suppliers);

  } catch {
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
      supplier: item.supplier || "Unknown",
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

// GET
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

    // 🔥 Sync with Auth Service
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

    // 🔥 Only Auth Service handles password
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