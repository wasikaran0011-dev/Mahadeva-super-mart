import React, { useEffect, useState } from 'react';
import Header from '../../Components/Header/Header';
import Navbar from '../../Components/Navbar/Navbar';
import Footer from '../../Components/Footer/Footer';
import ProductCard from '../../Components/ProductCard/ProductCard';
import { getOfferProducts } from '../../Services/productServices';
import '../Products/Products.css'; // Reuse existing styles

const OffersPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        // Pass null to fetch all offer products without limit
        const data = await getOfferProducts(null);
        setProducts(data || []);
      } catch (error) {
        console.error('Error loading offer products:', error);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  return (
    <>
      <Header />
      <Navbar />
      <main className="products-page">
        <section className="products-heading">
          <h1>Special Offers</h1>
          <p>Best deals and discounts. ({products.length} Products Available)</p>
        </section>

        {loading ? (
          <div className="products-loading">Loading Products...</div>
        ) : products.length === 0 ? (
          <div className="products-empty">
            <h2>No Products Found</h2>
            <p>No offer products found in Inventory.</p>
          </div>
        ) : (
          <section className="products-grid">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </section>
        )}
      </main>
      <Footer />
    </>
  );
};

export default OffersPage;
