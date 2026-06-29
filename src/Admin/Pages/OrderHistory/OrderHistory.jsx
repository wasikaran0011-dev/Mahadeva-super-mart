import { useState, useEffect } from 'react';
import { supabase } from '../../../Services/supabase.js';
import { 
  FaSearch, 
  FaFilter,
  FaPhoneAlt, 
  FaMapMarkerAlt, 
  FaRegTimesCircle, 
  FaSync, 
  FaInfoCircle
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import '../Orders/Orders.css';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Combined Filters State
  const [filters, setFilters] = useState({
    status: [], // 'Delivered', 'Cancelled'
    dateRange: [] // 'Today', 'This Week', 'This Month'
  });

  const loadHistory = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all orders
      const { data, error: fetchErr } = await supabase
        .from('orders')
        .select('*, orderitems(*)')
        .order('created_at', { ascending: false });

      if (fetchErr) throw fetchErr;

      // Filter historical orders only (Delivered, Cancelled, Canceled)
      const historicalOrders = (data || []).filter(order => {
        const status = (order.order_status || '').toLowerCase();
        return status === 'delivered' || status === 'cancelled' || status === 'canceled';
      });

      setOrders(historicalOrders);
    } catch (err) {
      console.error('Error fetching history:', err);
      setError(err.message || 'Failed to fetch order history');
      toast.error('Failed to load order history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const formatDateTime = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      return d.toLocaleString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: true
      });
    } catch {
      return dateStr;
    }
  };

  const getTotalItems = (order) => {
    return (order.orderitems || []).reduce((sum, item) => sum + (item.quantity || 0), 0);
  };

  const filteredOrders = orders.filter(order => {
    // 1. Search
    const search = searchTerm.trim().toLowerCase();
    const matchesSearch = 
      String(order.id).toLowerCase().includes(search) ||
      (order.customer_name || '').toLowerCase().includes(search) ||
      (order.phone || '').toLowerCase().includes(search);

    if (!matchesSearch) return false;

    // 2. Status Filter
    const orderStatus = order.order_status || '';
    if (filters.status.length > 0) {
      const isCancelled = orderStatus.toLowerCase() === 'cancelled' || orderStatus.toLowerCase() === 'canceled';
      const isDelivered = orderStatus.toLowerCase() === 'delivered';
      
      const matchesStatus = filters.status.some(status => {
        if (status === 'Cancelled' && isCancelled) return true;
        if (status === 'Delivered' && isDelivered) return true;
        return false;
      });
      if (!matchesStatus) return false;
    }

    // 3. Date Filter (using updated_at as proxy for completion date)
    const completionDate = order.updated_at ? new Date(order.updated_at) : new Date(order.created_at);
    const now = new Date();
    
    if (filters.dateRange.length > 0) {
      const matchesDate = filters.dateRange.some(range => {
        if (range === 'Today') {
          return completionDate.toDateString() === now.toDateString();
        }
        if (range === 'This Week') {
          const firstDayOfWeek = new Date(now.setDate(now.getDate() - now.getDay())); // Sunday
          firstDayOfWeek.setHours(0,0,0,0);
          return completionDate >= firstDayOfWeek;
        }
        if (range === 'This Month') {
          return completionDate.getMonth() === new Date().getMonth() &&
                 completionDate.getFullYear() === new Date().getFullYear();
        }
        return true;
      });
      if (!matchesDate) return false;
    }

    return true;
  });

  const toggleStatusFilter = (status) => {
    setFilters(prev => {
      const updated = prev.status.includes(status)
        ? prev.status.filter(s => s !== status)
        : [...prev.status, status];
      return { ...prev, status: updated };
    });
  };

  const toggleDateFilter = (range) => {
    setFilters(prev => {
      const updated = prev.dateRange.includes(range)
        ? prev.dateRange.filter(r => r !== range)
        : [...prev.dateRange, range];
      return { ...prev, dateRange: updated };
    });
  };

  const clearAllFilters = () => {
    setFilters({ status: [], dateRange: [] });
    setSearchTerm('');
  };

  return (
    <div className="orders-page-container">
      {/* Search and Filters Header */}
      <section className="orders-controls">
        <div className="search-box-wrapper">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search history by Order ID, Customer Name, Phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filters-row">
          <div className="filter-group">
            <span className="filter-group-label"><FaFilter /> Status:</span>
            {['Delivered', 'Cancelled'].map(status => {
              const isActive = filters.status.includes(status);
              return (
                <button
                  key={status}
                  onClick={() => toggleStatusFilter(status)}
                  className={`filter-btn ${isActive ? 'active' : ''}`}
                >
                  {status}
                </button>
              );
            })}
          </div>

          <div className="filter-group">
            <span className="filter-group-label">Date:</span>
            {['Today', 'This Week', 'This Month'].map(range => {
              const isActive = filters.dateRange.includes(range);
              return (
                <button
                  key={range}
                  onClick={() => toggleDateFilter(range)}
                  className={`filter-btn ${isActive ? 'active' : ''}`}
                >
                  {range}
                </button>
              );
            })}
          </div>

          {(filters.status.length > 0 || filters.dateRange.length > 0 || searchTerm) && (
            <button className="clear-filters-btn" onClick={clearAllFilters}>
              Clear All
            </button>
          )}
        </div>
      </section>

      {/* Main Content Area */}
      {loading ? (
        <div className="orders-skeleton-wrapper">
          {[1, 2, 3].map(i => (
            <div key={i} className="skeleton-card">
              <div className="skeleton-row">
                <div className="skeleton-block id"></div>
                <div className="skeleton-block badge"></div>
              </div>
              <div className="skeleton-block text-long"></div>
              <div className="skeleton-block text-medium"></div>
              <div className="skeleton-row">
                <div className="skeleton-block price"></div>
                <div className="skeleton-block action"></div>
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="orders-error-state">
          <FaRegTimesCircle className="error-icon" />
          <h3>Error Loading History</h3>
          <p>{error}</p>
          <button className="retry-btn" onClick={loadHistory}>
            <FaSync /> Retry
          </button>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="orders-empty-state">
          <div className="empty-icon">📁</div>
          <h3>No Order History Found</h3>
          <p>
            {filters.status.length > 0 || filters.dateRange.length > 0 || searchTerm
              ? 'No historical orders match your search and filter criteria.'
              : 'There are no delivered or cancelled orders in the system yet.'}
          </p>
          {(filters.status.length > 0 || filters.dateRange.length > 0 || searchTerm) && (
            <button className="clear-filters-btn outline" onClick={clearAllFilters}>
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="desktop-orders-table-wrapper">
            <table className="desktop-orders-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer Name</th>
                  <th>Phone Number</th>
                  <th>Order Date</th>
                  <th>Completion Date</th>
                  <th>Payment</th>
                  <th>Amount</th>
                  <th>Final Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map(order => {
                  const isPaid = (order.payment_status || '').toLowerCase() === 'paid';
                  const statusClass = (order.order_status || '').toLowerCase() === 'delivered' ? 'delivered' : 'cancelled';
                  
                  return (
                    <tr key={order.id} onClick={() => setSelectedOrder(order)} className="table-row-clickable">
                      <td><strong>#{order.id}</strong></td>
                      <td>{order.customer_name || 'N/A'}</td>
                      <td>{order.phone || 'N/A'}</td>
                      <td className="datetime-cell">{formatDateTime(order.created_at)}</td>
                      <td className="datetime-cell">{formatDateTime(order.updated_at || order.created_at)}</td>
                      <td>
                        <span className={`payment-badge ${isPaid ? 'paid' : 'unpaid'}`}>
                          {isPaid ? 'Paid' : 'Unpaid'}
                        </span>
                      </td>
                      <td><strong>₹{Number(order.total_amount || 0).toLocaleString('en-IN')}</strong></td>
                      <td>
                        <span className={`status-badge ${statusClass}`}>
                          {order.order_status || 'Unknown'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card Grid View */}
          <div className="mobile-orders-cards">
            {filteredOrders.map(order => {
              const isPaid = (order.payment_status || '').toLowerCase() === 'paid';
              const statusClass = (order.order_status || '').toLowerCase() === 'delivered' ? 'delivered' : 'cancelled';

              return (
                <div key={order.id} className="mobile-order-card" onClick={() => setSelectedOrder(order)}>
                  <div className="card-header">
                    <span className="order-id">Order <strong>#{order.id}</strong></span>
                    <span className={`status-badge ${statusClass}`}>
                      {order.order_status || 'Unknown'}
                    </span>
                  </div>

                  <div className="card-body">
                    <div className="info-row">
                      <span className="label">Customer:</span>
                      <span className="value">{order.customer_name || 'N/A'}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">Phone:</span>
                      <span className="value">{order.phone || 'N/A'}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">Order Date:</span>
                      <span className="value">{formatDateTime(order.created_at)}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">Completion Date:</span>
                      <span className="value">{formatDateTime(order.updated_at || order.created_at)}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">Payment:</span>
                      <span className="value">
                        <span className={`payment-badge ${isPaid ? 'paid' : 'unpaid'}`}>
                          {isPaid ? 'Paid' : 'Unpaid'}
                        </span>
                      </span>
                    </div>
                    <div className="info-row">
                      <span className="label">Grand Total:</span>
                      <span className="value total-price">₹{Number(order.total_amount || 0).toLocaleString('en-IN')} ({getTotalItems(order)} Items)</span>
                    </div>
                  </div>

                  <div className="card-footer" onClick={(e) => e.stopPropagation()}>
                    <button className="view-details-action-btn" onClick={() => setSelectedOrder(order)} style={{ width: '100%' }}>
                      View Details (Read-only)
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* View History Detail Modal (Read Only) */}
      {selectedOrder && (
        <div className="admin-modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="admin-modal-content" onClick={(e) => e.stopPropagation()}>
            <header className="modal-header">
              <h2>Historical Order #{selectedOrder.id}</h2>
              <button className="modal-close" onClick={() => setSelectedOrder(null)} aria-label="Close modal">
                <FaRegTimesCircle />
              </button>
            </header>

            <div className="modal-body">
              {/* Customer Info Card */}
              <div className="modal-section-card">
                <h3>Customer Information</h3>
                <div className="info-grid">
                  <div className="info-cell">
                    <span className="cell-label">Name</span>
                    <span className="cell-val">{selectedOrder.customer_name || 'N/A'}</span>
                  </div>
                  <div className="info-cell">
                    <span className="cell-label">Phone</span>
                    <span className="cell-val">{selectedOrder.phone || 'N/A'}</span>
                  </div>
                  {selectedOrder.delivery_notes && (
                    <div className="info-cell full-width">
                      <span className="cell-label">Delivery Notes</span>
                      <span className="cell-val notes">{selectedOrder.delivery_notes}</span>
                    </div>
                  )}
                  <div className="action-buttons-row">
                    <a href={`tel:${selectedOrder.phone}`} className="action-btn-link tel">
                      <FaPhoneAlt /> Call Customer
                    </a>
                    {selectedOrder.location_link ? (
                      <a
                        href={selectedOrder.location_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="action-btn-link map"
                      >
                        <FaMapMarkerAlt /> Open Google Maps
                      </a>
                    ) : (
                      <button disabled className="action-btn-link map disabled">
                        <FaMapMarkerAlt /> Maps Link N/A
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Order Info Card */}
              <div className="modal-section-card">
                <h3>Order Info</h3>
                <div className="info-grid">
                  <div className="info-cell">
                    <span className="cell-label">Date Placed</span>
                    <span className="cell-val">{formatDateTime(selectedOrder.created_at)}</span>
                  </div>
                  <div className="info-cell">
                    <span className="cell-label">Payment Method</span>
                    <span className="cell-val">{selectedOrder.payment_method === 'COD' ? 'Cash on Delivery' : 'Online Payment'}</span>
                  </div>
                  <div className="info-cell">
                    <span className="cell-label">Payment Status</span>
                    <span className="cell-val">
                      <span className={`payment-badge ${selectedOrder.payment_status?.toLowerCase() === 'paid' ? 'paid' : 'unpaid'}`}>
                        {selectedOrder.payment_status || 'Pending'}
                      </span>
                    </span>
                  </div>
                  <div className="info-cell">
                    <span className="cell-label">Final Status</span>
                    <span className="cell-val">
                      <span className={`status-badge ${(selectedOrder.order_status || 'Unknown').toLowerCase() === 'delivered' ? 'delivered' : 'cancelled'}`}>
                        {selectedOrder.order_status || 'Unknown'}
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Order Products List */}
              <div className="modal-section-card">
                <h3>Products</h3>
                <div className="order-products-list">
                  {selectedOrder.orderitems && selectedOrder.orderitems.length > 0 ? (
                    selectedOrder.orderitems.map((item, idx) => (
                      <div key={idx} className="product-item-row">
                        <div className="prod-img-wrapper">
                          {item.product_image ? (
                            <img src={item.product_image} alt={item.product_name} />
                          ) : (
                            <div className="prod-no-image">📦</div>
                          )}
                        </div>
                        <div className="prod-details">
                          <h4 className="prod-name">{item.product_name || 'Unknown Product'}</h4>
                          {item.product_brand && <span className="prod-brand">Brand: {item.product_brand}</span>}
                          {item.product_weight && <span className="prod-weight">Weight: {item.product_weight}</span>}
                        </div>
                        <div className="prod-pricing">
                          <span className="price-calc">
                            ₹{Number(item.price_at_purchase || item.price || 0).toLocaleString('en-IN')} x {item.quantity}
                          </span>
                          <strong className="subtotal">
                            ₹{Number(item.subtotal || (item.price * item.quantity) || 0).toLocaleString('en-IN')}
                          </strong>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="no-products-msg"><FaInfoCircle /> No products listed for this order.</p>
                  )}
                </div>
              </div>

              {/* Order Summary Calculations */}
              <div className="modal-section-card summary-card">
                <div className="summary-row">
                  <span>Subtotal</span>
                  <span>₹{Number(selectedOrder.subtotal || 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="summary-row">
                  <span>Delivery Charge</span>
                  <span>₹{Number(selectedOrder.delivery_charge || 0).toLocaleString('en-IN')}</span>
                </div>
                {selectedOrder.packaging_charge > 0 && (
                  <div className="summary-row">
                    <span>Packaging Charge</span>
                    <span>₹{Number(selectedOrder.packaging_charge || 0).toLocaleString('en-IN')}</span>
                  </div>
                )}
                {selectedOrder.discount > 0 && (
                  <div className="summary-row discount">
                    <span>Discount</span>
                    <span>-₹{Number(selectedOrder.discount || 0).toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="summary-row grand-total">
                  <strong>Grand Total</strong>
                  <strong>₹{Number(selectedOrder.total_amount || 0).toLocaleString('en-IN')}</strong>
                </div>
              </div>
            </div>

            <footer className="modal-footer">
              <button className="close-btn" onClick={() => setSelectedOrder(null)}>
                Close
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
