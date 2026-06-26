import { useState, useEffect } from 'react';
import './FeaturedCategories.css';
import { getCategories } from '../../Services/categoryServices';
import { useNavigate } from 'react-router-dom';



const FeaturedCategories = ({ onCategorySelect }) => {
  const navigate = useNavigate();
  const[ categories,setCategories ] = useState([]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data || []);
      } catch(err) {
        console.error(err);
      }
    };
    loadCategories();
  }, []);

  const handleCardClick = (id) => {
    navigate(`/products/${id}`);
  };


  return (
    <section className="featured-categories-section" id="featured-categories" aria-labelledby="featured-categories-heading">
      <div className="section-header">
        <h3 className="section-title" id="featured-categories-heading">Featured Categories</h3>
        <a href="#all-categories" className="section-link" id="view-all-link">
          <span>View All Categories</span>
          <svg className="link-arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </a>
      </div>

      {/* Categories Grid */}
      <div className="categories-grid">
        {categories.map((cat) => (
          <div 
            key={cat.id} 
            className="product-cat-card"
            onClick={() => handleCardClick(cat.id, cat.name)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleCardClick(cat.id, cat.name);
              }
            }}
          >
            <div className="card-image-wrapper">
              <img src={cat.image_url} alt={cat.name} className="card-img" />
              <div className="card-overlay">
                <span className="overlay-btn">Shop Now</span>
              </div>
            </div>
            <div className="card-footer">
              <h4 className="card-label">{cat.name}</h4>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeaturedCategories;
