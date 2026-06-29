import { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../Services/supabase.js';
import { 
  FaTachometerAlt, 
  FaBox, 
  FaClipboardList, 
  FaTruck, 
  FaHistory, 
  FaCoins, 
  FaCog, 
  FaSignOutAlt, 
  FaBars, 
  FaTimes, 
  FaUserCircle,
  FaExclamationTriangle
} from 'react-icons/fa';
import './AdminLayout.css';
import Logo from '../../assets/Logo.png';
import toast from 'react-hot-toast';

const AdminLayout = ({ session }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [adminName, setAdminName] = useState('Admin');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchAdminName = async () => {
      if (session?.user) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', session.user.id)
            .single();

          if (!error && data?.full_name) {
            setAdminName(data.full_name);
          } else {
            const name = session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Admin';
            setAdminName(name);
          }
        } catch (err) {
          console.error('Error fetching admin profile name:', err);
          const name = session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Admin';
          setAdminName(name);
        }
      }
    };

    fetchAdminName();

    const handleProfileUpdate = () => {
      fetchAdminName();
    };
    window.addEventListener('profile-updated', handleProfileUpdate);

    return () => {
      window.removeEventListener('profile-updated', handleProfileUpdate);
    };
  }, [session]);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success('Logged out successfully');
      navigate('/');
    } catch (err) {
      console.error('Logout error:', err);
      toast.error('Failed to log out');
    }
  };

  const navItems = [
    { name: 'Dashboard', to: '/admin/dashboard', icon: <FaTachometerAlt /> },
    { name: 'Products', to: '/admin/products', icon: <FaBox /> },
    { name: 'Orders', to: '/admin/orders', icon: <FaClipboardList /> },
    { name: 'Active Deliveries', to: '/admin/active-deliveries', icon: <FaTruck /> },
    { name: 'Order History', to: '/admin/order-history', icon: <FaHistory /> },
    { name: "Today's Sales", to: '/admin/today-sales', icon: <FaCoins /> },
    { name: 'Low Stock', to: '/admin/low-stock', icon: <FaExclamationTriangle /> },
    { name: 'Settings', to: '/admin/settings', icon: <FaCog /> },
  ];

  return (
    <div className="admin-layout">
      {/* Mobile Header */}
      <header className="mobile-header">
        <button className="menu-toggle" onClick={() => setIsSidebarOpen(true)} aria-label="Open Menu">
          <FaBars />
        </button>
        <div className="mobile-logo">
          <img src={Logo} alt="Mahadeva Super Mart Logo" />
        </div>
        <button className="mobile-logout" onClick={handleLogout} title="Logout" aria-label="Logout">
          <FaSignOutAlt />
        </button>
      </header>

      {/* Sidebar */}
      <aside className={`admin-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <img src={Logo} alt="Mahadeva Super Mart brand logo" className="brand-logo" />
          <h2 className="brand-title">Admin Panel</h2>
          <button className="sidebar-close" onClick={() => setIsSidebarOpen(false)} aria-label="Close Menu">
            <FaTimes />
          </button>
        </div>

        <nav className="sidebar-nav">
          <ul>
            {navItems.map((item) => (
              <li key={item.name}>
                <NavLink 
                  to={item.to} 
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-text">{item.name}</span>
                </NavLink>
              </li>
            ))}
            <li className="logout-li">
              <button className="sidebar-logout-btn" onClick={handleLogout}>
                <span className="nav-icon"><FaSignOutAlt /></span>
                <span className="nav-text">Logout</span>
              </button>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Sidebar Overlay on mobile */}
      {isSidebarOpen && <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>}

      {/* Main Content Area */}
      <div className="admin-main">
        {/* Topbar */}
        <header className="admin-topbar">
          <div className="topbar-welcome">
            <h1 className="page-title">
              {navItems.find((item) => location.pathname.startsWith(item.to))?.name || 'Admin'}
            </h1>
          </div>
          <div className="topbar-actions">
            <div className="admin-profile-badge">
              <FaUserCircle className="profile-icon" />
              <span className="admin-name">{adminName}</span>
            </div>
            <button className="topbar-logout-btn" onClick={handleLogout} title="Logout">
              <FaSignOutAlt />
              <span>Logout</span>
            </button>
          </div>
        </header>

        {/* Render nested views */}
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
