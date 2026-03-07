import React from "react";
import {
  FiUsers,
  FiPackage,
  FiAlertTriangle,
  FiXCircle,
  FiClock
} from "react-icons/fi";
import "./Dashboard.css";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from "recharts";

function Dashboard() {

  const trendData = [
    { month: "Sep", stock: 1200, orders: 320 },
    { month: "Oct", stock: 1350, orders: 400 },
    { month: "Nov", stock: 1100, orders: 360 },
    { month: "Dec", stock: 1500, orders: 500 },
    { month: "Jan", stock: 1400, orders: 450 },
    { month: "Feb", stock: 1900, orders: 510 }
  ];

  const supplierData = [
    { name: "PharmaCorp", value: 150 },
    { name: "MedSupply", value: 120 },
    { name: "HealthFirst", value: 190 },
    { name: "CureAll", value: 40 }
  ];

  const categoryData = [
    { name: "Antibiotics", value: 40 },
    { name: "Painkillers", value: 30 },
    { name: "Vitamins", value: 20 },
    { name: "Cardiac", value: 25 },
    { name: "Diabetes", value: 18 },
    { name: "Dermatology", value: 22 }
  ];

  const COLORS = ["#2cb1a5", "#4fd1c5", "#63b3ed", "#3182ce", "#2f855a", "#1c7c54"];

  return (
    <div className="dashboard">
      <h1>Admin Dashboard</h1>

      {/* ====== TOP CARDS ====== */}
      <div className="cards">

        <div className="card">
          <div className="icon-box"><FiUsers /></div>
          <h4>Total Suppliers</h4>
          <h2>4</h2>
          <span className="positive">↑ 2 new this month</span>
        </div>

        <div className="card">
          <div className="icon-box"><FiPackage /></div>
          <h4>Total Medicines</h4>
          <h2>161</h2>
          <span className="positive">↑ 12%</span>
        </div>

        <div className="card">
          <div className="icon-box"><FiAlertTriangle /></div>
          <h4>Low Stock Items</h4>
          <h2>2</h2>
          <span className="negative">↓ Needs attention</span>
        </div>

        <div className="card">
          <div className="icon-box"><FiXCircle /></div>
          <h4>Out of Stock</h4>
          <h2>2</h2>
        </div>

        <div className="card">
          <div className="icon-box"><FiClock /></div>
          <h4>Expiring Soon</h4>
          <h2>3</h2>
          <span className="negative">↓ Within 90 days</span>
        </div>

      </div>

      {/* ====== CHART SECTION ====== */}
      <div className="charts">

        {/* Supplier Contribution */}
        <div className="chart-box">
          <h3>Supplier Contribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={supplierData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#2cb1a5" radius={[6,6,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Distribution */}
        <div className="chart-box">
          <h3>Category Stock Distribution</h3>
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
        </div>

      </div>

      {/* Inventory Trend */}
      <div className="inventory-card">
        <h3>Inventory Trend</h3>

        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="4 4" stroke="#e5e7eb" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />

            <Line
              type="monotone"
              dataKey="stock"
              stroke="#2cb1a5"
              strokeWidth={3}
              dot={{ r: 5 }}
            />

            <Line
              type="monotone"
              dataKey="orders"
              stroke="#f59e0b"
              strokeWidth={3}
              dot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}

export default Dashboard;