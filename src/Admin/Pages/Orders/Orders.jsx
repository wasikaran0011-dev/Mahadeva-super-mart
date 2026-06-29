import { useState, useEffect } from 'react';
import { supabase } from '../../../Services/supabase.js';
import { 
  FaSearch, 
  FaFilter, 
  FaPhoneAlt, 
  FaMapMarkerAlt, 
  FaRegTimesCircle, 
  FaCheck, 
  FaArrowRight, 
  FaSync, 
  FaInfoCircle 
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import './Orders.css';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  // Combined Filters State
  const [filters, setFilters] = useState({
    status: [], // 'Placed', 'Out for Delivery'
    payment: [] // 'Paid', 'Unpaid'
  });

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all orders
      const { data, error: fetchErr } = await supabase
        .from('orders')
        .select('*, orderitems(*)')
        .order('created_at', { ascending: false });

      if (fetchErr) throw fetchErr;

      // Filter active orders only (exclude Delivered, Cancelled, Canceled)
      const activeOrders = (data || []).filter(order => {
        const status = (order.order_status || '').toLowerCase();
        return status !== 'delivered' && status !== 'cancelled' && status !== 'canceled';
      });

      setOrders(activeOrders);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err.message || 'Failed to fetch orders');
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Format Date & Time
  const formatDateTime = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      return d.toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return dateStr;
    }
  };

  // Get total items in order
  const getTotalItems = (order) => {
    return (order.orderitems || []).reduce((sum, item) => sum + (item.quantity || 0), 0);
  };

  // Handle Search and Filter logic
  const filteredOrders = orders.filter(order => {
    // 1. Search
    const search = searchTerm.trim().toLowerCase();
    const matchesSearch = 
      String(order.id).toLowerCase().includes(search) ||
      (order.customer_name || '').toLowerCase().includes(search) ||
      (order.phone || '').toLowerCase().includes(search);

    if (!matchesSearch) return false;

    // 2. Status Filter
    const orderStatus = order.order_status || 'Placed';
    if (filters.status.length > 0) {
      const matchesStatus = filters.status.some(
        status => orderStatus.toLowerCase() === status.toLowerCase()
      );
      if (!matchesStatus) return false;
    }

    // 3. Payment Filter
    const isPaid = (order.payment_status || '').toLowerCase() === 'paid';
    if (filters.payment.length > 0) {
      const matchesPayment = filters.payment.some(p => {
        if (p === 'Paid') return isPaid;
        if (p === 'Unpaid') return !isPaid;
        return true;
      });
      if (!matchesPayment) return false;
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

  const togglePaymentFilter = (payment) => {
    setFilters(prev => {
      const updated = prev.payment.includes(payment)
        ? prev.payment.filter(p => p !== payment)
        : [...prev.payment, payment];
      return { ...prev, payment: updated };
    });
  };

  const clearAllFilters = () => {
    setFilters({ status: [], payment: [] });
    setSearchTerm('');
  };

  // Status transitions
  const getNextStatus = (currentStatus) => {
    const status = (currentStatus || 'Placed').toLowerCase();
    switch (status) {
      case 'placed':
      case 'pending':
      case 'confirmed':
      case 'preparing':
      case 'ready':
        return 'Out for Delivery';
      case 'out for delivery': return 'Delivered';
      default: return null;
    }
  };

  const getTransitionButtonText = (currentStatus) => {
    const status = (currentStatus || 'Placed').toLowerCase();
    switch (status) {
      case 'placed':
      case 'pending':
      case 'confirmed':
      case 'preparing':
      case 'ready':
        return 'Mark Out for Delivery';
      case 'out for delivery': return 'Mark Delivered';
      default: return null;
    }
  };

  const handleStatusTransition = async (order, e) => {
    if (e) e.stopPropagation();
    const nextStatus = getNextStatus(order.order_status);
    if (!nextStatus) return;

    try {
      setUpdatingId(order.id);
      const { error: updateErr } = await supabase
        .from('orders')
        .update({ order_status: nextStatus })
        .eq('id', order.id);

      if (updateErr) throw updateErr;

      toast.success(`Order #${order.id} updated to ${nextStatus}`);
      
      // If modal is open, update selectedOrder details
      if (selectedOrder && selectedOrder.id === order.id) {
        setSelectedOrder(prev => ({
          ...prev,
          order_status: nextStatus
        }));
      }

      // Reload orders from Supabase (Strictly no local-only move)
      await loadOrders();
    } catch (err) {
      console.error('Error updating status:', err);
      toast.error('Failed to update order status');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="orders-page-container">
      {/* Search and Filters Header */}
      <section className="orders-controls">
        <div className="search-box-wrapper">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search by Order ID, Customer Name, Phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filters-row">
          <div className="filter-group">
            <span className="filter-group-label"><FaFilter /> Status:</span>
            {['Placed', 'Out for Delivery'].map(status => {
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
            <span className="filter-group-label">Payment:</span>
            {['Paid', 'Unpaid'].map(p => {
              const isActive = filters.payment.includes(p);
              return (
                <button
                  key={p}
                  onClick={() => togglePaymentFilter(p)}
                  className={`filter-btn ${isActive ? 'active' : ''}`}
                >
                  {p}
                </button>
              );
            })}
          </div>

          {(filters.status.length > 0 || filters.payment.length > 0 || searchTerm) && (
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
          <h3>Error Loading Orders</h3>
          <p>{error}</p>
          <button className="retry-btn" onClick={loadOrders}>
            <FaSync /> Retry
          </button>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="orders-empty-state">
          <div className="empty-icon">📥</div>
          <h3>No Active Orders Found</h3>
          <p>
            {filters.status.length > 0 || filters.payment.length > 0 || searchTerm
              ? 'No active orders match your search and filter criteria. Try adjusting them.'
              : 'There are no active orders in the system right now.'}
          </p>
          {(filters.status.length > 0 || filters.payment.length > 0 || searchTerm) && (
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
                  <th>Order Date & Time</th>
                  <th>Payment</th>
                  <th>Amount</th>
                  <th>Items</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map(order => {
                  const nextStatus = getNextStatus(order.order_status);
                  const isPaid = (order.payment_status || '').toLowerCase() === 'paid';
                  
                  return (
                    <tr key={order.id} onClick={() => setSelectedOrder(order)} className="table-row-clickable">
                      <td><strong>#{order.id}</strong></td>
                      <td>{order.customer_name || 'N/A'}</td>
                      <td>{order.phone || 'N/A'}</td>
                      <td className="datetime-cell">{formatDateTime(order.created_at)}</td>
                      <td>
                        <span className={`payment-badge ${isPaid ? 'paid' : 'unpaid'}`}>
                          {isPaid ? 'Paid' : 'Unpaid'}
                        </span>
                        <div className="payment-method-sub">
                          {order.payment_method === 'COD' ? 'COD' : 'Online'}
                        </div>
                      </td>
                      <td><strong>₹{Number(order.total_amount || 0).toLocaleString('en-IN')}</strong></td>
                      <td>{getTotalItems(order)}</td>
                      <td>
                        <span className={`status-badge ${(order.order_status || 'Placed').toLowerCase().replace(/\s+/g, '-')}`}>
                          {order.order_status || 'Placed'}
                        </span>
                      </td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <div className="table-actions">
                          <button className="view-details-action" onClick={() => setSelectedOrder(order)}>
                            Details
                          </button>
                          {nextStatus && (
                            <button
                              disabled={updatingId === order.id}
                              onClick={(e) => handleStatusTransition(order, e)}
                              className="advance-status-action"
                            >
                              {updatingId === order.id ? 'Updating...' : getTransitionButtonText(order.order_status)}
                            </button>
                          )}
                        </div>
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
              const nextStatus = getNextStatus(order.order_status);
              const isPaid = (order.payment_status || '').toLowerCase() === 'paid';

              return (
                <div key={order.id} className="mobile-order-card" onClick={() => setSelectedOrder(order)}>
                  <div className="card-header">
                    <span className="order-id">Order <strong>#{order.id}</strong></span>
                    <span className={`status-badge ${(order.order_status || 'Placed').toLowerCase().replace(/\s+/g, '-')}`}>
                      {order.order_status || 'Placed'}
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
                      <span className="label">Placed:</span>
                      <span className="value">{formatDateTime(order.created_at)}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">Payment:</span>
                      <span className="value">
                        <span className={`payment-badge ${isPaid ? 'paid' : 'unpaid'}`}>
                          {isPaid ? 'Paid' : 'Unpaid'}
                        </span>
                        <span className="method-label">({order.payment_method === 'COD' ? 'Cash' : 'Online'})</span>
                      </span>
                    </div>
                    <div className="info-row">
                      <span className="label">Grand Total:</span>
                      <span className="value total-price">₹{Number(order.total_amount || 0).toLocaleString('en-IN')} ({getTotalItems(order)} Items)</span>
                    </div>
                  </div>

                  <div className="card-footer" onClick={(e) => e.stopPropagation()}>
                    <button className="view-details-action-btn" onClick={() => setSelectedOrder(order)}>
                      Details
                    </button>
                    {nextStatus && (
                      <button
                        disabled={updatingId === order.id}
                        onClick={(e) => handleStatusTransition(order, e)}
                        className="advance-status-action-btn"
                      >
                        {updatingId === order.id ? 'Updating...' : getTransitionButtonText(order.order_status)}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* View Order Detail Modal */}
      {selectedOrder && (
        <div className="admin-modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="admin-modal-content" onClick={(e) => e.stopPropagation()}>
            <header className="modal-header">
              <h2>Order Details #{selectedOrder.id}</h2>
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
                    <span className="cell-label">Order Status</span>
                    <span className="cell-val">
                      <span className={`status-badge ${(selectedOrder.order_status || 'Placed').toLowerCase().replace(/\s+/g, '-')}`}>
                        {selectedOrder.order_status || 'Placed'}
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
              {(() => {
                const items = selectedOrder.orderitems || [];
                const computedSubtotal = items.reduce((sum, item) => sum + (item.subtotal || ((item.price_at_purchase || item.price || 0) * (item.quantity || 1))), 0);
                const computedTotal = selectedOrder.total_amount || computedSubtotal;
                const computedDiscount = Math.max(0, computedSubtotal - computedTotal);
                
                return (
                  <div className="modal-section-card summary-card">
                    <div className="summary-row">
                      <span>Subtotal</span>
                      <span>₹{Number(computedSubtotal).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="summary-row">
                      <span>Delivery Charge</span>
                      <span>FREE</span>
                    </div>
                    {computedDiscount > 0 && (
                      <div className="summary-row discount">
                        <span>Discount</span>
                        <span>-₹{Number(computedDiscount).toLocaleString('en-IN')}</span>
                      </div>
                    )}
                    <div className="summary-row grand-total">
                      <strong>Grand Total</strong>
                      <strong>₹{Number(computedTotal).toLocaleString('en-IN')}</strong>
                    </div>
                  </div>
                );
              })()}
            </div>

            <footer className="modal-footer">
              <button className="close-btn" onClick={() => setSelectedOrder(null)}>
                Close
              </button>
              {getNextStatus(selectedOrder.order_status) && (
                <button
                  disabled={updatingId === selectedOrder.id}
                  onClick={() => handleStatusTransition(selectedOrder)}
                  className="modal-action-btn"
                >
                  {updatingId === selectedOrder.id ? (
                    'Updating...'
                  ) : (
                    <>
                      <FaCheck /> {getTransitionButtonText(selectedOrder.order_status)} <FaArrowRight />
                    </>
                  )}
                </button>
              )}
            </footer>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
