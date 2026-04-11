import React, { useEffect, useState } from "react";
import {
  FiUsers,
  FiPackage,
  FiAlertTriangle,
  FiXCircle,
  FiClock,
  FiDollarSign
} from "react-icons/fi";
import "./Dashboard.css";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from "recharts";

import axios from "axios";

const API = "http://localhost:5005/api/analytics/dashboard";

function Dashboard() {
  const [data, setData] = useState(null);

  const fetchDashboard = async () => {
    try {
      const res = await axios.get(API);
      setData(res.data);
    } catch (err) {
      console.error("Dashboard error:", err);
    }
  };

  useEffect(() => {
    fetchDashboard();
    const interval = setInterval(fetchDashboard, 5000);
    return () => clearInterval(interval);
  }, []);

  if (!data) return <h2>Loading...</h2>;

  const cards = data.cards || {};
  const trendData = data.trendData || [];
  const supplierData = data.supplierData || [];
  const categoryData = data.categoryData || [];

  const COLORS = ["#2cb1a5", "#4fd1c5", "#63b3ed", "#3182ce", "#2f855a"];

  return (
    <div className="dashboard">
      <h1>Admin Dashboard</h1>

      {/* ====== CARDS ====== */}
      <div className="cards">

        {/* ROW 1 */}
        <div className="card">
          <div className="icon-box"><FiUsers /></div>
          <h4>Total Suppliers</h4>
          <h2>{cards.totalSuppliers || 0}</h2>
        </div>

        <div className="card">
          <div className="icon-box"><FiPackage /></div>
          <h4>Total Medicines</h4>
          <h2>{cards.totalMedicines || 0}</h2>
        </div>

        <div className="card">
          <div className="icon-box"><FiDollarSign /></div>
          <h4>Total Sales</h4>
          <h2>₹ {cards.totalSales || 0}</h2>
        </div>

        {/* ROW 2 */}
        <div className="card">
          <div className="icon-box"><FiAlertTriangle /></div>
          <h4>Low Stock</h4>
          <h2>{cards.lowStock || 0}</h2>
        </div>

        <div className="card">
          <div className="icon-box"><FiXCircle /></div>
          <h4>Out of Stock</h4>
          <h2>{cards.outOfStock || 0}</h2>
        </div>

        <div className="card">
          <div className="icon-box"><FiClock /></div>
          <h4>Expiring Soon</h4>
          <h2>{cards.expiringSoon || 0}</h2>
          <span className="negative">Within {cards.expiryDays} days</span>
        </div>

      </div>

      {/* ====== CHARTS ====== */}
      <div className="charts">

        {/* SUPPLIER CONTRIBUTION */}
        <div className="chart-box">
          <h3>Supplier Contribution</h3>

          {supplierData.length === 0 ? (
            <p>No data available</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={supplierData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#2cb1a5" radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* CATEGORY PIE */}
        <div className="chart-box">
          <h3>Category Stock Distribution</h3>

          {categoryData.length === 0 ? (
            <p>No data available</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  dataKey="value"
                  innerRadius={70}
                  outerRadius={110}
                  paddingAngle={4}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

      </div>

      {/* ====== TREND ====== */}
      <div className="inventory-card">
        <h3>Inventory Trend</h3>

        {trendData.length === 0 ? (
          <p>No data available</p>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={trendData}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />

              <Line
                type="monotone"
                dataKey="stock"
                stroke="#2cb1a5"
                strokeWidth={3}
              />

              <Line
                type="monotone"
                dataKey="orders"
                stroke="#f59e0b"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        )}

      </div>

    </div>
  );
}

export default Dashboard;