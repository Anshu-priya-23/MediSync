import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Eye, EyeOff } from 'lucide-react'; // Added professional icons

const Register = () => {
    const [formData, setFormData] = useState({ 
        name: '', 
        email: '', 
        password: '', 
        role: 'patient' 
    });
    
    // State to toggle password visibility
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
        if (!passwordRegex.test(formData.password)) {
            toast.error("Password must be at least 8 characters long and include both letters and numbers.");
            return;
        }
        
        // 1. Trigger the loading toast
        const loadingToast = toast.loading('Creating your account...');

        try {
            // 2. Call the Gateway (Port 5000)
            await axios.post('http://localhost:5000/api/auth/register', formData);
            
            // 3. Update toast to Success
            toast.success('Registration Successful! Welcome to MediSync.', { id: loadingToast });
            
            // 4. Wait 2 seconds so the user can see the message, then redirect
            setTimeout(() => {
                navigate('/login');
            }, 2000);
            
        } catch (err) {
            // 5. Update toast to Error with specific message from backend/gateway
            const errorMsg = err.response?.data?.message || "Registration Failed: Server Error";
            toast.error(errorMsg, { id: loadingToast });
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <div style={styles.brandSection}>
                    <h2 style={styles.logo}>
                        <span style={{color: '#24aeb1'}}>Medi</span><span style={{color: '#0d4642'}}>Sync</span>
                    </h2>
                    <p style={styles.subtitle}>Join our healthcare network</p>
                </div>

                <form onSubmit={handleSubmit} style={styles.form}>
                    {/* Radio Button Group for Roles */}
                    <div style={styles.radioSection}>
                        <label style={styles.label}>Register as:</label>
                        <div style={styles.radioGroup}>
                            <label style={styles.radioLabel}>
                                <input 
                                    type="radio" 
                                    value="patient" 
                                    checked={formData.role === 'patient'}
                                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                                    style={styles.radioInput}
                                />
                                Patient
                            </label>
                            <label style={styles.radioLabel}>
                                <input 
                                    type="radio" 
                                    value="admin" 
                                    checked={formData.role === 'admin'}
                                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                                    style={styles.radioInput}
                                />
                                Pharmacist / Admin
                            </label>
                        </div>
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Full Name</label>
                        <input 
                            type="text" 
                            placeholder="Full name" 
                            style={styles.input} 
                            onChange={(e) => setFormData({...formData, name: e.target.value})} 
                            required 
                        />
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Email Address</label>
                        <input 
                            type="email" 
                            placeholder="example@mail.com" 
                            style={styles.input} 
                            onChange={(e) => setFormData({...formData, email: e.target.value})} 
                            required 
                        />
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Password</label>
                        <div style={{ position: 'relative' }}>
                            <input 
                                type={showPassword ? "text" : "password"} 
                                placeholder="Create password" 
                                style={{ ...styles.input, width: '100%', paddingRight: '45px' }} 
                                onChange={(e) => setFormData({...formData, password: e.target.value})} 
                                required 
                            />
                            {/* Updated Toggle Button with Icons */}
                            <button 
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={styles.eyeButton}
                            >
                                {showPassword ? <EyeOff size={18} color="#9ca3af" /> : <Eye size={18} color="#9ca3af" />}
                            </button>
                        </div>
                    </div>

                    <button type="submit" style={styles.button}>Create Account</button>
                </form>

                <p style={styles.footerText}>
                    Already have an account? <Link to="/login" style={styles.link}>Login</Link>
                </p>
            </div>
        </div>
    );
};

// ... existing imports

const styles = {
    container: { 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh', 
        backgroundColor: '#f6f7fb',
        padding: '20px'
    },
    card: { 
        backgroundColor: '#fff', 
        padding: '40px', 
        borderRadius: '16px', 
        boxShadow: '0 10px 40px rgba(0,0,0,0.08)', 
        width: '100%', 
        maxWidth: '440px' 
    },
    brandSection: { textAlign: 'center', marginBottom: '35px' },
    logo: { 
        fontSize: '30px', 
        fontWeight: '900', 
        margin: 0, 
        color: '#242c44',
        letterSpacing: '-1px'
    },
    subtitle: { 
        color: '#6b7280', 
        fontSize: '14px', 
        marginTop: '8px',
        fontWeight: '500' 
    },
    form: { display: 'flex', flexDirection: 'column', gap: '22px' },
    inputGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
    label: { 
        fontSize: '12px', 
        fontWeight: '700', 
        color: '#242c44',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
    },
    input: { 
        padding: '14px', 
        borderRadius: '10px', 
        border: '1px solid #e5e7eb', 
        outline: 'none', 
        fontSize: '15px', 
        boxSizing: 'border-box',
        backgroundColor: '#f9fafb'
    },
    radioSection: { marginTop: '5px' },
    radioGroup: { 
        display: 'flex', 
        gap: '20px', 
        marginTop: '10px',
        backgroundColor: '#f9fafb',
        padding: '12px',
        borderRadius: '10px',
        border: '1px solid #e5e7eb'
    },
    radioLabel: { 
        fontSize: '14px', 
        cursor: 'pointer', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '10px', 
        color: '#4b5563',
        fontWeight: '600'
    },
    radioInput: { 
        accentColor: '#24aeb1', 
        width: '18px', 
        height: '18px' 
    },
    eyeButton: {
        position: 'absolute',
        right: '15px',
        top: '50%',
        transform: 'translateY(-50%)',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '0',
        display: 'flex',
        alignItems: 'center'
    },
    button: { 
        padding: '16px', 
        backgroundColor: '#24aeb1', // Netmeds Teal
        color: 'white', 
        border: 'none', 
        borderRadius: '10px', 
        fontWeight: '800', 
        cursor: 'pointer', 
        fontSize: '16px',
        boxShadow: '0 4px 15px rgba(36, 174, 177, 0.3)',
        transition: 'background 0.3s' 
    },
    footerText: { 
        textAlign: 'center', 
        marginTop: '25px', 
        fontSize: '14px', 
        color: '#6b7280' 
    },
    link: { 
        color: '#24aeb1', 
        textDecoration: 'none', 
        fontWeight: '700' 
    }
};
export default Register;