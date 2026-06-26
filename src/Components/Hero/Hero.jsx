import { useState, useEffect } from 'react';
import './Hero.css';

const Hero = () => {
  const [activeSlide, setActiveSlide] = useState(0);

  const slides = [
    {
      subtitle: "Your Daily Need,",
      title: "All in One Place",
      text: "Quality products, best prices and a better shopping experience – every day.",
      image: "hero-basket.jpg"
    },
    {
      subtitle: "Fresh & Organic,",
      title: "Direct From Farms",
      text: "Handpicked fresh vegetables, organic fruits and farm-fresh dairy products delivered daily.",
      image: "hero-basket.jpg" // We reuse the basket image for visual consistency
    },
    {
      subtitle: "Super Savings,",
      title: "Unbeatable Offers",
      text: "Get up to 50% off on staples, snacks, household care and daily grocery items.",
      image: "hero-basket.jpg"
    }
  ];

  // Auto slide every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <section className="hero-banner-section" aria-label="Promotional Banner">
      {/* Floating Leaf Decorations */}
      <div className="floating-leaf leaf-1">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M17 8c.98 0 1.76.83 1.94 1.82a6 6 0 0 1-3.69 5.86c-1.39.61-3.08.62-4.5.21V22h-2v-6.1c-1.36-.61-2.28-1.92-2.65-3.4a6 6 0 0 1 2.37-6.07C7.62 5.5 9.17 5 10.74 5c2.4 0 4.6 1.05 6.26 3z" />
        </svg>
      </div>
      <div className="floating-leaf leaf-2">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M17 8c.98 0 1.76.83 1.94 1.82a6 6 0 0 1-3.69 5.86c-1.39.61-3.08.62-4.5.21V22h-2v-6.1c-1.36-.61-2.28-1.92-2.65-3.4a6 6 0 0 1 2.37-6.07C7.62 5.5 9.17 5 10.74 5c2.4 0 4.6 1.05 6.26 3z" />
        </svg>
      </div>
      <div className="floating-leaf leaf-3">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M17 8c.98 0 1.76.83 1.94 1.82a6 6 0 0 1-3.69 5.86c-1.39.61-3.08.62-4.5.21V22h-2v-6.1c-1.36-.61-2.28-1.92-2.65-3.4a6 6 0 0 1 2.37-6.07C7.62 5.5 9.17 5 10.74 5c2.4 0 4.6 1.05 6.26 3z" />
        </svg>
      </div>

      <div className="hero-container">
        {/* Hero Left Content */}
        <div className="hero-content">
          <h2 className="hero-subtitle">{slides[activeSlide].subtitle}</h2>
          <h3 className="hero-title-gradient">{slides[activeSlide].title}</h3>
          <p className="hero-text">{slides[activeSlide].text}</p>
          <a href="#featured-categories" className="hero-btn" id="shop-now-btn">
            <span>Shop Now</span>
            <svg className="btn-arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </a>
        </div>
        
        {/* Hero Right Image */}
        <div className="hero-image-container">
          <img 
            src={slides[activeSlide].image} 
            alt="A red grocery basket filled with fresh oil, flour, vegetables, rice, salt, and laundry detergent" 
            className="hero-image" 
            id="hero-img"
          />
        </div>
      </div>

      {/* Carousel Dots */}
      <div className="carousel-dots" aria-label="Banner slides navigation">
        {slides.map((_, index) => (
          <button 
            key={index}
            className={`dot ${activeSlide === index ? 'active' : ''}`} 
            aria-label={`Slide ${index + 1}`} 
            aria-current={activeSlide === index ? 'true' : 'false'}
            onClick={() => setActiveSlide(index)}
          ></button>
        ))}
      </div>
    </section>
  );
};

export default Hero;
