import './App.css';
import Login from './Pages/Login/Login.jsx';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from './Services/supabase.js';
import Home from './Pages/Home/Home.jsx';
import ProtectedRoute from './Components/ProtectedRoute.jsx';
import { Toaster } from 'react-hot-toast';
import Cart from './Pages/Cart/Cart.jsx';
import Products from './Pages/Products/Products.jsx';
import SearchResults from './Pages/SearchResults/SearchResults.jsx';
import ProductDetails from './Pages/ProductDetails/ProductDetails.jsx';
import MyOrders from './Pages/MyOrders/MyOrders.jsx';
import OrderDetails from './Pages/OrderDetails/OrderDetails.jsx';
import MyAccount from './Pages/MyAccount/MyAccount.jsx';
import AboutUs from './Pages/AboutUs/AboutUs.jsx';
import ContactUs from './Pages/ContactUs/ContactUs.jsx';
import OrderSuccess from './Pages/OrderSuccess/OrderSuccess.jsx';
import NewArrivalsPage from './Pages/NewArrivalsPage/NewArrivalsPage.jsx';
import OffersPage from './Pages/OffersPage/OffersPage.jsx';

// Admin Components
import AdminRoute from './Components/AdminRoute.jsx';
import AdminLayout from './Admin/Layout/AdminLayout.jsx';
import AdminDashboard from './Admin/Pages/Dashboard/Dashboard.jsx';
import AdminProducts from './Admin/Pages/Products/Products.jsx';
import AdminOrders from './Admin/Pages/Orders/Orders.jsx';
import ActiveDeliveries from './Admin/Pages/ActiveDeliveries/ActiveDeliveries.jsx';
import OrderHistory from './Admin/Pages/OrderHistory/OrderHistory.jsx';
import TodaySales from './Admin/Pages/TodaySales/TodaySales.jsx';
import AdminSettings from './Admin/Pages/Settings/Settings.jsx';

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingRole, setCheckingRole] = useState(true);

  // Restore session before rendering routes to prevent login-page flicker
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        if (session) {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();

          const isAdminUser = !error && profile?.role === 'admin';
          setIsAdmin(isAdminUser);
          
          if (location.pathname === '/') {
            if (isAdminUser) {
              navigate('/admin/dashboard', { replace: true });
            } else {
              navigate('/Home', { replace: true });
            }
          }
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        console.error('Session check error:', error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
        setCheckingRole(false);
      }
    };
    checkSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      if (session) {
        setCheckingRole(true);
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();

          const isAdminUser = profile?.role === 'admin';
          setIsAdmin(isAdminUser);

          if (location.pathname === '/') {
            if (isAdminUser) {
              navigate('/admin/dashboard', { replace: true });
            } else {
              navigate('/Home', { replace: true });
            }
          }
        } catch (e) {
          console.error('Auth check error:', e);
          setIsAdmin(false);
          if (location.pathname === '/') {
            navigate('/Home', { replace: true });
          }
        } finally {
          setCheckingRole(false);
        }
      } else {
        setIsAdmin(false);
        setCheckingRole(false);
        if (event === 'SIGNED_OUT') {
          navigate('/');
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, location.pathname]);

  // Block all route rendering until session & role are resolved — prevents Login flash
  if (loading || checkingRole) {
    return (
      <div
        style={{
          height: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
          gap: '12px',
          fontFamily: 'inherit',
          color: '#555',
        }}
      >
        <div
          style={{
            width: '40px',
            height: '40px',
            border: '3px solid #e5e5e5',
            borderTop: '3px solid #e53935',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <span style={{ fontSize: '0.9rem' }}>Loading…</span>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Login />} />
        <Route path="/about-us" element={<AboutUs />} />
        <Route path="/contact-us" element={<ContactUs />} />
        <Route path="/Cart" element={<Cart />} />

        {/* Protected routes */}
        <Route
          path="/Home"
          element={
            <ProtectedRoute session={session} loading={loading}>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/new-arrivals"
          element={
            <ProtectedRoute session={session} loading={loading}>
              <NewArrivalsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/offers"
          element={
            <ProtectedRoute session={session} loading={loading}>
              <OffersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/products/:categoryId"
          element={
            <ProtectedRoute session={session} loading={loading}>
              <Products />
            </ProtectedRoute>
          }
        />
        <Route
          path="/search"
          element={
            <ProtectedRoute session={session} loading={loading}>
              <SearchResults />
            </ProtectedRoute>
          }
        />
        <Route
          path="/product/:id"
          element={
            <ProtectedRoute session={session} loading={loading}>
              <ProductDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-orders"
          element={
            <ProtectedRoute session={session} loading={loading}>
              <MyOrders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-account"
          element={
            <ProtectedRoute session={session} loading={loading}>
              <MyAccount />
            </ProtectedRoute>
          }
        />
        <Route
          path="/order/:orderId"
          element={
            <ProtectedRoute session={session} loading={loading}>
              <OrderDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/order-success/:orderId"
          element={
            <ProtectedRoute session={session} loading={loading}>
              <OrderSuccess />
            </ProtectedRoute>
          }
        />

        {/* Admin routes */}
        <Route
          path="/admin"
          element={
            <AdminRoute session={session} loading={loading || checkingRole} isAdmin={isAdmin}>
              <AdminLayout session={session} />
            </AdminRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="active-deliveries" element={<ActiveDeliveries />} />
          <Route path="order-history" element={<OrderHistory />} />
          <Route path="today-sales" element={<TodaySales />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
