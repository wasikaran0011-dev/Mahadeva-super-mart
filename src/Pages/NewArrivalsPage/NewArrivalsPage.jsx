import React, { useEffect, useState } from 'react';
import Header from '../../Components/Header/Header';
import Navbar from '../../Components/Navbar/Navbar';
import Footer from '../../Components/Footer/Footer';
import ProductCard from '../../Components/ProductCard/ProductCard';
import { getNewArrivals } from '../../Services/productServices';
import '../Products/Products.css'; // Reuse existing styles

const NewArrivalsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        // Pass null to fetch all new arrivals without limit
        const data = await getNewArrivals(null);
        setProducts(data || []);
      } catch (error) {
        console.error('Error loading new arrivals:', error);
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
          <h1>New Arrivals</h1>
          <p>Discover our latest products. ({products.length} Products Available)</p>
        </section>

        {loading ? (
          <div className="products-loading">Loading Products...</div>
        ) : products.length === 0 ? (
          <div className="products-empty">
            <h2>No Products Found</h2>
            <p>No new arrivals found in Inventory.</p>
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

export default NewArrivalsPage;
