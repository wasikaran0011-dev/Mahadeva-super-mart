import { useState, useEffect } from 'react';
import { supabase } from '../../../Services/supabase.js';
import { FaSync, FaRegTimesCircle } from 'react-icons/fa';
import toast from 'react-hot-toast';
import './TodaySales.css';
import '../Orders/Orders.css'; // For common skeleton loaders and status badges

const TodaySales = () => {
  const [data, setData] = useState({
    orders: [],
    revenue: 0,
    productsSold: [],
    totalProductsSold: 0,
    averageOrderValue: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadTodaySales = async (isAutoRefresh = false) => {
    try {
      if (!isAutoRefresh) setLoading(true);
      setIsRefreshing(isAutoRefresh);
      setError(null);

      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const startIso = startOfDay.toISOString();

      // Fetch today's orders
      const { data: ordersData, error: fetchErr } = await supabase
        .from('orders')
        .select('*, orderitems(*)')
        .gte('created_at', startIso)
        .order('created_at', { ascending: false });

      if (fetchErr) throw fetchErr;

      const orders = ordersData || [];
      const completedOrders = orders.filter(o => {
        const s = (o.order_status || '').toLowerCase();
        return s === 'delivered' || s === 'ready' || s === 'out for delivery';
      });

      // Calculate Revenue (only from delivered/completed)
      const revenue = completedOrders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
      
      // Calculate Average Order Value
      const averageOrderValue = completedOrders.length > 0 ? (revenue / completedOrders.length) : 0;

      // Calculate Products Sold
      const productMap = {};
      let totalItems = 0;
      
      completedOrders.forEach(o => {
        (o.orderitems || []).forEach(item => {
          totalItems += item.quantity;
          if (!productMap[item.product_name]) {
            productMap[item.product_name] = {
              name: item.product_name,
              quantity: 0,
              revenue: 0
            };
          }
          productMap[item.product_name].quantity += item.quantity;
          productMap[item.product_name].revenue += Number(item.subtotal || (item.price * item.quantity));
        });
      });

      const productsSold = Object.values(productMap).sort((a, b) => b.quantity - a.quantity);

      setData({
        orders: completedOrders,
        revenue,
        productsSold,
        totalProductsSold: totalItems,
        averageOrderValue
      });
    } catch (err) {
      console.error('Error fetching today sales:', err);
      setError(err.message || 'Failed to fetch sales data');
      if (!isAutoRefresh) toast.error('Failed to load sales data');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadTodaySales();
    
    // Auto refresh every 30 seconds
    const interval = setInterval(() => {
      loadTodaySales(true);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="orders-skeleton-wrapper" style={{ padding: '24px' }}>
        <div className="sales-overview-cards">
          {[1, 2, 3, 4].map(i => <div key={i} className="skeleton-card" style={{ height: '100px' }}></div>)}
        </div>
        <div className="skeleton-card" style={{ height: '300px', marginTop: '24px' }}></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="orders-error-state" style={{ margin: '24px' }}>
        <FaRegTimesCircle className="error-icon" />
        <h3>Error Loading Today's Sales</h3>
        <p>{error}</p>
        <button className="retry-btn" onClick={() => loadTodaySales(false)}>
          <FaSync /> Retry
        </button>
      </div>
    );
  }

  return (
    <div className="sales-page-container">
      {/* Overview Cards */}
      <div className="sales-overview-cards">
        <div className="sales-card">
          <span className="sales-card-title">Today's Revenue</span>
          <span className="sales-card-value" style={{ color: '#10b981' }}>
            ₹{data.revenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </span>
        </div>
        <div className="sales-card">
          <span className="sales-card-title">Completed Orders</span>
          <span className="sales-card-value">{data.orders.length}</span>
        </div>
        <div className="sales-card">
          <span className="sales-card-title">Products Sold</span>
          <span className="sales-card-value">{data.totalProductsSold}</span>
        </div>
        <div className="sales-card">
          <span className="sales-card-title">Average Order Value</span>
          <span className="sales-card-value">
            ₹{data.averageOrderValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </span>
        </div>
      </div>

      <div className="sales-tables-grid">
        {/* Products Sold Table */}
        <div className="sales-table-section">
          <div className="sales-table-header">
            <h3>Products Sold Today</h3>
            <span className="auto-refresh-indicator">
              <FaSync className={isRefreshing ? 'refresh-spin' : ''} /> 
              {isRefreshing ? 'Refreshing...' : 'Live'}
            </span>
          </div>
          <div className="sales-table-body">
            {data.productsSold.length === 0 ? (
              <div className="empty-sales-msg">No products sold today yet.</div>
            ) : (
              <table className="sales-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Qty</th>
                    <th>Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {data.productsSold.map((p, i) => (
                    <tr key={i}>
                      <td>{p.name}</td>
                      <td>{p.quantity}</td>
                      <td>₹{p.revenue.toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Completed Orders Table */}
        <div className="sales-table-section">
          <div className="sales-table-header">
            <h3>Today's Orders</h3>
          </div>
          <div className="sales-table-body">
            {data.orders.length === 0 ? (
              <div className="empty-sales-msg">No completed orders today yet.</div>
            ) : (
              <table className="sales-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Time</th>
                    <th>Total</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.orders.map(o => {
                    const statusClass = (o.order_status || 'unknown').toLowerCase().replace(/\s+/g, '-');
                    return (
                      <tr key={o.id}>
                        <td><strong>#{o.id}</strong></td>
                        <td>{new Date(o.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</td>
                        <td>₹{Number(o.total_amount).toLocaleString('en-IN')}</td>
                        <td>
                          <span className={`status-badge ${statusClass}`}>
                            {o.order_status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TodaySales;
