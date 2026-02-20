import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

// Added 'adminOnly' inside the parentheses to define it as a prop
const ProtectedRoute = ({ children, adminOnly = false }) => {
    const { user, loading } = useContext(AuthContext);

    // 1. Wait for the AuthContext to finish checking for a token
    if (loading) {
        return <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading...</div>;
    }

    // 2. If no user is found, redirect to login
    if (!user) {
        return <Navigate to="/login" />;
    }

    // 3. Line 16: Check if the route is for admins only
    if (adminOnly && user.role !== 'admin') {
        return <Navigate to="/" />;
    }

    // 4. If all checks pass, render the protected page
    return children;
};

export default ProtectedRoute;