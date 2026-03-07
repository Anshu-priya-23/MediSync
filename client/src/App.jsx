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

import Dashboard from "./components/admin/Dashboard";
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

          {/* Default page */}
          <Route path="/" element={<Login />} />

          {/* Public pages */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/about" element={<About />} />

          {/* User Profile */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Admin Dashboard */}
          <Route
            path="/dashboard/*"
            element={
              <ProtectedRoute adminOnly={true}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Admin Stats */}
          <Route
            path="/admin-stats"
            element={
              <ProtectedRoute adminOnly={true}>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Redirect unknown routes */}
          <Route path="*" element={<Navigate to="/login" replace />} />

        </Routes>

      </Router>
    </AuthProvider>
  );
}

export default App;