import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

import Login from './pages/auth/Login';
import Layout from './components/Layout';

// Admin pages
import AdminShops from './pages/admin/Shops';
import AdminUsers from './pages/admin/Users';
import AdminOrders from './pages/admin/Orders';
import AdminAds from './pages/admin/Ads';
import ChangePassword from './pages/admin/ChangePassword';

// Shop owner pages
import ShopProducts from './pages/shopowner/Products';
import ShopOrders from './pages/shopowner/Orders';
import ShopProfile from './pages/shopowner/Profile';


function PrivateRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/login" />;
  return <Layout>{children}</Layout>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* Admin routes */}
      <Route path="/admin/shops" element={
        <PrivateRoute allowedRoles={['admin']}><AdminShops /></PrivateRoute>
      } />
      <Route path="/admin/users" element={
        <PrivateRoute allowedRoles={['admin']}><AdminUsers /></PrivateRoute>
      } />
      <Route path="/admin/orders" element={
        <PrivateRoute allowedRoles={['admin']}><AdminOrders /></PrivateRoute>
      } />
      <Route path="/admin/ads" element={
        <PrivateRoute allowedRoles={['admin']}><AdminAds /></PrivateRoute>
      } />
      <Route path="/admin/change-password" element={
        <PrivateRoute allowedRoles={['admin']}><ChangePassword /></PrivateRoute>
      } />

      {/* Shop owner routes */}
      <Route path="/shop/products" element={
        <PrivateRoute allowedRoles={['shop_owner']}><ShopProducts /></PrivateRoute>
      } />
      <Route path="/shop/orders" element={
        <PrivateRoute allowedRoles={['shop_owner']}><ShopOrders /></PrivateRoute>
      } />
      <Route path="/shop/profile" element={
        <PrivateRoute allowedRoles={['shop_owner']}><ShopProfile /></PrivateRoute>
      } />

      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" />
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}