import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
    User, 
    Mail, 
    ShieldCheck, 
    ShoppingBag, 
    Settings, 
    MapPin, 
    ChevronRight, 
    Info, 
    LogOut, 
    LayoutDashboard 
} from 'lucide-react';

const Profile = () => {
    const { user, logout } = useContext(AuthContext); 
    const navigate = useNavigate();

    const userName = user?.name || "Guest User";
    const firstLetter = userName.charAt(0).toUpperCase();

    const handleLogout = () => {
        logout(); 
        navigate('/login'); 
    };

    if (!user) return <div style={styles.loading}>Loading your wellness profile...</div>;

    return (
        <div style={styles.container}>
            {/* Sidebar with Netmeds Dark Navy Theme */}
            <div style={styles.sidebar}>
                <div style={styles.avatarSection}>
                    <div style={styles.avatar}>{firstLetter}</div>
                    <h2 style={styles.userName}>{userName}</h2>
                    <span style={styles.roleTag}>
                        {user?.role === 'admin' ? 'Pharmacist / Admin' : 'Customer'}
                    </span>
                </div>
                
                <div style={styles.navMenu}>
                    <Link to="/profile" style={styles.activeLink}>
                        <User size={18}/> <span>My Profile</span> <ChevronRight size={16}/>
                    </Link>

                    {user?.role === 'admin' && (
                        <Link to="/dashboard" style={styles.adminLink}>
                            <LayoutDashboard size={18}/> 
                            <span>Admin Dashboard</span> 
                            <ChevronRight size={16}/>
                        </Link>
                    )}

                    <Link to="/orders" style={styles.navLink}>
                        <ShoppingBag size={18}/> <span>Order History</span> <ChevronRight size={16}/>
                    </Link>
                    
                    <Link to="/addresses" style={styles.navLink}>
                        <MapPin size={18}/> <span>My Addresses</span> <ChevronRight size={16}/>
                    </Link>
                    
                    <Link to="/about" style={styles.navLink}>
                        <Info size={18}/> <span>About Us</span> <ChevronRight size={16}/>
                    </Link>

                    <Link to="/settings" style={styles.navLink}>
                        <Settings size={18}/> <span>Account Settings</span> <ChevronRight size={16}/>
                    </Link>

                    <button onClick={handleLogout} style={styles.logoutBtn}>
                        <LogOut size={18}/> <span>Logout</span>
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div style={styles.mainContent}>
                <h3 style={styles.sectionHeading}>General Information</h3>
                <div style={styles.grid}>
                    <div style={styles.infoBox}>
                        <Mail size={20} color="#24aeb1" />
                        <div>
                            <p style={styles.label}>EMAIL</p>
                            <p style={styles.value}>{user?.email}</p>
                        </div>
                    </div>
                    <div style={styles.infoBox}>
                        <ShieldCheck size={20} color="#24aeb1" />
                        <div>
                            <p style={styles.label}>ACCOUNT STATUS</p>
                            <p style={styles.value}>Verified {user?.role?.toUpperCase()}</p>
                        </div>
                    </div>
                </div>

                <h3 style={styles.sectionHeading}>Recent Activity</h3>
                <div style={styles.emptyState}>
                    <ShoppingBag size={48} color="#e0e0e0" />
                    
                    {/* Role-Based Conditional Message */}
                    <p style={styles.emptyText}>
                        {user?.role === 'admin' 
                            ? "Admin account active. Manage medicines via the dashboard." 
                            : "You haven't placed any orders yet."}
                    </p>
                    
                    {/* Role-Based Conditional Button */}
                    {user?.role === 'admin' ? (
                        <Link to="/dashboard" style={styles.shopBtn}>Go to Dashboard</Link>
                    ) : (
                        <Link to="/" style={styles.shopBtn}>Start Shopping</Link>
                    )}
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: { display: 'flex', maxWidth: '1100px', margin: '50px auto', gap: '25px', padding: '0 20px' },
    sidebar: { flex: '1', backgroundColor: '#242c44', borderRadius: '12px', padding: '30px 0', color: '#fff', height: 'fit-content' },
    avatarSection: { textAlign: 'center', padding: '0 20px 25px', borderBottom: '1px solid rgba(255,255,255,0.1)' },
    avatar: { width: '70px', height: '70px', backgroundColor: '#24aeb1', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '28px', fontWeight: 'bold', margin: '0 auto 15px' },
    userName: { fontSize: '18px', margin: '0 0 5px' },
    roleTag: { fontSize: '11px', backgroundColor: 'rgba(36, 174, 177, 0.2)', padding: '3px 10px', borderRadius: '4px', color: '#24aeb1', fontWeight: 'bold' },
    navMenu: { display: 'flex', flexDirection: 'column', marginTop: '15px' },
    activeLink: { display: 'flex', alignItems: 'center', gap: '12px', padding: '15px 25px', textDecoration: 'none', color: '#fff', backgroundColor: 'rgba(36, 174, 177, 0.2)', borderLeft: '4px solid #24aeb1', fontSize: '14px' },
    navLink: { display: 'flex', alignItems: 'center', gap: '12px', padding: '15px 25px', textDecoration: 'none', color: 'rgba(255,255,255,0.7)', fontSize: '14px', transition: '0.3s' },
    adminLink: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px 25px', textDecoration: 'none', color: '#24aeb1', fontSize: '14px', fontWeight: 'bold', backgroundColor: 'rgba(255, 255, 255, 0.05)', transition: '0.3s' },
    logoutBtn: { display: 'flex', alignItems: 'center', gap: '12px', padding: '15px 25px', marginTop: '20px', width: '100%', backgroundColor: 'transparent', border: 'none', borderTop: '1px solid rgba(255,255,255,0.1)', color: '#ff6f61', fontSize: '14px', cursor: 'pointer', textAlign: 'left', transition: '0.3s' },
    mainContent: { flex: '3', backgroundColor: '#fff', borderRadius: '12px', padding: '35px', boxShadow: '0 2px 20px rgba(0,0,0,0.05)' },
    sectionHeading: { fontSize: '16px', fontWeight: '700', color: '#242c44', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '1px' },
    grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '40px' },
    infoBox: { display: 'flex', alignItems: 'center', gap: '15px', padding: '20px', border: '1px solid #f0f0f0', borderRadius: '8px' },
    label: { fontSize: '10px', color: '#a0a0a0', margin: 0, fontWeight: '700' },
    value: { fontSize: '14px', color: '#242c44', margin: 0, fontWeight: '600' },
    emptyState: { textAlign: 'center', padding: '50px 0', border: '2px dashed #f0f0f0', borderRadius: '12px' },
    emptyText: { color: '#888', margin: '15px 0' },
    shopBtn: { display: 'inline-block', backgroundColor: '#24aeb1', color: '#fff', padding: '10px 25px', borderRadius: '5px', textDecoration: 'none', fontWeight: '600', fontSize: '14px' },
    loading: { textAlign: 'center', marginTop: '100px', color: '#242c44', fontWeight: 'bold' }
};

export default Profile;