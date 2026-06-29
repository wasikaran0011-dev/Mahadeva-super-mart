import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../Services/supabase.js';
import { getOrderById } from '../../Services/orderServices.js';
import Header from '../../Components/Header/Header.jsx';
import Navbar from '../../Components/Navbar/Navbar.jsx';
import Footer from '../../Components/Footer/Footer.jsx';
import OrderTracking from '../../Components/OrderTracking/OrderTracking.jsx';
import { formatRupee, getPaymentMethodLabel } from '../../Utils/orderUtils.js';
import { FaCheckCircle, FaShoppingBag, FaArrowRight } from 'react-icons/fa';
import './OrderSuccess.css';

const OrderSuccess = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) {
                    navigate('/login');
                    return;
                }

                const data = await getOrderById(orderId);
                if (data && data.user_id === user.id) {
                    setOrder(data);
                } else {
                    setError(true);
                }
            } catch (err) {
                console.error("Error fetching order:", err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [orderId, navigate]);

    if (loading) {
        return (
            <>
                <Header />
                <Navbar />
                <div className="os-loading">
                    <div className="os-spinner"></div>
                    <p>Loading your order details...</p>
                </div>
                <Footer />
            </>
        );
    }

    if (error || !order) {
        return (
            <>
                <Header />
                <Navbar />
                <div className="os-error">
                    <h2>Order Not Found</h2>
                    <p>We couldn't find the order you are looking for.</p>
                    <button className="btn-primary" onClick={() => navigate('/')}>
                        Go to Home
                    </button>
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Header />
            <Navbar />
            <main className="os-page">
                <div className="os-container">
                    <div className="os-card">
                        <div className="os-icon-container">
                            <FaCheckCircle className="os-success-icon" />
                        </div>
                        
                        <h1 className="os-title">Order Placed Successfully!</h1>
                        <p className="os-subtitle">Thank you for shopping with us. Your order has been received.</p>
                        
                        <div className="os-details-box">
                            <div className="os-detail-row">
                                <span className="os-label">Order ID:</span>
                                <span className="os-value">#{order.id}</span>
                            </div>
                            <div className="os-detail-row">
                                <span className="os-label">Customer Name:</span>
                                <span className="os-value">{order.customer_name}</span>
                            </div>
                            <div className="os-detail-row">
                                <span className="os-label">Payment Method:</span>
                                <span className="os-value">{getPaymentMethodLabel(order.payment_method)}</span>
                            </div>
                            <div className="os-detail-row">
                                <span className="os-label">Total Amount:</span>
                                <span className="os-value os-highlight">{formatRupee(order.total_amount)}</span>
                            </div>
                            <div className="os-detail-row">
                                <span className="os-label">Estimated Delivery:</span>
                                <span className="os-value os-highlight-green">Within 30 Minutes</span>
                            </div>
                        </div>

                        <div className="os-tracking-section">
                            <h3>Order Status</h3>
                            <OrderTracking status={order.order_status} />
                        </div>

                        <div className="os-actions">
                            <button className="btn-primary os-btn" onClick={() => navigate(`/order/${order.id}`)}>
                                <FaShoppingBag /> View Order
                            </button>
                            <button className="btn-outline os-btn" onClick={() => navigate('/Home')}>
                                Continue Shopping <FaArrowRight />
                            </button>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
};

export default OrderSuccess;
