import './App.css';
import Login from './Pages/Login/Login.jsx';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
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

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session before rendering routes to prevent login-page flicker
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        // If user is already logged in and lands on the root, send them Home
        if (session && location.pathname === '/') {
          navigate('/Home', { replace: true });
        }
      } catch (error) {
        console.error('Session check error:', error);
      } finally {
        setLoading(false);
      }
    };
    checkSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      if (event === 'SIGNED_IN' && location.pathname === '/') {
        navigate('/Home', { replace: true });
      }
      if (event === 'SIGNED_OUT') {
        navigate('/');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, location.pathname]);

  // Block all route rendering until session is resolved — prevents Login flash
  if (loading) {
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
      </Routes>
    </>
  );
}

export default App;
