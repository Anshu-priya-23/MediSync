import Settings from "../models/settings.js";
import axios from "axios";

// ================= DASHBOARD =================
export const getDashboardData = async () => {
  try {

    let inventory = [];
    let orders = [];

    // ================= INVENTORY =================
    // ================= INVENTORY =================
try {
  const res = await axios.get("http://localhost:5002/api/medicines");

  console.log("🔥 RAW RESPONSE:", res.data); // DEBUG

  // ✅ FORCE FIX
  if (Array.isArray(res.data)) {
    inventory = res.data;
  } else if (Array.isArray(res.data.data)) {
    inventory = res.data.data;
  } else {
    inventory = [];
  }

  console.log("📦 Inventory length:", inventory.length);

} catch (err) {
  console.log("❌ Inventory API ERROR:", err.message);
  inventory = [];
}
    // ================= ORDERS =================
    try {
      const orderRes = await axios.get(
        "http://localhost:5003/api/orders/analytics"
      );
      orders = orderRes.data?.items || [];
    } catch {
      console.log("⚠️ Orders API not available");
      orders = [];
    }

    // ================= SETTINGS =================
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
      let supplier = "Unknown";

      if (item.supplierId) {
        const id =
          typeof item.supplierId === "object"
            ? item.supplierId.toString()
            : item.supplierId;

        supplier = `Supplier ${id.slice(-4)}`;
      }

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

    orders.forEach(order => {
      const date = new Date(order.placedAt || order.createdAt || new Date());
      const month = date.toLocaleString("default", { month: "short" });

      if (!trendMap[month]) {
        trendMap[month] = { stock: 0, orders: 0 };
      }

      trendMap[month].orders += 1;
    });

    const trendData = Object.entries(trendMap).map(
      ([month, value]) => ({
        month,
        stock: value.stock,
        orders: value.orders
      })
    );

    // ================= FINAL =================
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