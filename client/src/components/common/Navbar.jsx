import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom'; 
import { AuthContext } from '../../context/AuthContext';
import { User } from 'lucide-react'; 
import { FaBars, FaCapsules, FaSpa, FaLeaf, FaHeartbeat } from "react-icons/fa";
import "./Navbar.css"; 

const Navbar = () => {
    const { user } = useContext(AuthContext);
    const location = useLocation(); 

    const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : <User size={20} />;

    // 🚨 THE CRITICAL FIX: Hide categories on Auth, Profile, and ALL Dashboards!
    const shouldHideCategories = 
        ['/profile', '/login', '/register'].includes(location.pathname) || 
        location.pathname.includes('dashboard');

    return (
        <div className="navbar-wrapper">
            {/* --- SLEEK WHITE TOP BAR (ALWAYS VISIBLE) --- */}
            <nav className="nav-container-white-thin">
                <Link to="/" className="logo-link">
                    <span className="logo-text-teal-small">Medi</span>
                    <span className="logo-text-dark-small">Sync</span>
                </Link>

                <div className="nav-links-right">
                    {user ? (
                        <div className="profile-section-static">
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

            {/* --- CATEGORY BAR: Visible ONLY on the Home/Shop pages --- */}
            {!shouldHideCategories && (
                <div className="category-navbar">
                    <div className="category-container">

                        {/* ALL CATEGORIES */}
                        <div className="category-item">
                            <FaBars className="nav-icon" />
                            All Categories
                            <div className="dropdown-menu">
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
            )}
        </div>
    );
};

export default Navbar;