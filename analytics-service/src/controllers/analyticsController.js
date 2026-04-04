import axios from "axios";
import { getDashboardData } from "../services/aggregationService.js";
import Settings from "../models/settings.js";


// ================= DASHBOARD =================
export const getDashboard = async (req, res) => {
  try {
    let inventory = [];

    try {
      const invRes = await axios.get("http://localhost:5002/api/inventory");
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
      const response = await axios.get("http://localhost:5002/api/inventory");
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
      const response = await axios.get("http://localhost:5002/api/inventory");
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


//=====================================================================================================
/*
import Settings from "../models/settings.js";


// ================= STATIC INVENTORY DATA =================
const inventory = [
  {
    _id: "1",
    name: "Paracetamol",
    category: "Tablet",
    supplier: "PharmaCorp",
    stock: 120,
    min: 50,
    expiry: "2026-06-15"
  },
  {
    _id: "2",
    name: "Amoxicillin",
    category: "Antibiotic",
    supplier: "MediSupply",
    stock: 30,
    min: 50,
    expiry: "2025-12-10"
  },
  {
    _id: "3",
    name: "Vitamin C",
    category: "Supplement",
    supplier: "HealthCorp",
    stock: 0,
    min: 40,
    expiry: "2026-01-01"
  },
  {
    _id: "4",
    name: "Ibuprofen",
    category: "Tablet",
    supplier: "PharmaCorp",
    stock: 80,
    min: 60,
    expiry: "2026-03-20"
  }
];


// ================= DASHBOARD =================
export const getDashboard = async (req, res) => {
  try {
    const settings = await Settings.findOne();

    const defaultMin = settings?.preferences?.lowStock ?? 50;
    const expiryDays = settings?.preferences?.expiryDays ?? 90;

    let totalMedicines = inventory.length;
    let lowStock = 0;
    let outOfStock = 0;
    let expiringSoon = 0;

    const supplierSet = new Set();
    const today = new Date();

    inventory.forEach(item => {
      const stock = item.stock ?? 0;
      const min = item.min ?? defaultMin;

      supplierSet.add(item.supplier);

      if (stock === 0) outOfStock++;
      else if (stock < min) lowStock++;

      const expiry = new Date(item.expiry);
      const diff = (expiry - today) / (1000 * 60 * 60 * 24);

      if (diff > 0 && diff <= expiryDays) expiringSoon++;
    });

    const totalSuppliers = supplierSet.size;

    // Supplier chart
    const supplierMap = {};
    inventory.forEach(item => {
      supplierMap[item.supplier] =
        (supplierMap[item.supplier] || 0) + item.stock;
    });

    const supplierData = Object.entries(supplierMap).map(
      ([name, value]) => ({ name, value })
    );

    // Category chart
    const categoryMap = {};
    inventory.forEach(item => {
      categoryMap[item.category] =
        (categoryMap[item.category] || 0) + item.stock;
    });

    const categoryData = Object.entries(categoryMap).map(
      ([name, value]) => ({ name, value })
    );

    res.json({
      cards: {
        totalSuppliers,
        totalMedicines,
        lowStock,
        outOfStock,
        expiringSoon,
        expiryDays
      },
      supplierData,
      categoryData,
      trendData: []
    });

  } catch (err) {
    res.status(200).json({
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



// ================= SUPPLIERS =================
export const getSuppliers = async (req, res) => {
  try {
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

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



// ================= STOCK =================
export const getStock = async (req, res) => {
  try {
    const formatted = inventory.map(item => ({
      _id: item._id,
      name: item.name,
      category: item.category,
      supplier: item.supplier,
      stock: item.stock,
      min: item.min,
      expiry: item.expiry
    }));

    res.json(formatted);

  } catch (err) {
    res.status(500).json({ error: "Stock fetch failed" });
  }
};



// ================= REPORTS =================
export const getReports = async (req, res) => {
  try {
    res.json({
      totalBuy: 5000,
      totalReturns: 500,
      totalCancelled: 200,
      supplierOrders: [
        { supplier: "PharmaCorp", total: 200 },
        { supplier: "MediSupply", total: 100 }
      ],
      monthlyTrend: [
        { month: "Jan", value: 200 },
        { month: "Feb", value: 300 }
      ]
    });
  } catch (err) {
    res.status(500).json({ error: "Reports failed" });
  }
};



// ================= SETTINGS =================
export const getSettings = async (req, res) => {
  try {
    const settings = await Settings.findOne();
    res.json(settings || {});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;

    const updated = await Settings.findOneAndUpdate(
      {},
      { profile: { name, email } },
      { new: true, upsert: true }
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

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
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const settings = await Settings.findOne();

    if (!settings || settings.password !== currentPassword) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    settings.password = newPassword;
    await settings.save();

    res.json({ message: "Password updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
*/