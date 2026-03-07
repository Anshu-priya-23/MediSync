import React from "react";
import "./supplier.css";

const StatCard = ({ title, value, subtitle }) => {
  return (
    <div className="stat-card">
      <div className="stat-title">{title}</div>
      <div className="stat-value">{value}</div>
      {subtitle && <div className="stat-sub">{subtitle}</div>}
    </div>
  );
};

export default StatCard;