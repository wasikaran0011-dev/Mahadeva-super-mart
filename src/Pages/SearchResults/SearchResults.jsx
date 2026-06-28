import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Header from '../../Components/Header/Header';
import Navbar from '../../Components/Navbar/Navbar';
import Footer from '../../Components/Footer/Footer';
import { useCart } from '../../Context/Cartcontext';
import { searchProducts } from '../../Services/productServices';
import { getPriceDetails } from '../../Utils/priceUtils';

import './SearchResults.css';

const SearchResults = () => {

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const query = searchParams.get('q') || '';

  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(false);

  const { addToCart } = useCart();

  useEffect(() => {
    console.log('Query Changed: ', query);
    setLoading(true);
    const loadProducts = async () => {

      try {

        const data = await searchProducts(query);
        setLoading(true);

        setProducts(data || []);

      } catch (error) {

        console.error(error);

      } finally {

        setLoading(false);

      }
    };

    if(query){
      loadProducts();
    } else {
      setProducts([]);
      setLoading(false);
    }

  }, [query]);

  return (
    <>
      <Header />
      <Navbar />

      <main className="search-page">

        <div className="search-heading">

          <h1>
            Search Results
          </h1>

          <p>
            Results for "{query}"
          </p>

        </div>

        {
          loading ? (

            <div className="search-loading">
              Loading...
            </div>

          ) : products.length === 0 ? (

            <div className="search-empty">

              <h2>
                No Products Found
              </h2>

              <p>
                No products found for "{query}"
              </p>

            </div>

          ) : (

            <section className="products-grid">

              {
                products.map(product => (

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

                      <h3 className="product-title">
                        {product.title}
                      </h3>

                      <p className="product-description">
                        {product.description}
                      </p>

                      {(() => {
                        const { hasDiscount, mrp, savings } = getPriceDetails(product.price, product.original_price);
                        console.log(`[Pricing Debug] ${product.title} - Price: ${product.price}, MRP: ${product.original_price}, Discount Valid: ${hasDiscount}`);
                        return (
                          <div className="product-price-section">
                            <span className="product-price">
                              ₹{product.price}
                            </span>
                            {hasDiscount && (
                              <div className='price-meta'>
                                <span className="old-price">₹{mrp}</span>
                                <span className="save-amount">Save ₹{savings}</span>
                              </div>
                            )}
                          </div>
                        );
                      })()}

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

export default SearchResults;