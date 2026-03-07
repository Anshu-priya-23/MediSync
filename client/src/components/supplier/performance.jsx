import React from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import "./performance.css";

const Performance = () => {
  const monthlyData = [
    { month: "Sep", bought: 420, returned: 20, cancelled: 10 },
    { month: "Oct", bought: 500, returned: 25, cancelled: 15 },
    { month: "Nov", bought: 380, returned: 12, cancelled: 8 },
    { month: "Dec", bought: 620, returned: 30, cancelled: 20 },
    { month: "Jan", bought: 550, returned: 18, cancelled: 12 },
    { month: "Feb", bought: 590, returned: 22, cancelled: 14 },
  ];

  const salesTrend = [
    { month: "Sep", sales: 420 },
    { month: "Oct", sales: 500 },
    { month: "Nov", sales: 380 },
    { month: "Dec", sales: 620 },
    { month: "Jan", sales: 550 },
    { month: "Feb", sales: 590 },
  ];

  const topMedicines = [
    { name: "Amoxicillin 500mg", units: 520 },
    { name: "Omeprazole 20mg", units: 380 },
    { name: "Paracetamol 650mg", units: 340 },
  ];

  return (
    <>
      <div className="dashboard-header">
        <h1 className="dashboard-title">Performance</h1>
        <p className="dashboard-subtitle">
          Track your sales and performance metrics
        </p>
      </div>

      <div className="performance-grid">

        {/* Buy vs Return vs Cancelled */}
        <div className="performance-card">
          <h3>Buy vs Return vs Cancelled</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="bought" fill="#2cb1a5" />
              <Bar dataKey="returned" fill="#f59e0b" />
              <Bar dataKey="cancelled" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Sales Trend */}
        <div className="performance-card">
          <h3>Monthly Sales Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="sales"
                stroke="#2cb1a5"
                strokeWidth={3}
                dot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

      </div>

      {/* Top Performing Medicines */}
      <div className="performance-card full-width">
        <h3>Top Performing Medicines</h3>

        {topMedicines.map((med, index) => (
          <div key={index} className="medicine-progress">
            <div className="medicine-info">
              <span>#{index + 1}</span>
              <span>{med.name}</span>
              <span>{med.units} units</span>
            </div>

            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${med.units / 6}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default Performance;