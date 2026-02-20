import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { User } from 'lucide-react';

const Navbar = () => {
    const { user } = useContext(AuthContext);
    
    // State for hover effects
    const [isProfileHovered, setIsProfileHovered] = useState(false);
    const [isLoginHovered, setIsLoginHovered] = useState(false);

    const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : <User size={16} />;

    return (
        <nav style={styles.nav}>
            {/* Logo remains the anchor to the Shop page */}
            <Link to="/" style={styles.logo}>
                <span style={{color: '#242c44'}}>Medi</span><span style={{color: '#fff'}}>Sync</span>
            </Link>

            <div style={styles.navLinks}>
                {user ? (
                    <div style={styles.userSection}>
                        {/* ADMIN LINK REMOVED FROM HERE
                           Admins will now access their dashboard via the Profile sidebar
                        */}
                        <Link 
                            to="/profile" 
                            style={{
                                ...styles.profileContainer,
                                backgroundColor: isProfileHovered ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.15)'
                            }}
                            onMouseEnter={() => setIsProfileHovered(true)}
                            onMouseLeave={() => setIsProfileHovered(false)}
                        >
                            <div style={styles.avatarCircle}>{userInitial}</div>
                            <span style={styles.profileText}>Account</span>
                        </Link>
                    </div>
                ) : (
                    <Link 
                        to="/login" 
                        style={{
                            ...styles.loginBtn,
                            backgroundColor: isLoginHovered ? '#1a2033' : '#242c44'
                        }}
                        onMouseEnter={() => setIsLoginHovered(true)}
                        onMouseLeave={() => setIsLoginHovered(false)}
                    >
                        Login / Register
                    </Link>
                )}
            </div>
        </nav>
    );
};

const styles = {
    nav: { 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '0.6rem 2.5rem', 
        background: '#24aeb1', // Netmeds Teal
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        position: 'sticky',
        top: 0,
        zIndex: 1000
    },
    logo: { fontSize: '1.5rem', fontWeight: '800', textDecoration: 'none' },
    navLinks: { display: 'flex', alignItems: 'center' },
    userSection: { display: 'flex', alignItems: 'center', gap: '15px' },
    profileContainer: { display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', padding: '5px 12px', borderRadius: '25px', transition: '0.3s' },
    avatarCircle: { width: '32px', height: '32px', background: '#242c44', color: '#fff', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '14px', fontWeight: 'bold', border: '2px solid rgba(255,255,255,0.3)' },
    profileText: { color: '#fff', fontSize: '14px', fontWeight: '600' },
    loginBtn: { padding: '8px 22px', color: '#fff', borderRadius: '25px', textDecoration: 'none', fontSize: '14px', fontWeight: '700', transition: '0.3s' }
};

export default Navbar;