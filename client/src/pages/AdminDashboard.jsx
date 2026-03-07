import React, {useState} from "react";
import { Routes, Route, NavLink } from "react-router-dom";
import {
  FiGrid,
  FiFolder,
  FiActivity,
  FiUsers,
  FiBarChart2,
  FiSettings,
  FiLogOut,
  FiMenu
} from "react-icons/fi";

import Dashboard from "../components/admin/Dashboard";
import Categories from "../components/admin/Categories";
import StockMonitor from "../components/admin/StockMonitor";
import SupplierManagement from "../components/admin/SupplierManagement";
import Reports from "../components/admin/Reports";
import Settings from "../components/admin/Settings";

import logo from "../assets/logo.jpeg";
import "./AdminDashboard.css";

function AdminDashboard() {
  const [open, setOpen]=useState(true);
  return (
    <div className="admin-container">
    <aside className={`sidebar ${open ? "" : "closed"}`}>

        <div className="sidebar-header">
          <div className="logo">
            <img src={logo} alt="logo" />
            <span>MediSync</span>
            
          </div>
          <span className="close-btn" onClick={() => setOpen(false)}>×</span>
        </div>

        <nav className="menu">
          <NavLink to="dashboard">
            <FiGrid /> Dashboard
          </NavLink>

          <NavLink to="categories">
            <FiFolder /> Categories
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

        <div className="logout">
          <FiLogOut />
          Logout
        </div>

      </aside>

      <main className="content">
        {!open && (
  <FiMenu
    className="hamburger"
    onClick={() => setOpen(true)}
  />
)}
  <Routes>
    <Route index element={<Dashboard />} />
    <Route path="dashboard" element={<Dashboard />} />
    <Route path="categories" element={<Categories />} />
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