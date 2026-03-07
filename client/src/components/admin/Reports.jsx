import React from "react";
import "./Reports.css";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
} from "recharts";

const Reports = () => {
  const supplierData = [
    { name: "PharmaCorp", orders: 150 },
    { name: "MedSupply", orders: 120 },
    { name: "HealthFirst", orders: 190 },
    { name: "CureAll", orders: 40 },
  ];

  const monthlyData = [
    { month: "Sep", stock: 1200, orders: 350 },
    { month: "Oct", stock: 1300, orders: 400 },
    { month: "Nov", stock: 1050, orders: 360 },
    { month: "Dec", stock: 1450, orders: 480 },
    { month: "Jan", stock: 1350, orders: 420 },
    { month: "Feb", stock: 1800, orders: 470 },
  ];

  return (
    <div className="reports-page">
      {/* Header */}
      <div className="reports-header">
        <div>
          <h2>Reports</h2>
          
        </div>
        <button className="export-btn">Export Report</button>
      </div>

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="card">
          <p>Total Buy Value</p>
          <h3>$124,500</h3>
        </div>
        <div className="card">
          <p>Total Returns</p>
          <h3 className="orange">$8,320</h3>
        </div>
        <div className="card">
          <p>Total Cancelled</p>
          <h3 className="red">$5,150</h3>
        </div>
      </div>

      {/* Charts */}
      <div className="charts-grid">
        {/* Bar Chart */}
        <div className="chart-card">
          <h4>Supplier Orders</h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={supplierData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="orders" fill="#2cb1a5" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Line Chart */}
        <div className="chart-card">
          <h4>Monthly Inventory Trend</h4>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
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
        </div>
      </div>
    </div>
  );
};

export default Reports;