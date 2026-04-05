import React, { useEffect, useState } from "react";
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
import axios from "axios";

const API = "http://localhost:5005/api/analytics/reports";

const Reports = () => {
  const [data, setData] = useState(null);

  const fetchReports = async () => {
    try {
      const res = await axios.get(API);
      setData(res.data);
    } catch (err) {
      console.error("Reports Error:", err);
      setData({
        totalSales: 0,
        totalOrders: 0,
        totalCancelled: 0,
        supplierData: [],
        monthlyData: []
      });
    }
  };

  useEffect(() => {
    fetchReports();
    const interval = setInterval(fetchReports, 5000);
    return () => clearInterval(interval);
  }, []);

  if (!data) return <h2>Loading...</h2>;

  // ✅ SAFE DATA
  const supplierData = data.supplierData || [];
  const monthlyData = data.monthlyData || [];

  return (
    <div className="reports-page">

      {/* Header */}
      <div className="reports-header">
        <h2>Reports</h2>
      </div>

      {/* 🔥 SUMMARY CARDS */}
      <div className="summary-cards">

        <div className="card">
          <p>Total Sales</p>
          <h3>Rs {data.totalSales || 0}</h3>
        </div>

        <div className="card">
          <p>Total Orders</p>
          <h3 className="orange">{data.totalOrders || 0}</h3>
        </div>

        <div className="card">
          <p>Cancelled Orders</p>
          <h3 className="red">{data.totalCancelled || 0}</h3>
        </div>

      </div>

      {/* 🔥 CHARTS */}
      <div className="charts-grid">

        {/* Supplier Performance */}
        <div className="chart-card">
          <h4>Supplier Performance</h4>

          {supplierData.length === 0 ? (
            <p>No data available</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={supplierData}>
                <XAxis dataKey="supplier" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="total" fill="#2cb1a5" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Monthly Sales */}
        <div className="chart-card">
          <h4>Monthly Sales</h4>

          {monthlyData.length === 0 ? (
            <p>No data available</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />

                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#2cb1a5"
                  strokeWidth={3}
                />

              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

      </div>
    </div>
  );
};

export default Reports;