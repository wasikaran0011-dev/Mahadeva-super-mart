import { useState, useEffect } from 'react';
import { supabase } from '../../../Services/supabase.js';
import { 
  FaDollarSign, 
  FaShoppingCart, 
  FaBox, 
  FaExclamationTriangle, 
  FaSync, 
  FaArrowRight 
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import './Dashboard.css';
import '../Orders/Orders.css'; // Re-use status badges & loaders

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalSales: 0,
    activeOrdersCount: 0,
    totalProductsCount: 0,
    lowStockCount: 0,
    recentOrders: [],
    lowStockProducts: []
  });

  const fetchDashboardData = async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      else setRefreshing(true);

      const [ordersRes, productsRes] = await Promise.all([
        supabase
          .from('orders')
          .select('*, orderitems(*)')
          .order('created_at', { ascending: false }),
        supabase
          .from('Products')
          .select('*')
      ]);

      if (ordersRes.error) throw ordersRes.error;
      if (productsRes.error) throw productsRes.error;

      const orders = ordersRes.data || [];
      const products = productsRes.data || [];

      // Calculate Total Sales (delivered status)
      const deliveredOrders = orders.filter(o => (o.order_status || '').toLowerCase() === 'delivered');
      const totalSales = deliveredOrders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);

      // Calculate Active Orders (neither delivered nor cancelled)
      const activeOrders = orders.filter(o => {
        const s = (o.order_status || '').toLowerCase();
        return s !== 'delivered' && s !== 'cancelled' && s !== 'canceled';
      });
      const activeOrdersCount = activeOrders.length;

      // Calculate Low Stock Products (stock < 10)
      const lowStockProducts = products.filter(p => Number(p.stock) < 10).sort((a, b) => Number(a.stock) - Number(b.stock));
      const lowStockCount = lowStockProducts.length;

      setStats({
        totalSales,
        activeOrdersCount,
        totalProductsCount: products.length,
        lowStockCount,
        recentOrders: orders.slice(0, 5),
        lowStockProducts: lowStockProducts.slice(0, 5)
      });
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      toast.error('Failed to load dashboard metrics');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const formatDateTime = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <div className="orders-skeleton-wrapper" style={{ padding: '24px' }}>
        <div className="skeleton-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '24px' }}>
          <div className="skeleton-card" style={{ height: '120px' }}></div>
          <div className="skeleton-card" style={{ height: '120px' }}></div>
          <div className="skeleton-card" style={{ height: '120px' }}></div>
          <div className="skeleton-card" style={{ height: '120px' }}></div>
        </div>
        <div className="skeleton-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <div className="skeleton-card" style={{ height: '350px' }}></div>
          <div className="skeleton-card" style={{ height: '350px' }}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header-row">
        <div>
          <h2>Dashboard Overview</h2>
          <p className="subtitle">Real-time statistics & business metrics summary.</p>
        </div>
        <button 
          className="refresh-btn" 
          onClick={() => fetchDashboardData(true)} 
          disabled={refreshing}
          aria-label="Refresh data"
        >
          <FaSync className={refreshing ? 'spin' : ''} /> {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Metrics Row */}
      <div className="metrics-grid">
        {/* Metric 1 */}
        <div className="metric-card sales">
          <div className="metric-icon-wrapper">
            <FaDollarSign className="metric-icon" />
          </div>
          <div className="metric-details">
            <span className="metric-title">Total Sales</span>
            <h3 className="metric-value">₹{stats.totalSales.toLocaleString('en-IN')}</h3>
            <span className="metric-subtitle">Completed orders revenue</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="metric-card orders">
          <div className="metric-icon-wrapper">
            <FaShoppingCart className="metric-icon" />
          </div>
          <div className="metric-details">
            <span className="metric-title">Active Orders</span>
            <h3 className="metric-value">{stats.activeOrdersCount}</h3>
            <span className="metric-subtitle">Orders in progress</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="metric-card products">
          <div className="metric-icon-wrapper">
            <FaBox className="metric-icon" />
          </div>
          <div className="metric-details">
            <span className="metric-title">Total Products</span>
            <h3 className="metric-value">{stats.totalProductsCount}</h3>
            <span className="metric-subtitle">Items in catalog</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="metric-card alert">
          <div className="metric-icon-wrapper">
            <FaExclamationTriangle className="metric-icon" />
          </div>
          <div className="metric-details">
            <span className="metric-title">Low Stock Alert</span>
            <h3 className="metric-value">{stats.lowStockCount}</h3>
            <span className="metric-subtitle">Items under 10 stock</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Lists */}
      <div className="dashboard-grid-sections">
        {/* Recent Orders */}
        <div className="dashboard-card-section">
          <div className="section-title-row">
            <h4>Recent Orders</h4>
            <button className="view-all-link" onClick={() => navigate('/admin/orders')}>
              Manage Orders <FaArrowRight />
            </button>
          </div>
          {stats.recentOrders.length === 0 ? (
            <div className="empty-section-state">
              <span>No orders found in the system.</span>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Customer</th>
                    <th>Total</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentOrders.map(order => {
                    return (
                      <tr key={order.id} className="row-hoverable" onClick={() => navigate('/admin/orders')}>
                        <td><strong>#{order.id}</strong></td>
                        <td>
                          <div className="cell-name">{order.customer_name || 'N/A'}</div>
                          <div className="cell-sub">{formatDateTime(order.created_at)}</div>
                        </td>
                        <td><strong>₹{Number(order.total_amount || 0).toLocaleString('en-IN')}</strong></td>
                        <td>
                          <span className={`status-badge ${(order.order_status || 'Placed').toLowerCase().replace(/\s+/g, '-')}`}>
                            {order.order_status || 'Placed'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Low Stock Items */}
        <div className="dashboard-card-section">
          <div className="section-title-row">
            <h4>Low Stock Alert List</h4>
            <button className="view-all-link" onClick={() => navigate('/admin/low-stock')}>
              View Low Stock <FaArrowRight />
            </button>
          </div>
          {stats.lowStockProducts.length === 0 ? (
            <div className="empty-section-state success">
              <span>✓ All products have healthy stock levels!</span>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Brand/Vendor</th>
                    <th>Price</th>
                    <th>Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.lowStockProducts.map(prod => (
                    <tr key={prod.id} className="row-hoverable" onClick={() => navigate('/admin/low-stock')}>
                      <td>
                        <div className="cell-name flex-align">
                          {prod.image && (
                            <img 
                              src={prod.image} 
                              alt={prod.title} 
                              className="dash-prod-thumb"
                              onError={(e) => { e.target.style.display = 'none'; }}
                            />
                          )}
                          <span>{prod.title}</span>
                        </div>
                      </td>
                      <td>{prod.brand || 'N/A'}</td>
                      <td>₹{Number(prod.price || 0).toLocaleString('en-IN')}</td>
                      <td>
                        <span className={`stock-level-badge ${prod.stock === 0 ? 'out-of-stock' : 'low-stock'}`}>
                          {prod.stock} left
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
