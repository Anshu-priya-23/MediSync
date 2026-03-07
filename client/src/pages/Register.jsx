import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Eye, EyeOff } from 'lucide-react';

const PRIMARY_COLOR = "#35b7a7";

const Register = () => {
    const [formData, setFormData] = useState({ 
        name: '', 
        email: '', 
        password: '', 
        role: 'patient' 
    });

    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
        if (!passwordRegex.test(formData.password)) {
            toast.error("Password must be at least 8 characters long and include both letters and numbers.");
            return;
        }

        const loadingToast = toast.loading('Creating your account...');

        try {
            await axios.post('http://localhost:5000/api/auth/register', formData);
            toast.success('Registration Successful! Welcome to MediSync.', { id: loadingToast });

            setTimeout(() => {
                navigate('/login');
            }, 2000);

        } catch (err) {
            const errorMsg = err.response?.data?.message || "Registration Failed: Server Error";
            toast.error(errorMsg, { id: loadingToast });
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <div style={styles.brandSection}>
                    <h2 style={styles.logo}>
                        <span style={{color: PRIMARY_COLOR}}>Medi</span>
                        <span style={{color: '#0d4642'}}>Sync</span>
                    </h2>
                    <p style={styles.subtitle}>Join our healthcare network</p>
                </div>

                <form onSubmit={handleSubmit} style={styles.form}>

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
                            onFocus={(e) => e.target.style.border = `1px solid ${PRIMARY_COLOR}`}
                            onBlur={(e) => e.target.style.border = '1px solid #d1d5db'}
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
                            onFocus={(e) => e.target.style.border = `1px solid ${PRIMARY_COLOR}`}
                            onBlur={(e) => e.target.style.border = '1px solid #d1d5db'}
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
                                onFocus={(e) => e.target.style.border = `1px solid ${PRIMARY_COLOR}`}
                                onBlur={(e) => e.target.style.border = '1px solid #d1d5db'}
                                onChange={(e) => setFormData({...formData, password: e.target.value})}
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

                    <button type="submit" style={styles.button}>
                        Create Account
                    </button>
                </form>

                <p style={styles.footerText}>
                    Already have an account? <Link to="/login" style={styles.link}>Login</Link>
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
        backgroundColor: '#ffffff',
        padding: '40px 20px'
    },

    card: { 
        backgroundColor: '#ffffff', 
        padding: '45px', 
        borderRadius: '20px', 
        boxShadow: `0 15px 50px rgba(53, 183, 167, 0.2)`,
        width: '100%', 
        maxWidth: '460px',
        border: '1px solid #eef2f7'
    },

    brandSection: { 
        textAlign: 'center', 
        marginBottom: '35px' 
    },

    logo: { 
        fontSize: '32px', 
        fontWeight: '900', 
        margin: 0,
        letterSpacing: '-1px'
    },

    subtitle: { 
        color: '#6b7280',
        fontSize: '14px',
        marginTop: '8px',
        fontWeight: '500'
    },

    form: { 
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
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
        outline: 'none',
        fontSize: '15px',
        backgroundColor: '#f9fafb',
        transition: '0.3s ease'
    },

    radioSection: { 
        marginTop: '5px'
    },

    radioGroup: { 
        display: 'flex',
        gap: '25px',
        marginTop: '10px',
        backgroundColor: '#f9fafb',
        padding: '14px',
        borderRadius: '14px',
        border: '1px solid #e5e7eb'
    },

    radioLabel: { 
        fontSize: '14px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        color: '#374151',
        fontWeight: '600'
    },

    radioInput: { 
        accentColor: PRIMARY_COLOR,
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
        background: PRIMARY_COLOR,
        color: 'white',
        border: 'none',
        borderRadius: '14px',
        fontWeight: '800',
        cursor: 'pointer',
        fontSize: '16px',
        boxShadow: `0 8px 25px rgba(53, 183, 167, 0.5)`,
        transition: '0.3s ease'
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

export default Register;