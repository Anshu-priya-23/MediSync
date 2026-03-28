import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation
} from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import About from './pages/About';
import Navbar from './components/common/Navbar'; // Your integrated component

import Shop from './pages/Shop';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import SupplierDashboard from './pages/supplierDashboard';
import Profile from './pages/Profile';

import { Toaster } from 'react-hot-toast';

/* 🔥 Layout Wrapper */
function Layout() {
  const location = useLocation();

  // Hide Navbar on supplier pages for a clean dashboard view
  const hideLayout = location.pathname.startsWith("/supplier");

  return (
    <>
      {!hideLayout && (
        <div
          style={{
            position: "sticky",
            top: 0, // Navbar now sticks to the very top
            zIndex: 1100,
            background: "#fff"
          }}
        >
          {/* Header removed to fix the 'Double Navbar' issue */}
          <Navbar /> 
        </div>
      )}

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
        <Route path="/" element={<Shop />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute adminOnly={true}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/supplier-dashboard/*"
          element={<SupplierDashboard />}
        />

        {/* Catch-all route to prevent 404s during the demo */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout />
      </Router>
    </AuthProvider>
  );
}

export default App;