import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  PlusCircle,
  Pill,
  ShoppingCart,
  Settings, // ✅ changed icon
  LogOut
} from "lucide-react";

import "./supplier.css";

const SupplierSidebar = () => {

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const menu = [
    {
      name: "Dashboard",
      path: "/supplier-dashboard",
      icon: <LayoutDashboard size={18} />,
      end: true
    },
    {
      name: "Add Medicine",
      path: "/supplier-dashboard/add-medicine",
      icon: <PlusCircle size={18} />
    },
    {
      name: "My Medicines",
      path: "/supplier-dashboard/my-medicines",
      icon: <Pill size={18} />
    },
    {
      name: "Orders",
      path: "/supplier-dashboard/orders",
      icon: <ShoppingCart size={18} />
    },
    {
      name: "Settings", // ✅ changed name
      path: "/supplier-dashboard/profile",
      icon: <Settings size={18} /> // ✅ changed icon
    },
  ];

  return (
    <div className="sidebar">

      <div className="sidebar-top">
        <div className="sidebar-logo">
          <span className="logo-green">Medi</span>
          <span className="logo-dark">Sync</span>
        </div>
      </div>

      <div className="sidebar-menu">
        {menu.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            end={item.end}
            className={({ isActive }) =>
              isActive ? "sidebar-link active" : "sidebar-link"
            }
          >
            {item.icon}
            <span>{item.name}</span>
          </NavLink>
        ))}
      </div>

      <div className="sidebar-bottom">
        <button className="logout-btn" onClick={handleLogout}>
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>

    </div>
  );
};

export default SupplierSidebar;