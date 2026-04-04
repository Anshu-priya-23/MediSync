import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import SupplierSidebar from "../components/supplier/SupplierSidebar";
import StatCard from "../components/supplier/StatCard";
import BuyReturnChart from "../components/supplier/BuyReturnChart";
import AddMedicine from "../components/supplier/addMedicine";
import MyMedicine from "../components/supplier/myMedicine";
import Orders from "../components/supplier/Orders";   // ✅ ADD THIS
import Performance from "../components/supplier/performance";
import "../components/supplier/supplier.css";
import Profile from "../components/supplier/profile";
import inventoryService from "../services/inventoryService"; // Adjust path

/* ---------------- Dashboard Home ---------------- */
const DashboardHome = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalBought: 0,
    totalReturned: 0,
    totalCancelled: 0
  });
  const [medicineCount, setMedicineCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const supplierId = "661111111111111111111111";

  useEffect(() => {
    const fetchAllDashboardData = async () => {
      try {
        setLoading(true);

        // Fetching both APIs in parallel for better performance
        const [statsData, countData] = await Promise.all([
          inventoryService.getSupplierStats(supplierId),
          inventoryService.getMedicineCount(supplierId)
        ]);

        setStats(statsData);
        setMedicineCount(countData.totalMedicines);
      } catch (error) {
        console.error("Failed to load dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllDashboardData();
  }, [supplierId]);

  return (
    <>
      <div className="dashboard-header">
        <h1 className="dashboard-title">Supplier Dashboard</h1>
        <p className="dashboard-subtitle">
          Your inventory overview and statistics
        </p>
      </div>

      <section className="stats-wrapper">
        {/* Now Dynamic: Medicines Listed */}
        <StatCard
          title="Medicines Listed"
          value={loading ? "..." : medicineCount}
          subtitle="In your inventory"
        />

        <StatCard
          title="Total Orders"
          value={loading ? "..." : stats.totalOrders}
        />
        <StatCard
          title="Total Bought"
          value={loading ? "..." : stats.totalBought}
          subtitle="Total Units"
        />
        <StatCard
          title="Total Returned"
          value={loading ? "..." : stats.totalReturned}
        />
        <StatCard
          title="Total Cancelled"
          value={loading ? "..." : stats.totalCancelled}
        />
      </section>

      {/* <section className="chart-box">
        <h3 className="chart-title">
          Buy vs Return vs Cancelled
        </h3>
        <BuyReturnChart data={stats} />
      </section> */}
    </>
  );
};
/* ---------------- Main Layout ---------------- */
const SupplierDashboard = () => {
  return (
    <div className="supplier-container">
      <SupplierSidebar />

      <main className="supplier-content">
        <Routes>

          {/* Default dashboard */}
          <Route index element={<DashboardHome />} />

          {/* My Medicines */}
          <Route path="my-medicines" element={<MyMedicine />} />

          {/* Add Medicine */}
          <Route path="add-medicine" element={<AddMedicine />} />

          {/* ✅ Orders Route Added */}
          <Route path="orders" element={<Orders />} />

          {/* Performance */}
          <Route path="performance" element={<Performance />} />

          <Route path="profile" element={<Profile />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="" />} />

        </Routes>
      </main>
    </div>
  );
};

export default SupplierDashboard;