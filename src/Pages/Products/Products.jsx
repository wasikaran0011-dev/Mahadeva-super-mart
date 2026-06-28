import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useCart } from '../../Context/Cartcontext.jsx';
import Header from '../../Components/Header/Header';
import Navbar from '../../Components/Navbar/Navbar';
import Footer from '../../Components/Footer/Footer';
import { useNavigate } from 'react-router-dom';
import { getProductsByCategory } from '../../Services/productServices';
import { getPriceDetails } from '../../Utils/priceUtils';

import './Products.css';

const Products = () => {

  const { categoryId } = useParams();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await getProductsByCategory(categoryId);
        setProducts(data || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [categoryId]);

  return (
    <>
      <Header />

      <Navbar />

    <main className="products-page">
        <section className="products-heading">
          <h1> Products </h1>
          <p>{products.length} Products Available </p>
        </section>

        {loading ? (
            <div className="products-loading">
              Loading Products...
            </div>) :
             products.length === 0 ? (

            <div className="products-empty">
              <h2>No Products Found</h2>
              <p>No matching products found in Inventory.</p>
            </div>
          ) : (

            <section className="products-grid">
              {products.map(product => (

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
                  <span className="product-rating">⭐ {product.rating || "4.5"}</span>
                  <span className={`stock-status ${product.status?.toLowerCase() === "out of stock" ? "out" : "in"}`}>
            {product.status || "In Stock"}
        </span>
                </div>

    <h3 className="product-title">{product.title}</h3>
    <p className="product-description">{product.description}</p>

    {(() => {
      const { hasDiscount, mrp, savings } = getPriceDetails(product.price, product.original_price);
      console.log(`[Pricing Debug] ${product.title} - Price: ${product.price}, MRP: ${product.original_price}, Discount Valid: ${hasDiscount}`);
      return (
        <div className="product-price-section">
          <span className="product-price">₹{product.price}</span>
          {hasDiscount && (
            <div className='price-meta'>
              <span className="old-price">₹{mrp}</span>
              <span className="save-amount">Save ₹{savings}</span>
            </div>
          )}
        </div>
      );
    })()}

    <button className="product-btn" onClick={(e)=>{
            e.stopPropagation();
            addToCart(product);
        }}>
        Add To Cart
    </button>
  </div>

</div>

))
}
</section>
)
}

</main>
<Footer />
</>
  );
};

export default Products;
