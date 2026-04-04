import React, { useState } from "react";
import { Routes, Route, NavLink } from "react-router-dom";
import {
  FiGrid,
  FiActivity,
  FiUsers,
  FiBarChart2,
  FiSettings,
  FiLogOut,
  FiMenu
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
    <div className="admin-container">

      {/* SIDEBAR */}
      <aside className={`sidebar ${open ? "" : "closed"}`}>

        {/* HEADER (LOGO REMOVED) */}
        <div className="sidebar-header">
          <span
            className="close-btn"
            onClick={() => setOpen(false)}
          >
            ×
          </span>
        </div>

        {/* MENU */}
        <nav className="menu">
          <NavLink to="dashboard" title="Dashboard">
            <FiGrid /> Dashboard
          </NavLink>

          <NavLink to="stock-monitor" title="Stock Monitor">
            <FiActivity /> Stock Monitor
          </NavLink>

          <NavLink to="supplier-management" title="Supplier Management">
            <FiUsers /> Supplier Management
          </NavLink>

          <NavLink to="reports" title="Reports">
            <FiBarChart2 /> Reports
          </NavLink>

          <NavLink to="settings" title="Settings">
            <FiSettings /> Settings
          </NavLink>
        </nav>

        {/* LOGOUT */}
        <div className="logout">
          <FiLogOut />
          Logout
        </div>

      </aside>

      {/* MAIN CONTENT */}
      <main className="content">

        {/* HAMBURGER (WHEN CLOSED) */}
        {!open && (
          <FiMenu
            className="hamburger"
            onClick={() => setOpen(true)}
          />
        )}

        {/* ROUTES */}
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
  );
}

export default AdminDashboard;