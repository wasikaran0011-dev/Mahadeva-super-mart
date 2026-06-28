import { useState,useEffect } from 'react';
import { FaStar, FaMinus, FaPlus, FaTruck } from 'react-icons/fa'; 
import { useParams } from 'react-router-dom';
import Header from '../../Components/Header/Header';
import Navbar from '../../Components/Navbar/Navbar';
import Footer from '../../Components/Footer/Footer';
import './ProductDetails.css';
import { getProductById } from '../../Services/productServices';
import { getPriceDetails } from '../../Utils/priceUtils';
import { useCart } from '../../Context/Cartcontext';
import toast from 'react-hot-toast';

const ProductDetails = () => {

    const { id } = useParams();
    const [ Product,setProduct ] = useState(null);
    const [ loading,setLoading ] = useState(true);
    const [ quantity,setQuantity ] = useState(1);
    const [ relatedProducts,setRelatedProducts ] = useState()
    const { addToCart } = useCart();


    useEffect(() => {
        const loadProduct = async() => {
            try {
                const data = await getProductById(id);
                setProduct(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        loadProduct();
    }, [id]);

    if(loading) {
      return(
        <>
        <Header />
        <Navbar />
        <main className='product-details-page'>
          <div className='product-loading'>
            Loading Product...
          </div>
        </main>

        <Footer />
        </>)
    }

    if(!Product) {
        return <h2>Product Not Found...</h2>
    }

    const handleAddToCart = () => {
        addToCart(Product);
        toast.success('Added To Cart');
    }

  return (
    <>
      <Header />
      <Navbar />

      <main className="product-details-page">

        <div className="product-details-container">

          <div className="product-image-section">
            <img
              src={Product.image}
              alt="Product"
            />
          </div>

          <div className="product-info-section">
            <div className='product-header'>
              <h1 className='product-title'>{Product.title}</h1>
              <p className='product-brand'>Brand: <strong>{Product.brand}</strong></p>

              <div className='rating-row'>
                <span className='rating-badge'>⭐{Product.rating}</span>
                <span className='review-count'>{Product.reviews} Reviews</span>
                <span className='stock-status'>{Product.status}</span>
              </div>

            </div>

          {(() => {
            const { hasDiscount, mrp, savings } = getPriceDetails(Product.price, Product.original_price);
            console.log(`[Pricing Debug] ${Product.title} - Price: ${Product.price}, MRP: ${Product.original_price}, Discount Valid: ${hasDiscount}`);
            return (
              <div className='product-price-section'>
                <h2 className='product-price'>₹{Product.price}</h2>

                {hasDiscount && (
                  <div className='price-meta'>
                    <span className='old-price'>₹{mrp}</span>
                    <span className='save-amount'>Save ₹{savings}</span>
                  </div>
                )}

                <p className='tax-text'>Inclusive of All Taxes</p>
              </div>
            );
          })()}

          <div className='offer-card'>
            <h4>Available Offers</h4>
            <ul>
              <li>Cash on delivery available</li>
              <li>Free delivery on Eligible orders</li>
            </ul>
          </div>

          <div className='specifications-card'>
            <div className='spec-item'>
              <span>Brand</span>
              <strong>{Product.brand}</strong>
            </div>

            <div className='spec-item'>
              <span>Weight</span>
              <strong>{Product.weight}</strong>
            </div>

            <div className='spec-item'>
              <span>Delivery</span>
              <strong>{Product.delivery_time}</strong>
            </div>
          </div>

        <div className='quantity-section'>
          <h4>Quantity</h4>
          <div className='quantity-box'>
            <button onClick={() => {setQuantity(prev => Math.max(1,prev-1))}}>
              <FaMinus />
            </button>
            <span>{quantity}</span>
            <button onClick={() => {setQuantity(prev => Math.max(1,prev+1))}}>
              <FaPlus />
            </button>
          </div>
        </div>

        <div className='action-buttons'>
          <button className='add-cart-button' onClick={handleAddToCart}>Add To Cart</button>
        </div>

          </div>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default ProductDetails;