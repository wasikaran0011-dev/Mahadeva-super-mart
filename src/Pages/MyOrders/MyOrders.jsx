import { useState, useEffect } from 'react';
import './MyOrders.css';
import Header from '../../Components/Header/Header.jsx';
import Navbar from '../../Components/Navbar/Navbar.jsx';
import Footer from '../../Components/Footer/Footer.jsx';
import { supabase } from '../../Services/supabase.js';
import { getUserOrders } from '../../Services/orderServices.js';
import { useNavigate } from 'react-router-dom';
import { formatDate, getStatusClass, getStatusLabel } from '../../Utils/orderUtils.js';
const MyOrders = () => {

    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const loadOrders = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;
                const data = await getUserOrders(user.id);
                setOrders(data || []);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        loadOrders();
    }, []);



    const getItemsPreview = (items = []) => {
        if (items.length === 0) {
            return 'No Products';
        }

        if (items.length <= 3) {
            return items.map(item => item.product_name).join(', ');
        }

        const firstThree = items
            .slice(0, 3)
            .map(item => item.product_name)
            .join(', ');

        return `${firstThree} +${items.length - 3} more`;
    };

    const getItemCount = (items = []) => {
        return items.reduce(
            (total, item) => total + item.quantity, 0
        );
    };

    const filterProducts = orders.filter((order) => {
        const search = searchTerm.trim().toLowerCase();
        const items = order.orderitems || [];
        const productNames = items
            .map(item => item.product_name || '')
            .join(' ')
            .toLowerCase();

        // Exact Order ID match
        if (!isNaN(search) && search !== '') {
            return String(order.id) === search;
        }

        const customerName = (order.customer_name || '').toLowerCase();
        const paymentMethod = (order.payment_method || '').toLowerCase();
        const dateStr = (order.created_at ? formatDate(order.created_at) : '').toLowerCase();

        return (
            customerName.includes(search) ||
            paymentMethod.includes(search) ||
            productNames.includes(search) ||
            dateStr.includes(search)
        );
    });

    return (
        <>
            <Header />
            <Navbar />
            <main className="my-orders-page">
                <section className="orders-header">
                    <div className="orders-heading">
                        <h1>My Orders</h1>
                        <p>Track, manage and review your purchases</p>
                        <span className="order-count">
                            {filterProducts.length} {filterProducts.length === 1 ? 'Order' : 'Orders'} found
                        </span>
                    </div>

                    <div className="orders-search">
                        <input
                            type="search"
                            placeholder="Search by order ID, product, date…"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            disabled={loading}
                            autoComplete="off"
                        />
                    </div>
                </section>

                <section className="orders-container">
                    {
                        loading ? (
                            <div className="orders-loading">
                                {[1, 2, 3].map((item) => (
                                    <div className="order-skeleton" key={item}>
                                        <div className="skeleton-row">
                                            <div className="skeleton-line skeleton-title"></div>
                                            <div className="skeleton-line skeleton-badge"></div>
                                        </div>
                                        <div className="skeleton-line skeleton-subtitle"></div>
                                        <div className="skeleton-line skeleton-body"></div>
                                        <div className="skeleton-divider"></div>
                                        <div className="skeleton-row">
                                            <div className="skeleton-line skeleton-status"></div>
                                            <div className="skeleton-line skeleton-btn"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : filterProducts.length === 0 ? (
                            <div className="orders-empty">
                                <div className="orders-empty-icon">📦</div>
                                <h2>No Orders Found</h2>
                                <p>
                                    {searchTerm
                                        ? 'No orders match your search. Try a different keyword.'
                                        : "Looks like you haven't placed any orders yet. Start shopping and your orders will appear here."}
                                </p>
                                <button
                                    className="shop-now-btn"
                                    onClick={() => navigate('/Home')}
                                >
                                    Continue Shopping
                                </button>
                            </div>
                        ) : (
                            filterProducts.map((order) => {
                                const statusValue = order.order_status || 'Placed';
                                const statusClass = getStatusClass(statusValue);
                                const statusLabel = getStatusLabel(statusValue);
                                
                                return (
                                <article className="order-summary-card" key={order.id} tabIndex={0}>
                                    <div className="order-summary-top">
                                        <div className="order-top-info">
                                            <h3>Order #{order.id}</h3>
                                            <p>{formatDate(order.created_at)}</p>
                                        </div>
                                        <span className={`order-status ${statusClass}`}>
                                            {statusClass === 'delivered' && <span className="status-dot"></span>}
                                            {statusLabel}
                                        </span>
                                    </div>

                                    <div className="order-summary-middle">
                                        <div className="order-meta">
                                            <span className="item-count">
                                                {getItemCount(order.orderitems)} {getItemCount(order.orderitems) === 1 ? 'Item' : 'Items'}
                                            </span>
                                            <span className="meta-separator">·</span>
                                            <span className="payment-method">{order.payment_method}</span>
                                        </div>
                                        <p className="items-preview">{getItemsPreview(order.orderitems)}</p>
                                    </div>

                                    <div className="order-summary-bottom">
                                        {order.total_amount !== undefined && order.total_amount !== null ? (
                                            <span className="order-total">
                                                ₹{Number(order.total_amount).toLocaleString('en-IN')}
                                            </span>
                                        ) : (
                                            <span></span>
                                        )}
                                        <button
                                            className="view-order-btn"
                                            onClick={() => navigate(`/order/${order.id}`)}
                                        >
                                            View Details →
                                        </button>
                                    </div>
                                </article>
                            )})
                        )
                    }
                </section>
            </main>
            <Footer />
        </>
    );
};

export default MyOrders;
