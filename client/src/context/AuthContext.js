import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        // FIX: Look for the 'user' object instead of just 'role'
        const savedUser = localStorage.getItem('user'); 
        
        if (token && savedUser) {
            try {
                // Parse the string back into an object so Profile.jsx can read it
                setUser(JSON.parse(savedUser));
            } catch (error) {
                console.error("Session data corrupted", error);
                localStorage.clear();
            }
        }
        setLoading(false);
    }, []);

    const login = (resData) => {
        // Saves the token and the full user object (with name!)
        localStorage.setItem('user', JSON.stringify(resData.user));
        localStorage.setItem('token', resData.token);
        
        setUser(resData.user); // Triggers Profile button to show
    };

    const logout = () => {
        // FIX: Remove 'user' instead of 'role' to match your login logic
        localStorage.removeItem('token');
        localStorage.removeItem('user'); 
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};