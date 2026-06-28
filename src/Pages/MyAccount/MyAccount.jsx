import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../Services/supabase.js';
import { getUserOrders } from '../../Services/orderServices.js';
import Header from '../../Components/Header/Header.jsx';
import Navbar from '../../Components/Navbar/Navbar.jsx';
import Footer from '../../Components/Footer/Footer.jsx';
import toast from 'react-hot-toast';
import './MyAccount.css';

const MyAccount = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [fullName, setFullName] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Statistics & Orders
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Accordion states for App Info
  const [activeAccordion, setActiveAccordion] = useState(null);

  useEffect(() => {
    const originalTitle = document.title;
    document.title = 'My Account | Mahadeva Super Mart';
    
    return () => {
      document.title = originalTitle;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    
    const fetchUserData = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) throw error;
        if (user && isMounted) {
          setUser(user);
          const name = user.user_metadata?.full_name || '';
          setFullName(name);
          setNewName(name);
          
          // Fetch orders to calculate statistics & delivery preference
          const ordersData = await getUserOrders(user.id);
          if (isMounted) {
            setOrders(ordersData || []);
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        if (isMounted) toast.error('Failed to load account details');
      } finally {
        if (isMounted) setLoadingOrders(false);
      }
    };

    fetchUserData();

    // Listen to auth state changes to keep user data in sync
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user && isMounted) {
        setUser(session.user);
        const name = session.user.user_metadata?.full_name || '';
        setFullName(name);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Memoized derived states for calculations
  const { totalOrders, totalProducts, totalSpent, latestLocation } = useMemo(() => {
    const sortedOrders = [...orders].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    const location = sortedOrders.find(o => o.location_link)?.location_link || null;
    
    const stats = sortedOrders.reduce(
      (acc, order) => {
        acc.spent += Number(order.total_amount || 0);
        const items = order.orderitems || [];
        acc.products += items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
        return acc;
      },
      { spent: 0, products: 0 }
    );

    return {
      totalOrders: sortedOrders.length,
      totalProducts: stats.products,
      totalSpent: stats.spent,
      latestLocation: location,
    };
  }, [orders]);

  const handleSaveName = async (e) => {
    e.preventDefault();
    if (isSaving) return;
    
    const trimmedName = newName.trim();
    if (!trimmedName) {
      toast.error('Name cannot be empty');
      return;
    }
    if (trimmedName.length < 3) {
      toast.error('Name must be at least 3 characters');
      return;
    }

    setIsSaving(true);
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: { full_name: trimmedName }
      });

      if (error) throw error;

      if (data?.user) {
        const updatedName = data.user.user_metadata?.full_name || trimmedName;
        setFullName(updatedName);
        setUser(data.user);
        setIsEditingName(false);
        toast.success('Name updated successfully!');
      }
    } catch (error) {
      console.error('Error updating name:', error);
      toast.error(error.message || 'Failed to update name');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success('Logged out successfully');
      // Auth listener in App.jsx will handle redirect
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error('Logout failed');
      setIsLoggingOut(false);
    }
  };

  const getLoginMethod = useCallback(() => {
    if (!user) return 'Email';
    const provider = user.app_metadata?.provider || user.identities?.[0]?.provider;
    if (provider === 'google') return 'Google';
    if (user.phone) return 'Mobile OTP';
    return 'Email / Password';
  }, [user]);

  const toggleAccordion = useCallback((index) => {
    setActiveAccordion(prev => (prev === index ? null : index));
  }, []);

  // Get initials for Avatar fallback
  const getInitials = useCallback(() => {
    if (fullName) {
      const parts = fullName.trim().split(/\s+/);
      if (parts.length > 1) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return parts[0][0].toUpperCase();
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return '?';
  }, [fullName, user]);

  return (
    <>
      <Header />
      <Navbar />
      <main className="my-account-container">
        <div className="account-page-header">
          <h1>My Account</h1>
          <p>Manage your profile, track orders, and view your preferences.</p>
        </div>

        <div className="account-grid">
          {/* Left Column: Profile Card & Statistics */}
          <div className="account-sidebar">
            {/* Profile Card */}
            <div className="profile-card card-shadow">
              <div className="avatar-container">
                <div className="profile-avatar">
                  {getInitials()}
                </div>
              </div>

              <div className="profile-info-section">
                {isEditingName ? (
                  <form onSubmit={handleSaveName} className="edit-name-form">
                    <input
                      type="text"
                      className="edit-name-input"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="Enter full name"
                      disabled={isSaving}
                      aria-label="Full Name Input"
                      autoFocus
                    />
                    <div className="edit-name-actions">
                      <button type="submit" className="save-btn" disabled={isSaving} aria-label="Save Name">
                        {isSaving ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        type="button"
                        className="cancel-btn"
                        onClick={() => {
                          setNewName(fullName);
                          setIsEditingName(false);
                        }}
                        disabled={isSaving}
                        aria-label="Cancel Editing"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="name-display-container">
                    {fullName ? (
                      <h2 className="user-name">{fullName}</h2>
                    ) : (
                      <span className="complete-profile-label">Complete your profile</span>
                    )}
                    <button
                      className="edit-profile-btn"
                      onClick={() => setIsEditingName(true)}
                      aria-label="Edit Full Name"
                    >
                      <i className="fa-solid fa-pen-to-square"></i> Edit
                    </button>
                  </div>
                )}

                <div className="profile-meta-details">
                  <div className="meta-item">
                    <span className="meta-label">Email / Mobile</span>
                    <span className="meta-value">
                      {user?.email || user?.phone || 'Not available'}
                    </span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">Login Method</span>
                    <span className="meta-value login-method-badge">
                      {getLoginMethod()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Statistics Card */}
            <div className="stats-card card-shadow">
              <h3>Account Statistics</h3>
              {loadingOrders ? (
                <div className="stats-loading">
                  <div className="stats-skeleton"></div>
                  <div className="stats-skeleton"></div>
                  <div className="stats-skeleton"></div>
                </div>
              ) : (
                <div className="stats-grid">
                  <div className="stat-box">
                    <div className="stat-icon-wrapper orders">
                      <i className="fa-solid fa-bag-shopping"></i>
                    </div>
                    <div className="stat-content">
                      <span className="stat-num">{totalOrders}</span>
                      <span className="stat-label">Total Orders</span>
                    </div>
                  </div>

                  <div className="stat-box">
                    <div className="stat-icon-wrapper products">
                      <i className="fa-solid fa-box-open"></i>
                    </div>
                    <div className="stat-content">
                      <span className="stat-num">{totalProducts}</span>
                      <span className="stat-label">Products Bought</span>
                    </div>
                  </div>

                  <div className="stat-box">
                    <div className="stat-icon-wrapper spent">
                      <i className="fa-solid fa-indian-rupee-sign"></i>
                    </div>
                    <div className="stat-content">
                      <span className="stat-num">
                        ₹{totalSpent.toLocaleString('en-IN')}
                      </span>
                      <span className="stat-label">Total Spent</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Preferences, Quick Actions, Help, Info */}
          <div className="account-main-content">
            {/* Quick Actions */}
            <div className="quick-actions-section card-shadow">
              <h3>Quick Actions</h3>
              <div className="quick-actions-grid">
                <button 
                  className="quick-action-card"
                  onClick={() => navigate('/my-orders')}
                  aria-label="View My Orders"
                >
                  <div className="action-card-icon orders">
                    <i className="fa-solid fa-receipt"></i>
                  </div>
                  <span>My Orders</span>
                  <p>View and track your orders</p>
                </button>

                <button 
                  className="quick-action-card"
                  onClick={() => navigate('/Cart')}
                  aria-label="Go to Shopping Cart"
                >
                  <div className="action-card-icon cart">
                    <i className="fa-solid fa-cart-shopping"></i>
                  </div>
                  <span>Shopping Cart</span>
                  <p>Proceed to checkout</p>
                </button>

                <button 
                  className="quick-action-card"
                  onClick={() => navigate('/Home')}
                  aria-label="Continue Shopping"
                >
                  <div className="action-card-icon shopping">
                    <i className="fa-solid fa-store"></i>
                  </div>
                  <span>Continue Shopping</span>
                  <p>Browse our fresh catalog</p>
                </button>
              </div>
            </div>

            {/* Delivery Preference */}
            <div className="delivery-pref-section card-shadow">
              <h3>Delivery Preference</h3>
              <div className="delivery-pref-content">
                <div className="location-icon-container">
                  <i className="fa-solid fa-map-location-dot"></i>
                </div>
                <div className="location-details">
                  <h4>Google Maps Location</h4>
                  {loadingOrders ? (
                    <div className="location-skeleton"></div>
                  ) : latestLocation ? (
                    <>
                      <p className="location-link-text">{latestLocation}</p>
                      <a
                        href={latestLocation.startsWith('http') ? latestLocation : `https://${latestLocation}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="open-maps-btn"
                        aria-label="Open location in Google Maps"
                      >
                        <i className="fa-solid fa-location-arrow"></i> Open in Google Maps
                      </a>
                    </>
                  ) : (
                    <p className="no-location-text">
                      No Google Maps location saved yet. You will be prompted to enter your delivery location link during your next checkout.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Help & Support */}
            <div className="help-support-section card-shadow">
              <h3>Help & Support</h3>
              <div className="support-actions-grid">
                <a href="tel:+918686969980" className="support-link-card" aria-label="Call Store">
                  <i className="fa-solid fa-phone"></i>
                  <div className="support-card-info">
                    <span>Call Store</span>
                    <p>+91 8686969980</p>
                  </div>
                </a>

                <a href="mailto:mahadevasupermartstore2@gmail.com" className="support-link-card" aria-label="Email Support">
                  <i className="fa-solid fa-envelope"></i>
                  <div className="support-card-info">
                    <span>Email Support</span>
                    <p>mahadevasupermartstore2@gmail.com</p>
                  </div>
                </a>
              </div>
            </div>

            {/* App Information Accordions */}
            <div className="app-info-section card-shadow">
              <h3>App Information</h3>
              
              {/* Accordion 1: Privacy Policy */}
              <div className={`accordion-item ${activeAccordion === 0 ? 'active' : ''}`}>
                <button 
                  className="accordion-trigger"
                  onClick={() => toggleAccordion(0)}
                  aria-expanded={activeAccordion === 0}
                  aria-controls="accordion-content-0"
                >
                  <span className="accordion-title">
                    <i className="fa-solid fa-shield-halved"></i> Privacy Policy
                  </span>
                  <i className={`fa-solid fa-chevron-down accordion-arrow`}></i>
                </button>
                <div id="accordion-content-0" className="accordion-content">
                  <div className="accordion-content-wrapper">
                    <div className="accordion-text-inner">
                      <p>At Mahadeva Super Mart, we value and protect your privacy. This Privacy Policy explains how we collect, use, and safeguard your personal information when you use our website and mobile application.</p>
                      <h4>Information We Collect</h4>
                      <p>We collect information you provide directly to us, including your name, email address, phone number, and Google Maps delivery locations. We also collect transaction details and purchase histories.</p>
                      <h4>How We Use Your Information</h4>
                      <p>We use your information to process and deliver orders, personalize your shopping experience, communicate updates, and improve our services. We do not sell or share your personal data with third parties for marketing purposes.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Accordion 2: Terms & Conditions */}
              <div className={`accordion-item ${activeAccordion === 1 ? 'active' : ''}`}>
                <button 
                  className="accordion-trigger"
                  onClick={() => toggleAccordion(1)}
                  aria-expanded={activeAccordion === 1}
                  aria-controls="accordion-content-1"
                >
                  <span className="accordion-title">
                    <i className="fa-solid fa-file-contract"></i> Terms & Conditions
                  </span>
                  <i className={`fa-solid fa-chevron-down accordion-arrow`}></i>
                </button>
                <div id="accordion-content-1" className="accordion-content">
                  <div className="accordion-content-wrapper">
                    <div className="accordion-text-inner">
                      <p>Welcome to Mahadeva Super Mart. By accessing or using our services, you agree to comply with and be bound by the following terms and conditions.</p>
                      <h4>1. Account Registration</h4>
                      <p>You must maintain the confidentiality of your account credentials. You are responsible for all activities that occur under your account.</p>
                      <h4>2. Ordering & Delivery</h4>
                      <p>All orders are subject to availability. Delivery times are estimates and may vary due to external factors. You must provide a valid Google Maps location for successful delivery.</p>
                      <h4>3. Pricing & Payments</h4>
                      <p>We strive to ensure accurate pricing, but errors may occur. We support Cash on Delivery (COD) and online payments. Prices are in Indian Rupees (₹).</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Accordion 3: About Mahadeva Super Mart */}
              <div className={`accordion-item ${activeAccordion === 2 ? 'active' : ''}`}>
                <button 
                  className="accordion-trigger"
                  onClick={() => toggleAccordion(2)}
                  aria-expanded={activeAccordion === 2}
                  aria-controls="accordion-content-2"
                >
                  <span className="accordion-title">
                    <i className="fa-solid fa-circle-info"></i> About Mahadeva Super Mart
                  </span>
                  <i className={`fa-solid fa-chevron-down accordion-arrow`}></i>
                </button>
                <div id="accordion-content-2" className="accordion-content">
                  <div className="accordion-content-wrapper">
                    <div className="accordion-text-inner">
                      <p><strong>Mahadeva Super Mart</strong> is your premium neighborhood supermarket, committed to bringing fresh groceries, household essentials, and daily necessities straight to your doorstep.</p>
                      <p>Founded with the vision of making grocery shopping hassle-free, we combine a handpicked selection of high-quality products with efficient, reliable delivery services. Our store is located in Sapthagiri Colony, Karimnagar, serving our local community with dedication and care.</p>
                      <p>Thank you for choosing us as your trusted shopping partner!</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Logout Action */}
            <div className="logout-action-container">
              <button 
                className="my-account-logout-btn"
                onClick={handleLogout}
                disabled={isLoggingOut}
                aria-label="Logout from Account"
              >
                <i className="fa-solid fa-right-from-bracket"></i> {isLoggingOut ? 'Logging out...' : 'Logout from Account'}
              </button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default MyAccount;
