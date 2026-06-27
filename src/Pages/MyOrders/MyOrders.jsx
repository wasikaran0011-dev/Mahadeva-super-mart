import { useState, useEffect } from 'react';
import './MyOrders.css';
import Header from '../../Components/Header/Header.jsx';
import Navbar from '../../Components/Navbar/Navbar.jsx';
import Footer from '../../Components/Footer/Footer.jsx';
import { supabase } from '../../Services/supabase.js';
import { getUserOrders } from '../../Services/orderServices.js';
import { useNavigate } from 'react-router-dom';

const MyOrders = () => {

    const navigate = useNavigate();
    const [ orders,setOrders ] = useState([]);
    const [ loading,setLoading ] = useState(true);
    const [ searchTerm,setSearchTerm ] = useState('');

    useEffect(() => {
        const loadOrders = async() => {
            try{
                const { data: { user }} = await supabase.auth.getUser();
                if(!user) return;
                const data = await getUserOrders(user.id);
                setOrders(data || []);
            } catch(error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        loadOrders();
    }, []);


        const formatDate = (date) => {
        return new Date(date).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric"
        });
    };

    const getItemsPreview = (items = []) => {
        if(items.length === 0) {
            return 'No Products';
        }

        if(items.length <= 3) {
            return items.map(item => item.product_name).join(",");
        }

        const firstThree = items
            .slice(0,3)
            .map(item => item.product_name)
            .join(',');

        return `${firstThree} + ${items.length - 3} more`;
    };

    const getItemCount = (items = []) => {
        return items.reduce(
            (total,item) => total + item.quantity, 0
        );
    };
   
const filterProducts = orders.filter((order) => {
    const search = searchTerm.trim().toLowerCase();
    const items = order.orderitems || [];
    const productNames = items
        .map(item => item.product_name)
        .join(" ")
        .toLowerCase();

    // Exact Order ID match
    if (!isNaN(search) && search !== "") {
        return String(order.id) === search;
    }

    return (
        order.customer_name.toLowerCase().includes(search) ||
        order.payment_method.toLowerCase().includes(search) ||
        productNames.includes(search) ||
        formatDate(order.created_at).toLowerCase().includes(search)
    );

});


    return(
        <>
         <Header />
         <Navbar /> 
         <main className='my-orders-page'>
             <section className="orders-header">
                <div className="orders-heading">
                    <h1>My Orders</h1>
                    <p>Track, manage and review your purchases</p>
                    <span className='order-count'> {filterProducts.length} Orders found.</span>
                </div>
                
                <div className="orders-search">
                    <input
                    type="search" placeholder="Search orders..." value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </section>

            <section className='orders-container'>
                {
                    loading ? (
                        <div className='orders-loading'>
                          {[1,2,3].map((item)=>(
                                <div
                                    className="order-skeleton"
                                    key={item}>
                                    <div className="skeleton-line skeleton-title"></div>
                                    <div className="skeleton-line"></div>
                                    <div className="skeleton-line short"></div>
                                </div>
                            ))}
                        </div>
                    ) : filterProducts.length === 0 ? (
                        <div className='orders-empty'>
                            <div className='orders-empty-icon'>📦</div>
                            <h2>No Orders Yet</h2>
                            <p>Looks like you haven't placed any orders.
                                Start shopping and your orders will appear here.
                            </p>
                            <button className='shop-now-btn' onClick={() => navigate("/Home")}>
                                Continue Shopping
                            </button>
                        </div>
                    ) : (
                        filterProducts.map((order) => (
                            <article className='order-summary-card' key={order.id}>
                                <div className='order-summary-top'>
                                    <div>
                                        <h3>Order #{order.id}</h3>
                                        <p>{formatDate(order.created_at)}</p>
                                    </div>
                                </div>

                                <div className='order-summary-middle'>
                                    <div className='order-meta'>
                                        <span className='item-count'>{getItemCount(order.orderitems)} Items</span>
                                        <span className='payment-method'>{order.payment_method}</span>
                                    </div>
                                </div>

                                <p className='items-preview'>{getItemsPreview(order.orderitems)}</p>

                                <div className='order-summary-bottom'>
                                    <span className='order-status delivered'>
                                        <span className='status-dot'></span>
                                        Delivered</span>
                                    <div className='order-actions'>
                                    <button className='view-order-btn' onClick={() => navigate(`/order/${order.id}`)}>
                                        View Details  →
                                    </button>
                                    </div>
                                </div>
                            </article>
                        ))
                    )
                }
            </section>
        </main> 
        <Footer />  
        </>
    )
}

export default MyOrders;
