import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav style={styles.nav}>
            <Link to="/" style={styles.logo}>
    Medi<span style={{color: '#ff6f61'}}>Sync</span>
</Link>
            <div>
                <Link to="/" style={styles.link}>Shop</Link>
                {user ? (
                    <>
                        {user.role === 'admin' && <Link to="/dashboard" style={styles.link}>Admin</Link>}
                        <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
                    </>
                ) : (
                    <Link to="/login" style={styles.loginBtn}>Login</Link>
                )}
            </div>
        </nav>
    );
};

const styles = {
    nav: { display: 'flex', justifyContent: 'space-between', padding: '1rem 2rem', background: '#fff', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' },
    logo: { fontSize: '1.5rem', fontWeight: 'bold', color: '#0052cc', textDecoration: 'none' },
    link: { margin: '0 15px', textDecoration: 'none', color: '#333' },
    loginBtn: { padding: '8px 15px', background: '#0052cc', color: 'white', borderRadius: '5px', textDecoration: 'none' },
    logoutBtn: { padding: '8px 15px', background: '#ff6f61', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }
};

export default Navbar;