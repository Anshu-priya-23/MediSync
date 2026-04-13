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
  Line
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
        totalOrders: 0,
        totalCancelled: 0,
        dailyData: [],
        weeklyData: [],
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

  // ✅ USE REAL BACKEND DATA
  const dailyData = data.dailyData || [];
  const weeklyData = data.weeklyData || [];
  const monthlyData = data.monthlyData || [];

  return (
    <div className="reports-page">

      {/* HEADER */}
      <div className="reports-header">
        <h2>Reports</h2>
      </div>

      {/* SUMMARY */}
      <div className="summary-cards">
        <div className="card">
          <p>Total Orders</p>
          <h3>{data.totalOrders || 0}</h3>
        </div>

        <div className="card">
          <p>Cancelled Orders</p>
          <h3 className="red">{data.totalCancelled || 0}</h3>
        </div>
      </div>

      {/* CHARTS */}
      <div className="charts-grid">

        {/* DAILY SALES */}
        <div className="chart-card">
          <h4>Daily Sales</h4>

          {dailyData.length === 0 ? (
            <p>No data available</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={dailyData}>
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#2cb1a5" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* WEEKLY SALES */}
        <div className="chart-card">
          <h4>Weekly Sales</h4>

          {weeklyData.length === 0 ? (
            <p>No data available</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={weeklyData}>
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#4fd1c5" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* MONTHLY SALES */}
        <div className="chart-card">
          <h4>Monthly Sales</h4>

          {monthlyData.length === 0 ? (
            <p>No data available</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={monthlyData}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
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