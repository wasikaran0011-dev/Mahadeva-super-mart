import { useState, useEffect, useMemo } from 'react';
import './OrderDetails.css';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Header from '../../Components/Header/Header.jsx';
import Navbar from '../../Components/Navbar/Navbar.jsx';
import Footer from '../../Components/Footer/Footer.jsx';
import { supabase } from '../../Services/supabase.js';
import { getOrderDetails } from '../../Services/orderServices.js';
import { formatDate, formatRupee, getStatusClass, getStatusLabel, getPaymentStatusLabel, getPaymentMethodLabel } from '../../Utils/orderUtils.js';
import { useStoreSettings } from '../../Context/StoreSettingsContext.jsx';
import OrderTracking from '../../Components/OrderTracking/OrderTracking.jsx';

const OrderDetails = () => {

    const { orderId } = useParams();
    const navigate = useNavigate();
    const [ order, setOrder ] = useState(null);
    const [ loading, setLoading ] = useState(true);
    const [ notFound, setNotFound ] = useState(false);
    const { settings } = useStoreSettings();

    useEffect(() => {
        const loadOrder = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) {
                    navigate('/');
                    return;
                }
                const data = await getOrderDetails(orderId, user.id);
                if (!data) {
                    setNotFound(true);
                } else {
                    setOrder(data);
                }
            } catch (error) {
                console.error('Failed to fetch order details:', error);
                setNotFound(true);
            } finally {
                setLoading(false);
            }
        };
        loadOrder();
    }, [orderId, navigate]);

    // Priority 8 — Invoice Handling architecture
    const handleDownloadInvoice = () => {
        // In the future, this can be replaced with PDF generation logic
        window.print();
    };

    const items = useMemo(() => order?.orderitems || [], [order]);
    
    // Fallbacks for older orders that might not have these fields populated
    const oldSubtotal = useMemo(() => items.reduce((acc, item) => acc + ((item.price_at_purchase || item.price || 0) * (item.quantity || 1)), 0), [items]);

    const statusValue = order?.order_status || 'Placed';
    const statusClass = getStatusClass(statusValue);
    
    // Priority 1 — Database Correctness: Read directly from order record
    const subtotal = oldSubtotal;
    const deliveryCharge = 0;
    const packagingCharge = 0;
    const totalAmount = order?.total_amount ?? subtotal;
    const discount = Math.max(0, subtotal - totalAmount);
    const estimatedDelivery = "Within 30 Minutes";
    
    const paymentMethod = order?.payment_method || 'Unknown';
    // Priority 5 — Payment Status: Read from database
    const paymentStatus = order?.payment_status || (paymentMethod.toLowerCase() === 'cod' ? 'Pending' : 'Paid');

    /* ── LOADING SKELETON ─────────────────────────────────── */
    if (loading) {
        return (
            <>
                <Header />
                <Navbar />
                <main className="od-page">
                    <div className="od-breadcrumb od-skeleton-line" style={{ width: '220px', height: '14px' }}></div>
                    <div className="od-layout">
                        <div className="od-col-left">
                            <div className="od-card od-skeleton-card">
                                <div className="od-skeleton-line" style={{ width: '55%', height: '20px' }}></div>
                                <div className="od-skeleton-line" style={{ width: '35%', height: '14px', marginTop: '10px' }}></div>
                                <div className="od-skeleton-line" style={{ width: '45%', height: '14px', marginTop: '8px' }}></div>
                            </div>
                            <div className="od-card od-skeleton-card" style={{ marginTop: '20px' }}>
                                <div className="od-skeleton-line" style={{ width: '40%', height: '16px' }}></div>
                                <div className="od-skeleton-line" style={{ width: '60%', height: '13px', marginTop: '12px' }}></div>
                                <div className="od-skeleton-line" style={{ width: '50%', height: '13px', marginTop: '8px' }}></div>
                            </div>
                        </div>
                        <div className="od-col-right">
                            <div className="od-card od-skeleton-card">
                                <div className="od-skeleton-line" style={{ width: '50%', height: '16px' }}></div>
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="od-product-skeleton-row">
                                        <div className="od-skeleton-img"></div>
                                        <div className="od-skeleton-text-block">
                                            <div className="od-skeleton-line" style={{ width: '70%', height: '14px' }}></div>
                                            <div className="od-skeleton-line" style={{ width: '40%', height: '12px', marginTop: '8px' }}></div>
                                        </div>
                                        <div className="od-skeleton-line" style={{ width: '60px', height: '14px', flexShrink: 0 }}></div>
                                    </div>
                                ))}
                            </div>
                            <div className="od-card od-skeleton-card" style={{ marginTop: '20px' }}>
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="od-skeleton-summary-row">
                                        <div className="od-skeleton-line" style={{ width: '40%', height: '13px' }}></div>
                                        <div className="od-skeleton-line" style={{ width: '25%', height: '13px' }}></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </main>
                <Footer />
            </>
        );
    }

    /* ── NOT FOUND ────────────────────────────────────────── */
    if (notFound || !order) {
        return (
            <>
                <Header />
                <Navbar />
                <main className="od-page">
                    <div className="od-not-found">
                        <div className="od-not-found-icon">📦</div>
                        <h2>Order Not Found</h2>
                        <p>This order doesn't exist or you don't have permission to view it.</p>
                        <button className="od-btn-primary" onClick={() => navigate('/Home')} aria-label="Continue Shopping">
                            Continue Shopping
                        </button>
                    </div>
                </main>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Header />
            <Navbar />
            <main className="od-page">

                {/* ── BREADCRUMB ─────────────────────────────── */}
                <nav className="od-breadcrumb" aria-label="Breadcrumb">
                    <Link to="/Home" className="od-breadcrumb-link">Home</Link>
                    <span className="od-breadcrumb-sep">›</span>
                    <Link to="/my-orders" className="od-breadcrumb-link">My Orders</Link>
                    <span className="od-breadcrumb-sep">›</span>
                    <span className="od-breadcrumb-current" aria-current="page">Order #{order.id}</span>
                </nav>

                <div className="od-layout">

                    {/* ══ LEFT COLUMN ════════════════════════════ */}
                    <div className="od-col-left">

                        {/* ── ORDER INFO CARD ──────────────────── */}
                        <section className="od-card od-info-card">
                            <div className="od-info-header">
                                <div>
                                    <h1 className="od-order-id">Order #{order.id}</h1>
                                    <p className="od-order-date">
                                        Placed on {formatDate(order.created_at)}
                                    </p>
                                </div>
                                <span className={`od-status-badge ${statusClass}`} aria-label={`Order Status: ${getStatusLabel(statusValue)}`}>
                                    {statusClass === 'delivered' && <span className="od-status-dot"></span>}
                                    {getStatusLabel(statusValue)}
                                </span>
                            </div>

                            <div className="od-info-divider"></div>

                            <div className="od-info-meta">
                                <div className="od-info-meta-item">
                                    <span className="od-meta-label">Payment Method</span>
                                    <span className="od-meta-value">
                                        {getPaymentMethodLabel(paymentMethod)}
                                    </span>
                                </div>
                                <div className="od-info-meta-item">
                                    <span className="od-meta-label">Total Amount</span>
                                    <span className="od-meta-value od-meta-total">
                                        {formatRupee(totalAmount)}
                                    </span>
                                </div>
                                <div className="od-info-meta-item">
                                    <span className="od-meta-label">Estimated Delivery</span>
                                    <span className="od-meta-value">{estimatedDelivery}</span>
                                </div>
                            </div>

                            <div className="od-info-actions">
                                <button
                                    className="od-btn-invoice"
                                    onClick={handleDownloadInvoice}
                                    title="Print / Save Invoice"
                                    aria-label="Print / Save Invoice"
                                >
                                    ⬇ Print / Save Invoice
                                </button>
                            </div>
                        </section>

                        {/* ── DELIVERY ADDRESS CARD ────────────── */}
                        <section className="od-card">
                            <h2 className="od-card-title">
                                <span className="od-card-title-icon" aria-hidden="true">📍</span>
                                Delivery Address
                            </h2>
                            <div className="od-address-body">
                                <p className="od-address-name">{order.customer_name || 'Customer Name Unavailable'}</p>
                                <p className="od-address-phone">{order.phone || 'Phone Unavailable'}</p>
                                {order.location_link ? (
                                    <a
                                        href={order.location_link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="od-location-link"
                                        aria-label="View delivery location on Google Maps"
                                    >
                                        📌 View on Google Maps
                                    </a>
                                ) : null}
                                <p className="od-delivery-notes">
                                    {order.delivery_notes && order.delivery_notes.trim()
                                        ? order.delivery_notes
                                        : 'No delivery instructions.'}
                                </p>
                            </div>
                        </section>

                        {/* ── NEED HELP CARD ───────────────────── */}
                        <section className="od-card od-help-card">
                            <h2 className="od-card-title">Need Help?</h2>
                            <p className="od-help-text">
                                Need help regarding this order? We're here to assist you.
                            </p>
                            <div className="od-help-actions">
                                <a href={`mailto:${settings.email || 'mahadevasupermartstore2@gmail.com'}`} className="od-btn-help" aria-label="Contact Support via Email">
                                    ✉ Contact Support
                                </a>
                                <a href={`tel:${settings.phone || '+918686969980'}`} className="od-btn-help od-btn-help-outline" aria-label="Call Store Support">
                                    📞 Call Store
                                </a>
                            </div>
                        </section>

                    </div>

                    {/* ══ RIGHT COLUMN ═══════════════════════════ */}
                    <div className="od-col-right">

                        {/* ── PRODUCTS CARD ────────────────────── */}
                        <section className="od-card">
                            <h2 className="od-card-title">
                                <span className="od-card-title-icon" aria-hidden="true">🛍</span>
                                Ordered Products
                                <span className="od-card-title-count">
                                    {items.length} {items.length === 1 ? 'item' : 'items'}
                                </span>
                            </h2>

                            <div className="od-products-header" aria-hidden="true">
                                <span>Product</span>
                                <span>Qty</span>
                                <span>Price</span>
                                <span>Subtotal</span>
                            </div>

                            <div className="od-products-list" role="list">
                                {items.length === 0 ? (
                                    <p style={{ textAlign: 'center', color: '#888', padding: '20px 0' }}>No products found for this order.</p>
                                ) : items.map((item) => {
                                    // Priority 2 — Order Items Snapshot: read details directly from the order item, fallback to relation if old order
                                    const productRelation = item.Products || {};
                                    const image = item.product_image || productRelation.image || null;
                                    const name = item.product_name || productRelation.title || 'Unknown Product';
                                    const brand = item.product_brand || productRelation.brand || '';
                                    const weight = item.product_weight || productRelation.weight || '';
                                    const productId = item.product_id;
                                    const price = item.price_at_purchase || item.price || 0;
                                    const quantity = item.quantity || 1;
                                    const itemSubtotal = item.subtotal || (price * quantity);

                                    // Priority 6 — Product Navigation: only navigate if product_id exists
                                    const handleNavigate = () => {
                                        if (productId) {
                                            navigate(`/product/${productId}`);
                                        }
                                    };

                                    return (
                                        <div
                                            key={item.id}
                                            className={`od-product-row ${productId ? 'clickable' : ''}`}
                                            onClick={handleNavigate}
                                            role={productId ? "button" : "listitem"}
                                            tabIndex={productId ? 0 : -1}
                                            onKeyDown={(e) => {
                                                if (productId && e.key === 'Enter') handleNavigate();
                                            }}
                                            title={productId ? `View ${name}` : name}
                                            aria-label={productId ? `View details for ${name}` : name}
                                            style={{ cursor: productId ? 'pointer' : 'default' }}
                                        >
                                            <div className="od-product-info">
                                                <div className="od-product-img-wrap">
                                                    {image ? (
                                                        <img
                                                            src={image}
                                                            alt={name}
                                                            className="od-product-img"
                                                            onError={(e) => {
                                                                e.target.onerror = null;
                                                                e.target.src = `https://placehold.co/80x80/f4f4f4/999?text=${encodeURIComponent(name.substring(0, 2))}`;
                                                            }}
                                                        />
                                                    ) : (
                                                        <div className="od-product-img-placeholder">
                                                            {name.substring(0, 2).toUpperCase()}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="od-product-details">
                                                    <p className="od-product-name">{name}</p>
                                                    {brand && (
                                                        <p className="od-product-brand">{brand}</p>
                                                    )}
                                                    {weight && (
                                                        <p className="od-product-weight">{weight}</p>
                                                    )}
                                                </div>
                                            </div>
                                            <span className="od-product-qty">×{quantity}</span>
                                            <span className="od-product-price">{formatRupee(price)}</span>
                                            <span className="od-product-subtotal">
                                                {formatRupee(itemSubtotal)}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>

                        {/* ── BILL SUMMARY CARD ────────────────── */}
                        <section className="od-card">
                            <h2 className="od-card-title">
                                <span className="od-card-title-icon" aria-hidden="true">🧾</span>
                                Bill Summary
                            </h2>

                            <div className="od-bill-row">
                                <span>Subtotal ({items.length} {items.length === 1 ? 'item' : 'items'})</span>
                                <span>{formatRupee(subtotal)}</span>
                            </div>
                            <div className="od-bill-row">
                                <span>Delivery Charges</span>
                                {deliveryCharge === 0 ? (
                                    <span className="od-bill-free">FREE</span>
                                ) : (
                                    <span>{formatRupee(deliveryCharge)}</span>
                                )}
                            </div>
                            <div className="od-bill-row">
                                <span>Packaging Charges</span>
                                <span>{formatRupee(packagingCharge)}</span>
                            </div>
                            {discount > 0 && (
                                <div className="od-bill-row" style={{ color: '#1e7e34' }}>
                                    <span>Discount</span>
                                    <span>-{formatRupee(discount)}</span>
                                </div>
                            )}
                            <div className="od-bill-divider"></div>
                            <div className="od-bill-row od-bill-total-row">
                                <span>Total Amount</span>
                                <span>{formatRupee(totalAmount)}</span>
                            </div>
                            <p className="od-bill-tax-note">(Inclusive of all taxes)</p>
                        </section>

                        {/* ── TRACKING CARD ────────────────────── */}
                        <section className="od-card">
                            <h2 className="od-card-title">
                                <span className="od-card-title-icon" aria-hidden="true">🚚</span>
                                Order Tracking
                            </h2>
                            <OrderTracking status={statusValue} />
                        </section>

                        {/* ── PAYMENT INFO CARD ────────────────── */}
                        <section className="od-card">
                            <h2 className="od-card-title">
                                <span className="od-card-title-icon" aria-hidden="true">💳</span>
                                Payment Information
                            </h2>
                            <div className="od-payment-body">
                                <div className="od-payment-row">
                                    <span className="od-payment-label">Payment Method</span>
                                    <span className="od-payment-value">
                                        {getPaymentMethodLabel(paymentMethod)}
                                    </span>
                                </div>
                                <div className="od-payment-row">
                                    <span className="od-payment-label">Payment Status</span>
                                    <span className={`od-payment-status ${paymentStatus.toLowerCase()}`}>
                                        {getPaymentStatusLabel(paymentStatus)}
                                    </span>
                                </div>
                                <div className="od-payment-row">
                                    <span className="od-payment-label">Transaction Status</span>
                                    <span className="od-payment-value">
                                        {paymentStatus.toLowerCase() === 'pending'
                                            ? 'Awaiting Collection'
                                            : 'Completed'}
                                    </span>
                                </div>
                            </div>
                        </section>

                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
};

export default OrderDetails;
