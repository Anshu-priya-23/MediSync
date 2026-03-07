import React from "react";
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
            <p>Baby Care</p>
            <p>Medicine</p>
            <p>Beauty</p>
            <p>Wellness</p>
            <p>Health Devices</p>
          </div>
        </div>

        {/* Medicine */}
        <div className="category-item">
          <FaCapsules className="nav-icon" />
          Medicine
          <div className="mega-menu">
            <div className="menu-column">
              <h4>Health</h4>
              <p>Tablets</p>
              <p>Syrups</p>
            </div>
          </div>
        </div>

        {/* Beauty */}
        <div className="category-item">
          <FaSpa className="nav-icon" />
          Beauty
          <div className="mega-menu">
            <div className="menu-column">
              <h4>Skin Care</h4>
              <p>Face Wash</p>
              <p>Moisturizer</p>
            </div>
          </div>
        </div>

        {/* Wellness */}
        <div className="category-item">
          <FaLeaf className="nav-icon" />
          Wellness
          <div className="mega-menu">
            <div className="menu-column">
              <h4>Fitness</h4>
              <p>Protein</p>
              <p>Vitamins</p>
            </div>
          </div>
        </div>

        {/* Health Devices */}
        <div className="category-item">
          <FaHeartbeat className="nav-icon" />
          Health Devices
          <div className="mega-menu">
            <div className="menu-column">
              <h4>Devices</h4>
              <p>Thermometer</p>
              <p>BP Monitor</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Navbar;