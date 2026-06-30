import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../Context/Cartcontext';
import { getPriceDetails } from '../../Utils/priceUtils';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const pct = product.offer_percentage || 0;
  const originalPriceForOffer = pct > 0 ? Math.round(product.price / (1 - pct / 100)) : null;

  // Use getPriceDetails from priceUtils if not an offer product (or if no offer_percentage)
  const { hasDiscount, mrp, savings } = getPriceDetails(product.price, product.original_price);
  
  return (
    <div
      className="product-card"
      onClick={() => navigate(`/product/${product.id}`)}
    >
      <div className={`product-image-wrapper ${pct > 0 ? 'offer-image-wrapper' : ''}`}>
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
          <span className="product-rating">⭐ {product.rating || "4.5"}</span>
          <span className={`stock-status ${product.status?.toLowerCase() === "out of stock" ? "out" : "in"}`}>
            {product.status || "In Stock"}
          </span>
        </div>

        <h3 className="product-title">{product.title}</h3>
        <p className="product-description">{product.description}</p>

        {product.is_offer_product && originalPriceForOffer ? (
          <div className="product-price-section">
            <span className="product-price">₹{product.price}</span>
            <div className="price-meta">
              <span className="old-price">₹{originalPriceForOffer}</span>
              <span className="save-amount">{pct}% OFF</span>
            </div>
          </div>
        ) : (
          <div className="product-price-section">
            <span className="product-price">₹{product.price}</span>
            {hasDiscount && (
              <div className='price-meta'>
                <span className="old-price">₹{mrp}</span>
                <span className="save-amount">Save ₹{savings}</span>
              </div>
            )}
          </div>
        )}

        <button className="product-btn" onClick={(e)=>{
            e.stopPropagation();
            addToCart(product);
        }}>
            Add To Cart
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
