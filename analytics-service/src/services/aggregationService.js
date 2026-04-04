import Settings from "../models/settings.js";
import axios from "axios";

// ================= DASHBOARD =================
export const getDashboardData = async () => {
  try {

    let inventory = [];

    // ✅ SAFE FETCH INVENTORY
    try {
      const res = await axios.get("http://localhost:5002/api/medicines");
      inventory = Array.isArray(res.data) ? res.data : [];
    } catch {
      console.log("⚠️ Inventory API not available");
      inventory = [];
    }

    // ✅ FETCH SETTINGS
    let settings = null;
    try {
      settings = await Settings.findOne();
    } catch {
      settings = null;
    }

    const defaultMin = settings?.preferences?.lowStock ?? 0;
    const expiryDays = settings?.preferences?.expiryDays ?? 90;

    // ================= CALCULATIONS =================
    let totalMedicines = inventory.length;
    let lowStock = 0;
    let outOfStock = 0;
    let expiringSoon = 0;

    const today = new Date();

    inventory.forEach(item => {
      const stock = item.stock ?? 0;
      const min = item.minThreshold ?? item.min ?? defaultMin;

      if (stock === 0) outOfStock++;
      else if (stock < min) lowStock++;

      if (item.expiryDate || item.expiry) {
        const expiry = new Date(item.expiryDate || item.expiry);
        const diffDays = (expiry - today) / (1000 * 60 * 60 * 24);

        if (diffDays > 0 && diffDays <= expiryDays) {
          expiringSoon++;
        }
      }
    });

    // ================= SUPPLIER DATA =================
    const supplierMap = {};
    const supplierSet = new Set();

    inventory.forEach(item => {
      const supplier = item.supplier || "Unknown";

      supplierSet.add(supplier);

      supplierMap[supplier] =
        (supplierMap[supplier] || 0) + (item.stock ?? 0);
    });

    const totalSuppliers = supplierSet.size;

    const supplierData = Object.entries(supplierMap).map(
      ([name, value]) => ({
        name,
        value
      })
    );

    // ================= CATEGORY DATA =================
    const categoryMap = {};
    inventory.forEach(item => {
      const category = item.category || "Others";
      categoryMap[category] =
        (categoryMap[category] || 0) + (item.stock ?? 0);
    });

    const categoryData = Object.entries(categoryMap).map(
      ([name, value]) => ({
        name,
        value
      })
    );

    // ================= TREND DATA =================
    const trendMap = {};

    inventory.forEach(item => {
      if (!item.expiryDate && !item.expiry) return;

      const date = new Date(item.expiryDate || item.expiry);
      const month = date.toLocaleString("default", { month: "short" });

      if (!trendMap[month]) {
        trendMap[month] = { stock: 0, orders: 0 };
      }

      trendMap[month].stock += item.stock ?? 0;
    });

    const trendData = Object.entries(trendMap).map(
      ([month, value]) => ({
        month,
        stock: value.stock,
        orders: value.orders
      })
    );

    // ✅ FINAL RESPONSE
    return {
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
      trendData
    };

  } catch (err) {

    // ✅ CRITICAL FIX (NO CRASH)
    return {
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
};