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

import Navbar from './components/common/Navbar';
import Header from './components/homepage/Header';

import Shop from './pages/Shop';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import SupplierDashboard from './pages/supplierDashboard';
import Profile from './pages/Profile';
import About from './pages/About';

import { Toaster } from 'react-hot-toast';
import CategoryPage from './pages/CategoryPage';
import ProductDetailPage from './pages/ProductDetailPage';
import AddMedicine from './components/supplier/addMedicine';

/* 🔥 Layout Wrapper */
function Layout() {
  const location = useLocation();

  // Hide header & navbar on supplier pages
  const hideLayout = location.pathname.startsWith("/supplier");

  return (
    <>
      {!hideLayout && (
        <>
          <div
            style={{
              position: "sticky",
              top: 0,
              zIndex: 1100,
              background: "#fff"
            }}
          >
            <Header />
          </div>

          <div
            style={{
              position: "sticky",
              top: "80px",
              zIndex: 1000,
              background: "#fff"
            }}
          >
            <Navbar />
          </div>
        </>
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
        <Route path="/supplier-dashboard/add-medicine/:id" element={<AddMedicine />} />

        <Route path="*" element={<Navigate to="/" replace />} />
        <Route path="/category/:categoryName" element={<CategoryPage />} />
        <Route path="/product/:productId" element={<ProductDetailPage />} />
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