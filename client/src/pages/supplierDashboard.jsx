import React from "react";
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
/* ---------------- Dashboard Home ---------------- */
const DashboardHome = () => {
  return (
    <>
      <div className="dashboard-header">
        <h1 className="dashboard-title">Supplier Dashboard</h1>
        <p className="dashboard-subtitle">
          Your inventory overview and statistics
        </p>
      </div>

      <section className="stats-wrapper">
        <StatCard title="Medicines Listed" value="34" subtitle="↑ +3 this month" />
        <StatCard title="Total Orders" value="156" />
        <StatCard title="Total Bought" value="1325" subtitle="↑ +8%" />
        <StatCard title="Total Returned" value="35" />
        <StatCard title="Total Cancelled" value="85" />
      </section>

      <section className="chart-box">
        <h3 className="chart-title">
          Buy vs Return vs Cancelled
        </h3>
        <BuyReturnChart />
      </section>
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