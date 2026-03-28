import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom'; // Added useLocation
import { AuthContext } from '../../context/AuthContext';
import { User } from 'lucide-react'; 
import { FaBars, FaCapsules, FaSpa, FaLeaf, FaHeartbeat } from "react-icons/fa";
import "./Navbar.css"; 

const Navbar = () => {
    const { user } = useContext(AuthContext);
    const location = useLocation(); // Get current URL path

    const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : <User size={20} />;

    // Define pages where we want to HIDE the teal category bar
    const hideCategoriesOn = ['/profile', '/login', '/register', '/dashboard'];
    const shouldHideCategories = hideCategoriesOn.includes(location.pathname);

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
                        <div className="category-item"><FaBars className="nav-icon" /> All Categories</div>
                        <div className="category-item"><FaCapsules className="nav-icon" /> Medicine</div>
                        <div className="category-item"><FaSpa className="nav-icon" /> Beauty</div>
                        <div className="category-item"><FaLeaf className="nav-icon" /> Wellness</div>
                        <div className="category-item"><FaHeartbeat className="nav-icon" /> Health Devices</div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Navbar;