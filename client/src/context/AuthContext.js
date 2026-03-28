import React, { createContext, useState, useEffect, useContext } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user'); 
        
        if (token && savedUser) {
            try {
                // Parse the string back into an object so Navbar and Profile can read it
                setUser(JSON.parse(savedUser));
            } catch (error) {
                console.error("Session data corrupted", error);
                localStorage.clear();
            }
        }
        setLoading(false);
    }, []);

    const login = (resData) => {
        // Saves the token and the full user object (including name)
        localStorage.setItem('user', JSON.stringify(resData.user));
        localStorage.setItem('token', resData.token);
        
        setUser(resData.user); // Triggers Navbar and Profile to update
    };

    const logout = () => {
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

// --- THIS IS THE CRITICAL HOOK YOUR NAVBAR NEEDS ---
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};