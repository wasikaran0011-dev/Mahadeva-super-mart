import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getNewArrivals } from '../../Services/productServices';
import { useCart } from '../../Context/Cartcontext';
import { getPriceDetails } from '../../Utils/priceUtils';
import './NewArrivals.css';

const NewArrivals = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getNewArrivals();
        setProducts(data || []);
      } catch (err) {
        console.error('Error loading new arrivals:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading || products.length === 0) return null;

  return (
    <section className="new-arrivals-section" aria-labelledby="new-arrivals-heading">
      <div className="section-header">
        <h3 className="section-title" id="new-arrivals-heading">New Arrivals</h3>
        <Link to="/new-arrivals" className="section-link">
          <span>View All</span>
          <svg className="link-arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </Link>
      </div>

      <div className="new-arrivals-grid">
        {products.map(product => {
          const { hasDiscount, mrp, savings } = getPriceDetails(product.price, product.original_price);
          return (
            <div
              className="product-card"
              key={product.id}
              onClick={() => navigate(`/product/${product.id}`)}
            >
              <div className="product-image-wrapper">
                <img
                  src={product.image}
                  alt={product.title}
                  className="product-image"
                />
              </div>
              <div className="product-content">
                <div className="product-rating-row">
                  <span className="product-rating">⭐ {product.rating || '4.5'}</span>
                  <span className={`stock-status ${product.status?.toLowerCase() === 'out of stock' ? 'out' : 'in'}`}>
                    {product.status || 'In Stock'}
                  </span>
                </div>

                <h3 className="product-title">{product.title}</h3>
                <p className="product-description">{product.description}</p>

                <div className="product-price-section">
                  <span className="product-price">₹{product.price}</span>
                  {hasDiscount && (
                    <div className="price-meta">
                      <span className="old-price">₹{mrp}</span>
                      <span className="save-amount">Save ₹{savings}</span>
                    </div>
                  )}
                </div>

                <button
                  className="product-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    addToCart(product);
                  }}
                >
                  Add To Cart
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default NewArrivals;
