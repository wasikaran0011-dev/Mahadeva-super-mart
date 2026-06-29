import React, { useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Cart.css';
import Header from '../../Components/Header/Header.jsx';
import Navbar from '../../Components/Navbar/Navbar.jsx';
import Footer from '../../Components/Footer/Footer.jsx';
import { useCart } from '../../Context/Cartcontext.jsx';
import { FaMinus, FaPlus, FaTrash } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { createOrder,createOrderItems } from '../../Services/orderServices.js';
import { supabase } from '../../Services/supabase.js';
import { useStoreSettings } from '../../Context/StoreSettingsContext.jsx';

const PACKAGING_CHARGE = 15;

function Cart() {
  const navigate = useNavigate();
  const {
    cartItems: cart,
    addToCart,
    updateCartItemQuantity,
    removeFromCart,
    clearCart
  } = useCart();
  const { settings, loadingSettings } = useStoreSettings();
  
  const FREE_DELIVERY_THRESHOLD = settings.freeDeliveryLimit || 0;
  const DEFAULT_DELIVERY_CHARGE = settings.deliveryCharge || 0;

  const savedCheckoutData = JSON.parse(
    sessionStorage.getItem('checkoutForm') || '{}'
  );

  const [discountPercent, setDiscountPercent] = React.useState(0);
  const [appliedCouponCode, setAppliedCouponCode] = React.useState('');
  const [couponInput, setCouponInput] = React.useState('');
  const [isCouponModalOpen, setIsCouponModalOpen] = React.useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = React.useState(false);
  const [toasts, setToasts] = React.useState([]);
const [customerName, setCustomerName] = React.useState(
  savedCheckoutData.customerName || ''
);

const [phone, setPhone] = React.useState(
  savedCheckoutData.phone || ''
);

const [locationLink, setLocationLink] = React.useState(
  savedCheckoutData.locationLink || ''
);

const [deliveryNotes, setDeliveryNotes] = React.useState(
  savedCheckoutData.deliveryNotes || ''
);

const [paymentMethod, setPaymentMethod] = React.useState(
  savedCheckoutData.paymentMethod || 'COD'
);

const [placingOrder, setPlacingOrder] = React.useState(false);
const [activeOrder, setActiveOrder] = React.useState(null);
const [checkingActiveOrder, setCheckingActiveOrder] = React.useState(true);

  // Check for active orders on mount
  useEffect(() => {
    const checkActiveOrder = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setCheckingActiveOrder(false);
          return;
        }
        const { data, error } = await supabase
          .from('orders')
          .select('id, order_status')
          .eq('user_id', user.id)
          .in('order_status', ['Placed', 'Out for Delivery'])
          .limit(1)
          .single();

        if (!error && data) {
          setActiveOrder(data);
        } else {
          setActiveOrder(null);
        }
      } catch {
        setActiveOrder(null);
      } finally {
        setCheckingActiveOrder(false);
      }
    };
    checkActiveOrder();
  }, []);



  // Toast System
  const showToast = (message, type = 'info') => {
    const id = Date.now() + Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  useEffect(() => {
    sessionStorage.setItem(
      'checkoutForm', 
      JSON.stringify({
        customerName, phone, locationLink, deliveryNotes, paymentMethod
      })
    );
  }, [customerName, phone, locationLink, deliveryNotes,  paymentMethod]);

  // Calculations
  const subtotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  }, [cart]);

  const totalItemsCount = useMemo(() => {
    return cart.length; // Distinct item count matching screenshot
  }, [cart]);

  const deliveryCharge = 0;
  const packagingCharge = 0;

  const discountValue = useMemo(() => {
    if (discountPercent > 0 && subtotal > 0) {
      return subtotal * (discountPercent / 100);
    }
    return 0;
  }, [subtotal, discountPercent]);

  const totalAmount = useMemo(() => {
    const total = subtotal - discountValue;
    return Math.max(0, total);
  }, [subtotal, discountValue]);

  const deliveryLeft = 0;
  const deliveryProgressPercent = 100;

  // Operations
  const handleUpdateQty = (id, change) => {
    const affectedItem = cart.find((item) => item.id === id);
    if (!affectedItem) return;

    updateCartItemQuantity(id, change);
    const productName = affectedItem.name || affectedItem.title;

    if (affectedItem.quantity + change <= 0) {
      showToast(`Removed ${productName} from cart`, 'info');
    } else {
      showToast(`Updated quantity of ${productName}`, 'info');
    }
  };

  const handleRemoveItem = (id) => {
    const item = cart.find((cartItem) => cartItem.id === id);
    removeFromCart(id);
    if (item) {
      showToast(`Removed ${item.name || item.title} from cart`, 'info');
    }
  };

  const handleClearCart = () => {
    if (cart.length === 0) return;
    clearCart();
    showToast('Shopping cart cleared', 'info');
  };

  const handleAddToCart = (recItem) => {
    const existing = cart.find((item) => item.id === recItem.id);
    addToCart(recItem);
    showToast(
      existing ? `Increased quantity of ${recItem.name} in cart` : `Added ${recItem.name} to cart`,
      'success'
    );
  };

  const handleApplyCoupon = () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) {
      showToast('Please enter a valid coupon code', 'error');
      return;
    }

    if (code === 'SUPER10') {
      setDiscountPercent(10);
      setAppliedCouponCode('SUPER10');
      showToast('Coupon SUPER10 applied! 10% discount added.', 'success');
      setIsCouponModalOpen(false);
      setCouponInput('');
    } else if (code === 'FREE50') {
      setDiscountPercent(15);
      setAppliedCouponCode('FREE50');
      showToast('Coupon FREE50 applied! 15% discount added.', 'success');
      setIsCouponModalOpen(false);
      setCouponInput('');
    } else {
      showToast('Invalid Coupon Code!', 'error');
    }
  };

  const handleConfirmOrder = () => {
    clearCart();
    setDiscountPercent(0);
    setAppliedCouponCode('');
    setIsCheckoutModalOpen(false);
    showToast('Order confirmed! Cart cleared.', 'success');
  };

  const scrollRecommendations = () => {
    if (recommendationsRef.current) {
      recommendationsRef.current.scrollBy({ left: 220, behavior: 'smooth' });
    }
  };

  // Helper to format rupees in Indian format
  const formatRupee = (num) => {
    return '₹' + num.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const validateCheckout = () => {
    if(!customerName.trim()) {
        toast.error('Please Enter Your Name', 'error');
        return false;
    }
    if(customerName.trim().length < 3) {
      toast.error("Name should be more than 3 characters", 'error');
      return;
    }
    if(!phone.trim()) {
      toast.error("Please enter mobile number", 'error');
      return false;
    }
    if(!/^[6-9]\d{9}$/.test(phone)) {
      toast.error('Enter a valid mobile number', 'error');
      return false;
    }
    if(!locationLink.trim()) {
      toast.error('Provide your location link from google.', 'error');
      return false;
    }
    if(
      !locationLink.includes('google.com/maps') &&
      !locationLink.includes('maps.app.goo.gl')
    ) {
      toast.error('Enter valid google maps link', 'error');
      return false;
    }
    if(!paymentMethod) {
      toast.error('Select Payemnt method', 'error');
      return false;
    }
    if(cart.length === 0) {
      toast.error('Cart is empty', 'error');
      return false;
    }
    return true;
  };

  const handlePlaceOrder = async () => {
    const isValid = validateCheckout();
    if(!isValid) {
      return;
    }
    
    setPlacingOrder(true);
    
    try {
      const { data:{ user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please login again.');
        setPlacingOrder(false);
        return;
      }

      // Re-check for active orders right before placing
      const { data: activeCheck } = await supabase
        .from('orders')
        .select('id, order_status')
        .eq('user_id', user.id)
        .in('order_status', ['Placed', 'Out for Delivery'])
        .limit(1)
        .single();

      if (activeCheck) {
        setActiveOrder(activeCheck);
        toast.error('You already have an active order.');
        setPlacingOrder(false);
        return;
      }

      const order = await createOrder({
        user_id: user.id,
        customer_name: customerName,
        phone: phone,
        location_link: locationLink,
        delivery_notes: deliveryNotes,
        payment_method: paymentMethod,
        total_amount: totalAmount,
        order_status: 'Placed',
      });

      console.log(cart);
      const orderItems =  cart.map(item => ({
        order_id: order.id,
        product_id: item.id,
        product_name: item.title || item.name || 'Unknown Product',
        quantity: item.quantity,
        price: item.price,
      }))
      await createOrderItems(orderItems);

      clearCart();
      setIsCheckoutModalOpen(false);
      setCustomerName('');
      setPhone('');
      setLocationLink('');
      setDeliveryNotes('');
      setPaymentMethod('COD');
      sessionStorage.removeItem('checkoutForm');
      
      navigate(`/order-success/${order.id}`);
    } catch (error) {
      console.error('Failed to create order items:', error);
      toast.error('Failed to save order');
    } finally {
      setPlacingOrder(false);
    }
  };

  return (
    <>
    <Header />
    <Navbar />
    <main className="cart-page">
        <div className="cart-title-area">
          <i className="fa-solid fa-cart-shopping"></i>
          <h1>Your Cart</h1>
          <span className="cart-title-count">({totalItemsCount} Item{totalItemsCount !== 1 ? 's' : ''})</span>
        </div>

        {cart.length === 0 ? (
          <div className="cart-content-card">
            <div className="empty-cart-container">
              <div className="empty-cart-icon">
                <i className="fa-solid fa-cart-arrow-down"></i>
              </div>
              <div className="empty-cart-text">
                <h2>Your Cart is Empty</h2>
                <p>Browse products and add fresh items from the recommendations below!</p>
              </div>
              <button
                className="btn-primary"
                onClick={() => navigate('/Home#featured-categories')}
                style={{ width: 'auto', padding: '12px 30px' }}
              >
                <i className="fa-solid fa-basket-shopping"></i> Browse Products
              </button>
            </div>
          </div>
        ) : (
          <div className="cart-grid">
            {/* Left Column: Cart Items List */}
            <div className="cart-content-card">
              <div className="cart-table-header">
                <div>Product</div>
                <div>Price</div>
                <div>Quantity</div>
                <div>Total</div>
                <div></div>
              </div>

              <div className="cart-items-list">
                {cart.map((item) => (
                  <div key={item.id} className="cart-item-row">
                    <div className="product-info">
                      <div className="product-img-wrapper">
                        <img 
                          className="product-img" 
                          src={item.image || item.image_url} 
                          alt={item.name || item.title} 
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = `https://placehold.co/150x150/d32f2f/ffffff?text=${encodeURIComponent((item.name || item.title).substring(0, 2))}`;
                          }}
                        />
                      </div>
                      <div className="product-details">
                        <h3>{item.name || item.title}</h3>
                        <p>{item.weight || item.description}</p>
                      </div>
                    </div>
                    
                    <div className="product-price">{formatRupee(item.price)}</div>
                    
                    <div>
                      <div className="quantity-controller">
                        <button className="quantity-btn" onClick={() => handleUpdateQty(item.id, -1)}>
                          <FaMinus aria-hidden="true" />
                        </button>
                        <div className="quantity-value">{item.quantity}</div>
                        <button className="quantity-btn" onClick={() => handleUpdateQty(item.id, 1)}>
                          <FaPlus aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="product-total">{formatRupee(item.price * item.quantity)}</div>
                    
                    <div>
                      <button className="delete-btn" onClick={() => handleRemoveItem(item.id)} title="Remove Item">
                        <FaTrash aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="cart-footer-actions">
                <button className="btn-outline" onClick={() => { showToast('Redirecting to Grocery catalog...', 'info'); navigate('/Home'); }}>
                  <i className="fa-solid fa-arrow-left"></i> Continue Shopping
                </button>
                <button className="btn-outline btn-clear" onClick={handleClearCart}>
                  <FaTrash aria-hidden="true" /> Clear Cart
                </button>
              </div>
            </div>

            {/* Right Column: Sidebar */}
            <div className="sidebar">
              {/* Order Summary */}
              <div className="summary-card">
                <h2 className="summary-title">Order Summary</h2>

                {/* Free Delivery Progress */}
                <div className="delivery-progress-container">
                  <div className="delivery-progress-text">
                      <span style={{ color: '#16a34a' }}>
                        <i className="fa-solid fa-circle-check"></i> Enjoy <strong>FREE delivery</strong> on all orders!
                      </span>
                  </div>
                  <div className="progress-bar-bg">
                    <div 
                      className="progress-bar-fill" 
                      style={{ 
                        width: `100%`,
                        backgroundColor: '#16a34a'
                      }}
                    ></div>
                  </div>
                  <div className="progress-subtext">
                    <span>{formatRupee(subtotal)} Spend</span>
                      <span style={{ color: '#16a34a', fontWeight: '700' }}>
                        <i className="fa-solid fa-circle-check"></i> Free Delivery
                      </span>
                  </div>
                </div>

                {/* Invoice details */}
                <div className="summary-row">
                  <span>Subtotal ({totalItemsCount} Item{totalItemsCount !== 1 ? 's' : ''})</span>
                  <span>{formatRupee(subtotal)}</span>
                </div>
                
                <div className="summary-row">
                  <span>Delivery Charges</span>
                  <span style={deliveryCharge === 0 ? { color: '#16a34a', fontWeight: '700' } : {}}>
                    {deliveryCharge === 0 ? 'FREE' : formatRupee(deliveryCharge)}
                  </span>
                </div>
                
                <div className="summary-row">
                  <span>Packaging Charges</span>
                  <span>{formatRupee(packagingCharge)}</span>
                </div>
                
                {/* Coupon Discount Row */}
                {appliedCouponCode && (
                  <div className="summary-row" style={{ color: '#16a34a', fontWeight: '600' }}>
                    <span>Coupon Discount ({appliedCouponCode})</span>
                    <span>-{formatRupee(discountValue)}</span>
                  </div>
                )}

                <div className="summary-row total-row">
                  <span>Total Amount</span>
                  <span>{formatRupee(totalAmount)}</span>
                </div>
                <div className="total-taxes">(Inclusive of all taxes)</div>

                <button type="button" className="btn-primary" onClick={() => setIsCheckoutModalOpen(true)}>
                  <i className="fa-solid fa-credit-card"></i> Proceed to Checkout
                </button>
                <button type="button" className="btn-coupon" onClick={() => setIsCouponModalOpen(true)}>
                  <i className="fa-solid fa-ticket"></i> Apply Coupon
                </button>
              </div>

              {/* Secure Badge */}
              <div className="trust-badge">
                <i className="fa-solid fa-shield-halved"></i>
                <div className="trust-badge-text">
                  <h4>Secure Checkout</h4>
                  <p>100% secure payments and data protection</p>
                </div>
              </div>
            </div>
          </div>
        )};
      {/* Coupon Modal */}
      {isCouponModalOpen && (
        <div className="modal-overlay active">
          <div className="modal-card">
            <div className="modal-header">
              <h3 className="modal-title">Apply Promo Coupon</h3>
              <button className="modal-close" onClick={() => { setIsCouponModalOpen(false); setCouponInput(''); }}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                Enter a promo code to apply a discount. Try coupon code <strong style={{ color: 'var(--primary)' }}>SUPER10</strong> for 10% off your purchase!
              </p>
              <input 
                type="text" 
                className="modal-input" 
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
                placeholder="e.g. SUPER10" 
                style={{ textTransform: 'uppercase' }}
                onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
              />
            </div>
            <div className="modal-footer">
              <button className="btn-outline" onClick={() => { setIsCouponModalOpen(false); setCouponInput(''); }}>Cancel</button>
              <button className="btn-primary" onClick={handleApplyCoupon} style={{ margin: 0, width: 'auto', padding: '10px 24px' }}>Apply</button>
            </div>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
{
 isCheckoutModalOpen && (

  <div className="modal-overlay active">

   <div className="modal-card">

    <h3>Confirm Order</h3>

    {activeOrder ? (
      <>
        <div className='modal-body'>
          <div className="active-order-block">
            <div className="active-order-icon">📦</div>
            <p className="active-order-message">
              You already have an active order in progress. Please wait until your current order is delivered before placing another order.
            </p>
            <span className="active-order-status">Current Status: <strong>{activeOrder.order_status}</strong></span>
          </div>
        </div>
        <div className='modal-footer'>
          <button className='btn-outline' onClick={() => { setIsCheckoutModalOpen(false); navigate('/Home'); }}>Continue Shopping</button>
          <button className='btn-primary' onClick={() => { setIsCheckoutModalOpen(false); navigate(`/order/${activeOrder.id}`); }} style={{ margin: 0, width: 'auto', padding: '10px 24px' }}>View Current Order</button>
        </div>
      </>
    ) : (
      <>
    <div className='modal-body'>
    <input type='text' placeholder='Enter Full Name' value={customerName} onChange = {(e) => setCustomerName(e.target.value)}
        className='modal-input' disabled={placingOrder} />
    <input type='tel' placeholder='Mobile Number' value={phone} onChange={(e) => setPhone(e.target.value)} 
        className='modal-input' disabled={placingOrder} />
    <input type='url' className='modal-input' placeholder='Google Map Location Link' value={locationLink}
        onChange={(e) => setLocationLink(e.target.value)} disabled={placingOrder} />
    <textarea className='modal-input' placeholder='Delivery Notes (Optional)' value={deliveryNotes} 
        onChange={(e) => setDeliveryNotes(e.target.value)} disabled={placingOrder} />

      <div className="payments-method-section">
        <h4>Payment Method</h4>
        <label className='payment-option'>
          <input type='radio' name='payment' value='COD' checked={paymentMethod === 'COD'}
            onChange={(e) => setPaymentMethod(e.target.value)} disabled={placingOrder} />
            Cash on Delivery
        </label>
        <label className='payment-option'>
          <input type='radio' name='payment' value='ONLINE' checked={paymentMethod === 'ONLINE'}
            onChange={(e) => setPaymentMethod(e.target.value)} disabled={placingOrder} />
            Online Payemnt
        </label>
      </div>

      <div className='checkout-total'>
        <span>Total Amount</span>
        <strong>{formatRupee(totalAmount)}</strong>
      </div>
      </div>

      
   <div className='modal-footer'>
    <button className='btn-outline' onClick={() => setIsCheckoutModalOpen(false)} disabled={placingOrder}>Cancel</button>
    <button className='btn-primary' onClick={handlePlaceOrder} disabled={placingOrder} aria-busy={placingOrder}>
      {placingOrder ? 'Processing...' : 'Place Order'}
    </button>
   </div>
      </>
    )}
   </div>
  </div>
 )
}

      {/* Toast Notifications */}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast toast-${toast.type} show`}>
            <i className={`fa-solid ${toast.type === 'success' ? 'fa-circle-check' : toast.type === 'error' ? 'fa-triangle-exclamation' : 'fa-circle-info'}`}></i>
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </main>
    
    <Footer />
    </>
  );
}

export default Cart;
