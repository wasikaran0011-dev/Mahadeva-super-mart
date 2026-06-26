import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useCart } from '../../Context/Cartcontext.jsx';
import Header from '../../Components/Header/Header';
import Navbar from '../../Components/Navbar/Navbar';
import Footer from '../../Components/Footer/Footer';
import { useNavigate } from 'react-router-dom';
import { getProductsByCategory } from '../../Services/productServices';

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

          <h1>
            Products
          </h1>

          <p>
            {products.length} Products Available
          </p>

        </section>

        {
          loading ? (

            <div className="products-loading">
              Loading Products...
            </div>

          ) : products.length === 0 ? (

            <div className="products-empty">

              <h2>
                No Products Found
              </h2>

              <p>
                No matching products found in Inventory.
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

                      <h3>
                        {product.title}
                      </h3>

                      <p>
                        {product.description}
                      </p>

                      <div className="product-footer">

                        <span className="product-price">
                          ₹{product.price}
                        </span>

                        <span className='stock-status'>In Stock</span>
                        <button
                          className="product-btn" onClick={(e) => {
                            e.stopPropagation();
                            addToCart(product);
                          }}
                        >
                          Add To Cart
                        </button>

                      </div>

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
