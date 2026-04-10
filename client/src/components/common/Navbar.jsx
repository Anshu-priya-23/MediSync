import React, { useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { CartContext } from "../../context/CartContext";
import { User, ShoppingCart } from "lucide-react";
import { FaBars, FaCapsules, FaSpa, FaLeaf, FaHeartbeat } from "react-icons/fa";
import "./Navbar.css";

const Navbar = () => {
  const { user } = useContext(AuthContext);
  const { cart } = useContext(CartContext);
  const location = useLocation();

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : <User size={20} />;
  const cartCount = Number(cart?.totalItems || 0);

  const hideCategoriesOn = ["/profile", "/login", "/register", "/dashboard", "/cart", "/checkout", "/orders"];
  const shouldHideCategories = hideCategoriesOn.includes(location.pathname) || location.pathname.startsWith("/payments/");

  return (
    <div className="navbar-wrapper">
      <nav className="nav-container-white-thin">
        <Link to="/" className="logo-link">
          <span className="logo-text-teal-small">Medi</span>
          <span className="logo-text-dark-small">Sync</span>
        </Link>

        <div className="nav-links-right">
          {user ? (
            <div className="profile-section-static">
              <Link to="/cart" className="cart-quick-btn" aria-label="Open cart">
                <ShoppingCart size={15} />
                <span>Cart</span>
                {cartCount > 0 ? <span className="cart-quick-badge">{cartCount}</span> : null}
              </Link>
              <span className="welcome-text-sleek">Welcome, {user.name}</span>
              <Link to="/profile" className="avatar-link">
                <div className="avatar-circle-sleek">{userInitial}</div>
              </Link>
            </div>
          ) : (
            <Link to="/login" className="login-btn-teal-small">
              Login / Register
            </Link>
          )}
        </div>
      </nav>

      {!shouldHideCategories && (
        <div className="category-navbar">
          <div className="category-container">
            <div className="category-item">
              <FaBars className="nav-icon" />
              All Categories
              <div className="dropdown-menu">
                <Link to="/category/baby-care" style={{ textDecoration: "none" }}>
                  <p>Baby Care</p>
                </Link>
                <Link to="/category/medicine" style={{ textDecoration: "none" }}>
                  <p>Medicine</p>
                </Link>
                <Link to="/category/beauty" style={{ textDecoration: "none" }}>
                  <p>Beauty</p>
                </Link>
                <Link to="/category/wellness" style={{ textDecoration: "none" }}>
                  <p>Wellness</p>
                </Link>
                <Link to="/category/health-devices" style={{ textDecoration: "none" }}>
                  <p>Health Devices</p>
                </Link>
              </div>
            </div>

            <Link to="/category/medicine" className="category-item" style={{ textDecoration: "none" }}>
              <FaCapsules className="nav-icon" />
              Medicine
            </Link>

            <Link to="/category/beauty" className="category-item" style={{ textDecoration: "none" }}>
              <FaSpa className="nav-icon" />
              Beauty
            </Link>

            <Link to="/category/wellness" className="category-item" style={{ textDecoration: "none" }}>
              <FaLeaf className="nav-icon" />
              Wellness
            </Link>

            <Link to="/category/health-devices" className="category-item" style={{ textDecoration: "none" }}>
              <FaHeartbeat className="nav-icon" />
              Health Devices
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;
