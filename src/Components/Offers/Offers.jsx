import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getOfferProducts } from '../../Services/productServices';
import { useCart } from '../../Context/Cartcontext';
import './Offers.css';

const Offers = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getOfferProducts();
        setProducts(data || []);
      } catch (err) {
        console.error('Error loading offer products:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading || products.length === 0) return null;

  return (
    <section className="offers-section" aria-labelledby="offers-heading">
      <div className="section-header">
        <h3 className="section-title" id="offers-heading">Offers</h3>
      </div>

      <div className="offers-grid">
        {products.map(product => {
          const pct = product.offer_percentage || 0;
          const originalPrice = pct > 0
            ? Math.round(product.price / (1 - pct / 100))
            : null;

          return (
            <div
              className="product-card"
              key={product.id}
              onClick={() => navigate(`/product/${product.id}`)}
            >
              <div className="product-image-wrapper offer-image-wrapper">
                <img
                  src={product.image}
                  alt={product.title}
                  className="product-image"
                />
                {pct > 0 && (
                  <span className="offer-badge">{pct}% OFF</span>
                )}
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
                  {originalPrice && (
                    <div className="price-meta">
                      <span className="old-price">₹{originalPrice}</span>
                      <span className="save-amount">{pct}% OFF</span>
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

export default Offers;
