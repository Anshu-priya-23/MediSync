import React, { useState } from "react";

const AdminDashboard = () => {
  const [active, setActive] = useState("dashboard");

  return (
    <div style={container}>
      
      {/* Sidebar */}
      <div style={sidebar}>
        <h2 style={{ marginBottom: "40px", color: "#24aeb1" }}>
          Admin Dashboard
        </h2>

        <MenuItem label="Dashboard" active={active} setActive={setActive} />
        <MenuItem label="Users" active={active} setActive={setActive} />
        <MenuItem label="Orders" active={active} setActive={setActive} />
        <MenuItem label="Inventory" active={active} setActive={setActive} />
        <MenuItem label="Reports" active={active} setActive={setActive} />
      </div>

      {/* Main Section */}
      <div style={main}>
        
        {/* Topbar */}
        <div style={topbar}>
          <h2 style={{ margin: 0, color: "#0b7e83" }}>
            {active.charAt(0).toUpperCase() + active.slice(1)}
          </h2>

          <button style={logoutBtn}>Logout</button>
        </div>

        {/* Content */}
        <div style={contentArea}>
          {active === "dashboard" ? <DashboardUI /> : <PlaceholderUI name={active} />}
        </div>

      </div>
    </div>
  );
};

/* Dashboard Content */

const DashboardUI = () => {
  return (
    <>
      <div style={cardGrid}>
        <StatCard title="Total Users" />
        <StatCard title="Total Orders" />
        <StatCard title="Total Revenue" />
        <StatCard title="Low Stock Items" />
      </div>

      <div style={sectionCard}>
        <h3 style={{ color: "#0b7e83" }}>Revenue Overview</h3>
        <div style={chartBox}>Chart will appear here</div>
      </div>

      <div style={sectionCard}>
        <h3 style={{ color: "#0b7e83" }}>Recent Activity</h3>
        <p style={{ color: "#555" }}>
          Data will be displayed once services are integrated.
        </p>
      </div>
    </>
  );
};

const PlaceholderUI = ({ name }) => (
  <div style={sectionCard}>
    <h3 style={{ color: "#0b7e83" }}>
      {name.charAt(0).toUpperCase() + name.slice(1)} Module
    </h3>
    <p style={{ color: "#555" }}>
      Waiting for backend integration.
    </p>
  </div>
);

/* Components */

const MenuItem = ({ label, active, setActive }) => {
  const isActive = active === label.toLowerCase();

  return (
    <p
      onClick={() => setActive(label.toLowerCase())}
      style={{
        marginBottom: "18px",
        cursor: "pointer",
        padding: "8px 12px",
        borderRadius: "4px",
        backgroundColor: isActive ? "#24aeb1" : "transparent",
        color: isActive ? "white" : "#e2e8f0",
        fontWeight: isActive ? "bold" : "normal",
      }}
    >
      {label}
    </p>
  );
};

const StatCard = ({ title }) => (
  <div style={statCard}>
    <h4 style={{ marginBottom: "10px", color: "#444" }}>{title}</h4>
    <p style={{ fontSize: "22px", fontWeight: "bold", color: "#999" }}>
      No Data
    </p>
  </div>
);

/* Styles */

const container = {
  display: "flex",
  minHeight: "100vh",
  fontFamily: "Segoe UI",
};

const sidebar = {
  width: "230px",
  backgroundColor: "#0f172a",
  color: "white",
  padding: "30px",
};

const main = {
  flex: 1,
  backgroundColor: "#f3f9f9",
};

const topbar = {
  backgroundColor: "white",
  padding: "20px 40px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
};

const logoutBtn = {
  padding: "8px 16px",
  backgroundColor: "#24aeb1",
  color: "white",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
};

const contentArea = {
  padding: "40px",
};

const cardGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "25px",
  marginBottom: "30px",
};

const statCard = {
  backgroundColor: "white",
  padding: "25px",
  borderRadius: "8px",
  boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
};

const sectionCard = {
  backgroundColor: "white",
  padding: "30px",
  borderRadius: "8px",
  boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
  marginBottom: "30px",
};

const chartBox = {
  height: "180px",
  backgroundColor: "#e6f4f4",
  borderRadius: "6px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginTop: "15px",
  color: "#0b7e83",
};

export default AdminDashboard;
