import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Navbar from './components/common/Navbar';
import Shop from './pages/Shop';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile'; 
import About from './pages/About';
// --- NEW IMPORTS ---
import Checkout from './pages/Checkout';
import PaymentPage from './pages/PaymentPage';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Toaster 
          position="top-center" 
          reverseOrder={false} 
          toastOptions={{
            style: {
              borderRadius: '10px',
              background: '#242c44',
              color: '#fff',
            },
          }}
        /> 
        
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Shop />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Patient-Only Routes (Keep protected for now) */}
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />

          {/* --- NEW PAYMENT ROUTES (UNPROTECTED FOR DEMO) --- */}
          {/* We removed <ProtectedRoute> so you can access these directly */}
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/payment" element={<PaymentPage />} />

          {/* Admin-Only Routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute adminOnly={true}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />

          {/* Fallback Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;