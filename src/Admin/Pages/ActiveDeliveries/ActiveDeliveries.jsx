import { useState, useEffect } from 'react';
import { supabase } from '../../../Services/supabase.js';
import { 
  FaSearch, 
  FaPhoneAlt, 
  FaMapMarkerAlt, 
  FaRegTimesCircle, 
  FaCheck,
  FaSync, 
  FaInfoCircle,
  FaTimes
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import '../Orders/Orders.css';
import ConfirmationModal from '../../Components/ConfirmationModal/ConfirmationModal';

const ActiveDeliveries = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  // Confirmation Modal State
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState(null);

  const loadDeliveries = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all 'Out For Delivery' orders
      const { data, error: fetchErr } = await supabase
        .from('orders')
        .select('*, orderitems(*)')
        .ilike('order_status', 'Out For Delivery')
        .order('created_at', { ascending: false });

      if (fetchErr) throw fetchErr;

      setDeliveries(data || []);
    } catch (err) {
      console.error('Error fetching deliveries:', err);
      setError(err.message || 'Failed to fetch active deliveries');
      toast.error('Failed to load active deliveries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDeliveries();
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

  const filteredDeliveries = deliveries.filter(order => {
    const search = searchTerm.trim().toLowerCase();
    if (!search) return true;
    return (
      String(order.id).toLowerCase().includes(search) ||
      (order.customer_name || '').toLowerCase().includes(search) ||
      (order.phone || '').toLowerCase().includes(search)
    );
  });

  const handleStatusUpdate = async (order, newStatus, e) => {
    if (e) e.stopPropagation();

    if (newStatus === 'Cancelled') {
      setOrderToCancel(order);
      setIsCancelModalOpen(true);
      return;
    }
    
    await executeStatusUpdate(order.id, newStatus);
  };

  const executeStatusUpdate = async (orderId, newStatus) => {
    try {
      setUpdatingId(orderId);
      
      const { error: updateErr } = await supabase
        .from('orders')
        .update({ order_status: newStatus })
        .eq('id', orderId);

      if (updateErr) throw updateErr;

      toast.success(`Order #${orderId} marked as ${newStatus}`);
      
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(null);
      }

      await loadDeliveries();
    } catch (err) {
      console.error('Error updating status:', err);
      toast.error(`Failed to update order status to ${newStatus}`);
    } finally {
      setUpdatingId(null);
      setIsCancelModalOpen(false);
      setOrderToCancel(null);
    }
  };

  return (
    <div className="orders-page-container">
      {/* Search Header */}
      <section className="orders-controls">
        <div className="search-box-wrapper">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search active deliveries by Order ID, Customer Name, Phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
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
          <h3>Error Loading Deliveries</h3>
          <p>{error}</p>
          <button className="retry-btn" onClick={loadDeliveries}>
            <FaSync /> Retry
          </button>
        </div>
      ) : filteredDeliveries.length === 0 ? (
        <div className="orders-empty-state">
          <div className="empty-icon">🚚</div>
          <h3>No Active Deliveries</h3>
          <p>
            {searchTerm
              ? 'No deliveries match your search.'
              : 'There are no active deliveries at the moment.'}
          </p>
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
                  <th>Dispatch Time</th>
                  <th>Payment</th>
                  <th>Amount</th>
                  <th>Items</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDeliveries.map(order => {
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
                      <td onClick={(e) => e.stopPropagation()}>
                        <div className="table-actions">
                          <button className="view-details-action" onClick={() => setSelectedOrder(order)}>
                            Details
                          </button>
                          <button
                            disabled={updatingId === order.id}
                            onClick={(e) => handleStatusUpdate(order, 'Delivered', e)}
                            className="advance-status-action"
                            style={{ backgroundColor: '#10b981', borderColor: '#10b981' }}
                          >
                            <FaCheck /> Delivered
                          </button>
                          <button
                            disabled={updatingId === order.id}
                            onClick={(e) => handleStatusUpdate(order, 'Cancelled', e)}
                            className="advance-status-action"
                            style={{ backgroundColor: '#ef4444', borderColor: '#ef4444' }}
                          >
                            <FaTimes /> Cancel
                          </button>
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
            {filteredDeliveries.map(order => {
              const isPaid = (order.payment_status || '').toLowerCase() === 'paid';
              return (
                <div key={order.id} className="mobile-order-card" onClick={() => setSelectedOrder(order)}>
                  <div className="card-header">
                    <span className="order-id">Order <strong>#{order.id}</strong></span>
                    <span className="status-badge out-for-delivery">
                      {order.order_status || 'Out For Delivery'}
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
                      <span className="label">Dispatch:</span>
                      <span className="value">{formatDateTime(order.created_at)}</span>
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
                      <span className="label">Value:</span>
                      <span className="value total-price">₹{Number(order.total_amount || 0).toLocaleString('en-IN')} ({getTotalItems(order)} Items)</span>
                    </div>
                  </div>

                  <div className="card-footer" onClick={(e) => e.stopPropagation()} style={{ flexWrap: 'wrap', gap: '8px' }}>
                     {/* External Links */}
                    <a href={`tel:${order.phone}`} className="view-details-action-btn" style={{ textAlign: 'center', flex: '1 1 45%', textDecoration: 'none', display: 'inline-block' }}>
                      <FaPhoneAlt /> Call
                    </a>
                    {order.location_link ? (
                      <a href={order.location_link} target="_blank" rel="noopener noreferrer" className="view-details-action-btn" style={{ textAlign: 'center', flex: '1 1 45%', textDecoration: 'none', display: 'inline-block' }}>
                        <FaMapMarkerAlt /> Map
                      </a>
                    ) : (
                      <span className="view-details-action-btn" style={{ textAlign: 'center', flex: '1 1 45%', opacity: 0.5 }}>
                         <FaMapMarkerAlt /> N/A
                      </span>
                    )}
                    
                    {/* Status Actions */}
                    <button
                      disabled={updatingId === order.id}
                      onClick={(e) => handleStatusUpdate(order, 'Delivered', e)}
                      className="advance-status-action-btn"
                      style={{ backgroundColor: '#10b981', borderColor: '#10b981', flex: '1 1 45%', color: 'white' }}
                    >
                      <FaCheck /> Delivered
                    </button>
                    <button
                      disabled={updatingId === order.id}
                      onClick={(e) => handleStatusUpdate(order, 'Cancelled', e)}
                      className="advance-status-action-btn"
                      style={{ backgroundColor: '#ef4444', borderColor: '#ef4444', flex: '1 1 45%', color: 'white' }}
                    >
                      <FaTimes /> Cancel
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* View Delivery Detail Modal */}
      {selectedOrder && (
        <div className="admin-modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="admin-modal-content" onClick={(e) => e.stopPropagation()}>
            <header className="modal-header">
              <h2>Delivery Details #{selectedOrder.id}</h2>
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
              <button
                disabled={updatingId === selectedOrder.id}
                onClick={() => handleStatusUpdate(selectedOrder, 'Delivered')}
                className="modal-action-btn"
                style={{ backgroundColor: '#10b981', borderColor: '#10b981' }}
              >
                <FaCheck /> Mark Delivered
              </button>
            </footer>
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={isCancelModalOpen}
        title="Cancel Delivery"
        message={`Are you sure you want to cancel the delivery for Order #${orderToCancel?.id}? This action cannot be undone.`}
        confirmText="Cancel Delivery"
        cancelText="Keep Delivery"
        isDestructive={true}
        onConfirm={() => executeStatusUpdate(orderToCancel.id, 'Cancelled')}
        onCancel={() => {
          setIsCancelModalOpen(false);
          setOrderToCancel(null);
        }}
      />
    </div>
  );
};

export default ActiveDeliveries;
