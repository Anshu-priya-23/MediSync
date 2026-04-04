import React from "react";
import { Link } from "react-router-dom"; // Added for routing
import "./Navbar.css";
import { FaBars, FaCapsules, FaSpa, FaLeaf, FaHeartbeat } from "react-icons/fa";

const Navbar = () => {
  return (
    <div className="category-navbar">
      <div className="category-container">

        {/* ALL CATEGORIES */}
        <div className="category-item">
          <FaBars className="nav-icon" />
          All Categories
          <div className="dropdown-menu">
            {/* Wrapped dropdown items in Links */}
            <Link to="/category/baby-care" style={{ textDecoration: 'none' }}>
              <p>Baby Care</p>
            </Link>
            <Link to="/category/medicine" style={{ textDecoration: 'none' }}>
              <p>Medicine</p>
            </Link>
            <Link to="/category/beauty" style={{ textDecoration: 'none' }}>
              <p>Beauty</p>
            </Link>
            <Link to="/category/wellness" style={{ textDecoration: 'none' }}>
              <p>Wellness</p>
            </Link>
            <Link to="/category/health-devices" style={{ textDecoration: 'none' }}>
              <p>Health Devices</p>
            </Link>
          </div>
        </div>

        {/* Medicine */}
        {/* Changed from <div> to <Link> and added 'to' prop */}
        <Link to="/category/medicine" className="category-item" style={{ textDecoration: 'none' }}>
          <FaCapsules className="nav-icon" />
          Medicine
        </Link>

        {/* Beauty */}
        <Link to="/category/beauty" className="category-item" style={{ textDecoration: 'none' }}>
          <FaSpa className="nav-icon" />
          Beauty
        </Link>

        {/* Wellness */}
        <Link to="/category/wellness" className="category-item" style={{ textDecoration: 'none' }}>
          <FaLeaf className="nav-icon" />
          Wellness
        </Link>

        {/* Health Devices */}
        <Link to="/category/health-devices" className="category-item" style={{ textDecoration: 'none' }}>
          <FaHeartbeat className="nav-icon" />
          Health Devices
        </Link>

      </div>
    </div>
  );
};

export default Navbar;