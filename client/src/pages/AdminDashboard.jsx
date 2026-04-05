import React, { useState } from "react";
import { Routes, Route, NavLink } from "react-router-dom";
import {
  FiGrid,
  FiActivity,
  FiUsers,
  FiBarChart2,
  FiSettings,
  FiLogOut,
  FiMenu,
  FiX
} from "react-icons/fi";

import Dashboard from "../components/admin/Dashboard";
import StockMonitor from "../components/admin/StockMonitor";
import SupplierManagement from "../components/admin/SupplierManagement";
import Reports from "../components/admin/Reports";
import Settings from "../components/admin/Settings";

import "./AdminDashboard.css";

function AdminDashboard() {
  const [open, setOpen] = useState(true);

  return (
    <div className="admin-layout">

      {/* ===== SIDEBAR ===== */}
      <aside className={`sidebar ${open ? "open" : "closed"}`}>

        {/* HEADER */}
        <div className="sidebar-header">
          <h3 className="logo">MediSync</h3>

          <FiX
            className="close-btn"
            onClick={() => setOpen(false)}
          />
        </div>

        {/* MENU */}
        <nav className="menu">
          <NavLink to="dashboard">
            <FiGrid /> Dashboard
          </NavLink>

          <NavLink to="stock-monitor">
            <FiActivity /> Stock Monitor
          </NavLink>

          <NavLink to="supplier-management">
            <FiUsers /> Supplier Management
          </NavLink>

          <NavLink to="reports">
            <FiBarChart2 /> Reports
          </NavLink>

          <NavLink to="settings">
            <FiSettings /> Settings
          </NavLink>
        </nav>

        {/* LOGOUT */}
        <div className="logout">
          <FiLogOut /> Logout
        </div>

      </aside>

      {/* ===== MAIN CONTENT ===== */}
      <div className="admin-container">

        <main className="content">

          {/* HAMBURGER WHEN CLOSED */}
          {!open && (
            <FiMenu
              className="hamburger"
              onClick={() => setOpen(true)}
            />
          )}

          <Routes>
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="stock-monitor" element={<StockMonitor />} />
            <Route path="supplier-management" element={<SupplierManagement />} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<Settings />} />
          </Routes>

        </main>

      </div>

    </div>
  );
}

export default AdminDashboard;