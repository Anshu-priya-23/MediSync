import React from "react";
import "./Header.css";
import logo from "../../assets/medisync-logo.png";
import { FaMapMarkerAlt, FaShoppingCart, FaUserCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();

  return (
    <div className="top-header">
      <div className="header-left">
        <img
          src={logo}
          alt="MediSync"
          className="logo"
        />

        <div className="delivery-section">
          <FaMapMarkerAlt className="icon" />
          <div>
            <div className="delivery-title">Delivery Address</div>
            <div className="delivery-select">
              Select Address ▼
            </div>
          </div>
        </div>
      </div>

      <div className="header-right">
        <div className="cart">
          <FaShoppingCart />
          <span className="cart-count">0</span>
        </div>

        <button 
          className="login-btn"
          onClick={() => navigate("/login")}
        >
          Login
          <FaUserCircle className="login-icon" />
        </button>
      </div>
    </div>
  );
};

export default Header;