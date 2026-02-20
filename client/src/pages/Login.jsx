import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { Eye, EyeOff } from 'lucide-react';

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
            // Simplified request: Only sending email and password
            const res = await axios.post('http://localhost:5000/api/auth/login', { 
                email, 
                password 
            });
            
            // Save user data (including the role from the DB) to global context
            login(res.data); 
            res.data.user.role === 'admin' ? navigate('/dashboard') : navigate('/');
            
            // SMART REDIRECTION
            // We check the role returned by the server to decide where the user goes
            if (res.data.user.role === 'admin') {
                navigate('/dashboard'); // Pharmacist/Admin Command Center
            } else {
                navigate('/'); // Patient/Customer Shop
            }
        } catch (err) {
            alert("Login Failed: " + (err.response?.data?.message || "Server Error"));
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2 style={styles.title}>
                    <span style={{color: '#24aeb1'}}>Medi</span><span style={{color: '#242c44'}}>Sync</span>
                </h2>
                <p style={styles.subtitle}>Login to access your healthcare dashboard</p>
                
                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Email Address</label>
                        <input 
                            type="email" 
                            placeholder="Enter your email" 
                            style={styles.input} 
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
                            backgroundColor: isHovered ? '#1d8e91' : '#24aeb1',
                            transform: isHovered ? 'translateY(-2px)' : 'translateY(0)'
                        }}
                    >
                        Login
                    </button>
                </form>

                <p style={styles.footerText}>
                    New to MediSync? <Link to="/register" style={styles.link}>Create Account</Link>
                </p>
            </div>
        </div>
    );
};

const styles = {
    container: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f6f7fb' },
    card: { backgroundColor: '#fff', padding: '40px', borderRadius: '16px', boxShadow: '0 8px 40px rgba(0,0,0,0.08)', width: '100%', maxWidth: '400px' },
    title: { fontSize: '26px', fontWeight: '800', marginBottom: '8px', textAlign: 'center' },
    subtitle: { color: '#6b7280', marginBottom: '35px', fontSize: '14px', fontWeight: '500', textAlign: 'center' },
    form: { display: 'flex', flexDirection: 'column', gap: '20px' },
    inputGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
    label: { fontSize: '12px', fontWeight: '700', color: '#242c44', textTransform: 'uppercase', letterSpacing: '0.5px' },
    input: { padding: '14px', borderRadius: '10px', border: '1px solid #e5e7eb', fontSize: '15px', backgroundColor: '#f9fafb', boxSizing: 'border-box', outline: 'none' },
    eyeButton: { position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' },
    button: { padding: '16px', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '800', cursor: 'pointer', fontSize: '16px', boxShadow: '0 4px 15px rgba(36, 174, 177, 0.3)', transition: '0.3s ease all' },
    footerText: { textAlign: 'center', marginTop: '25px', fontSize: '14px', color: '#6b7280' },
    link: { color: '#24aeb1', textDecoration: 'none', fontWeight: '700' }
};

export default Login;