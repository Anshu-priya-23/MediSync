import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { Eye, EyeOff } from 'lucide-react';

const PRIMARY_COLOR = "#35b7a7";
const PRIMARY_DARK = "#2aa295";

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:5000/api/auth/login', { 
                email, 
                password 
            });
            
            login(res.data); 
            
            // --- UPDATED ROUTING LOGIC ---
            if (res.data.user.role === 'admin') {
                navigate('/admin-dashboard');
            } else if (res.data.user.role === 'pharmacist') {
                navigate('/supplier-dashboard'); // <-- The hyphen is here!
            } else {
                navigate('/');
            }
            // -----------------------------

        } catch (err) {
            alert("Login Failed: " + (err.response?.data?.message || "Server Error"));
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2 style={styles.title}>
                    <span style={{color: PRIMARY_COLOR}}>Medi</span>
                    <span style={{color: '#0d4642'}}>Sync</span>
                </h2>
                <p style={styles.subtitle}>
                    Login to access your healthcare dashboard
                </p>
                
                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Email Address</label>
                        <input 
                            type="email"
                            placeholder="Enter your email"
                            style={styles.input}
                            onFocus={(e) => e.target.style.border = `1px solid ${PRIMARY_COLOR}`}
                            onBlur={(e) => e.target.style.border = '1px solid #d1d5db'}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Password</label>
                        <div style={{ position: 'relative' }}>
                            <input 
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter your password"
                                style={{ ...styles.input, width: '100%', paddingRight: '45px' }}
                                onFocus={(e) => e.target.style.border = `1px solid ${PRIMARY_COLOR}`}
                                onBlur={(e) => e.target.style.border = '1px solid #d1d5db'}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <button 
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={styles.eyeButton}
                            >
                                {showPassword ? <EyeOff size={18} color="#9ca3af" /> : <Eye size={18} color="#9ca3af" />}
                            </button>
                        </div>
                    </div>
                    
                    <button 
                        type="submit"
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                        style={{
                            ...styles.button,
                            background: isHovered ? PRIMARY_DARK : PRIMARY_COLOR,
                            transform: isHovered ? 'translateY(-2px)' : 'translateY(0)'
                        }}
                    >
                        Login
                    </button>
                </form>

                <p style={styles.footerText}>
                    New to MediSync?{" "}
                    <Link to="/register" style={styles.link}>
                        Create Account
                    </Link>
                </p>
            </div>
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        padding: '40px 20px',
        backgroundColor: '#ffffff'
    },

    card: {
        backgroundColor: '#ffffff',
        padding: '45px',
        borderRadius: '18px',
        boxShadow: '0 15px 50px rgba(53, 183, 167, 0.2)',
        width: '100%',
        maxWidth: '420px',
        border: '1px solid #eef2f7'
    },

    title: {
        fontSize: '30px',
        fontWeight: '800',
        marginBottom: '8px',
        textAlign: 'center'
    },

    subtitle: {
        color: '#6b7280',
        marginBottom: '35px',
        fontSize: '14px',
        fontWeight: '500',
        textAlign: 'center'
    },

    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '22px'
    },

    inputGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
    },

    label: {
        fontSize: '12px',
        fontWeight: '700',
        color: PRIMARY_COLOR,
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
    },

    input: {
        padding: '15px',
        borderRadius: '14px',
        border: '1px solid #d1d5db',
        fontSize: '15px',
        backgroundColor: '#f9fafb',
        boxSizing: 'border-box',
        outline: 'none',
        transition: '0.3s ease'
    },

    eyeButton: {
        position: 'absolute',
        right: '15px',
        top: '50%',
        transform: 'translateY(-50%)',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center'
    },

    button: {
        padding: '16px',
        color: 'white',
        border: 'none',
        borderRadius: '14px',
        fontWeight: '800',
        cursor: 'pointer',
        fontSize: '16px',
        boxShadow: '0 8px 25px rgba(53, 183, 167, 0.5)',
        transition: '0.3s ease all'
    },

    footerText: {
        textAlign: 'center',
        marginTop: '30px',
        fontSize: '14px',
        color: '#6b7280'
    },

    link: {
        color: PRIMARY_COLOR,
        textDecoration: 'none',
        fontWeight: '700'
    }
};

export default Login;