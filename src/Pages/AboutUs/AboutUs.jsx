import Header from '../../Components/Header/Header.jsx';
import Navbar from '../../Components/Navbar/Navbar.jsx';
import Footer from '../../Components/Footer/Footer.jsx';
import { Link } from 'react-router-dom';
import './AboutUs.css';
import { useEffect } from 'react';
import { useStoreSettings } from '../../Context/StoreSettingsContext.jsx';

const AboutUs = () => {
  const { settings } = useStoreSettings();

  useEffect(() => {
    const prev = document.title;
    document.title = 'About Us | Mahadeva Super Mart';
    return () => { document.title = prev; };
  }, []);

  const facilities = [
    { icon: '❄️', title: 'Cold Storage', desc: 'Dedicated refrigeration units keep dairy, meat, and frozen goods at the perfect temperature.' },
    { icon: '🏪', title: 'Wide Store Space', desc: 'Spacious, well-organized aisles for a comfortable and stress-free shopping experience.' },
    { icon: '🚴', title: 'Express Delivery', desc: 'Quick home delivery within Karimnagar city limits — your groceries arrive fresh and fast.' },
    { icon: '🛒', title: 'Easy Checkout', desc: 'Multiple billing counters with minimal wait time and digital billing options.' },
    { icon: '🌱', title: 'Fresh Produce Daily', desc: 'Fresh fruits and vegetables sourced and stocked every single morning.' },
    { icon: '📦', title: 'Safe Packaging', desc: 'All orders are carefully packed to prevent damage and preserve freshness.' },
  ];

  const whyUs = [
    { icon: '✅', title: 'Quality Guaranteed', desc: 'Every product is handpicked for quality. We reject anything that doesn\'t meet our standards.' },
    { icon: '💰', title: 'Competitive Prices', desc: 'Fair market pricing with regular discounts and special offers for loyal customers.' },
    { icon: '🏠', title: 'Home Delivery', desc: 'Order online and get fresh groceries delivered right to your doorstep.' },
    { icon: '⏱️', title: 'Time-Saving', desc: 'Skip the commute and long queues — shop from anywhere, any time.' },
    { icon: '💬', title: 'Friendly Support', desc: 'Our team is always available to help with your orders, returns, or any queries.' },
    { icon: '🔒', title: 'Secure Payments', desc: 'Safe and transparent payments with COD and online payment options.' },
  ];

  return (
    <>
      <Header />
      <Navbar />
      <main className="about-page">

        {/* ── HERO BANNER ── */}
        <section className="about-hero" aria-label="About us banner">
          <div className="about-hero-content">
            <span className="about-hero-tag">Est. 2020 · Karimnagar</span>
            <h1>Your Trusted Neighborhood<br />Supermarket</h1>
            <p>
              {settings.storeName || 'Mahadeva Super Mart'} brings you the freshest groceries and daily essentials,
              delivered with care to your doorstep.
            </p>
            <div className="about-hero-ctas">
              <Link to="/Home" className="about-btn-primary">Shop Now</Link>
              <a href={`tel:${settings.phone || '+918686969980'}`} className="about-btn-outline">Call Us</a>
            </div>
          </div>
          <div className="about-hero-visual" aria-hidden="true">
            <div className="hero-visual-circle">
              <div className="hero-emoji-ring">
                <span>🥬</span><span>🍎</span><span>🥛</span>
                <span>🌾</span><span>🧴</span><span>🍞</span>
              </div>
              <div className="hero-center-icon">🏪</div>
            </div>
          </div>
        </section>

        {/* ── OUR STORY ── */}
        <section className="about-section about-story-section">
          <div className="about-section-inner">
            <div className="about-section-header">
              <span className="section-label">Our Journey</span>
              <h2>Our Story</h2>
            </div>
            <div className="story-timeline">
              <div className="story-step">
                <div className="story-step-icon">🌱</div>
                <div className="story-step-content">
                  <h3>Humble Beginnings</h3>
                  <p>
                    {settings.storeName || 'Mahadeva Super Mart'} started as a small neighborhood store in {settings.address ? settings.address.split(',')[0] : 'Sapthagiri Colony'} with a simple
                    mission — to provide fresh, affordable groceries to our local community.
                  </p>
                </div>
              </div>
              <div className="story-step">
                <div className="story-step-icon">📈</div>
                <div className="story-step-content">
                  <h3>Growing Together</h3>
                  <p>
                    Thanks to the trust and loyalty of our customers, we expanded our product range, improved our
                    storage facilities, and hired a dedicated team to serve you better.
                  </p>
                </div>
              </div>
              <div className="story-step">
                <div className="story-step-icon">🚀</div>
                <div className="story-step-content">
                  <h3>Going Digital</h3>
                  <p>
                    We launched our online platform to bring the {settings.storeName || 'Mahadeva Super Mart'} experience to your phone —
                    browse, order, and get delivery at your doorstep without leaving home.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── MISSION & VISION ── */}
        <section className="about-section about-mv-section">
          <div className="about-section-inner about-mv-grid">
            <div className="mv-card mission">
              <div className="mv-icon">🎯</div>
              <h2>Our Mission</h2>
              <p>
                To provide every household in Karimnagar with easy access to fresh, high-quality groceries and
                daily essentials at fair prices — delivered with speed, safety, and a smile.
              </p>
            </div>
            <div className="mv-card vision">
              <div className="mv-icon">🔭</div>
              <h2>Our Vision</h2>
              <p>
                To become the most trusted and beloved grocery destination in Karimnagar — a store that the
                community can always count on for freshness, value, and convenience.
              </p>
            </div>
          </div>
        </section>

        {/* ── WHY CHOOSE US ── */}
        <section className="about-section about-why-section">
          <div className="about-section-inner">
            <div className="about-section-header">
              <span className="section-label">Why Us</span>
              <h2>Why Choose {settings.storeName || 'Mahadeva Super Mart'}?</h2>
              <p>We go beyond just selling groceries — we deliver an experience you can trust.</p>
            </div>
            <div className="why-grid">
              {whyUs.map((item, i) => (
                <div key={i} className="why-card">
                  <div className="why-icon">{item.icon}</div>
                  <h3>{item.title}</h3>
                  <p>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FACILITIES ── */}
        <section className="about-section about-facilities-section">
          <div className="about-section-inner">
            <div className="about-section-header">
              <span className="section-label">Infrastructure</span>
              <h2>Our Facilities</h2>
              <p>Built to give you the best shopping experience possible.</p>
            </div>
            <div className="facilities-grid">
              {facilities.map((f, i) => (
                <div key={i} className="facility-card">
                  <div className="facility-icon">{f.icon}</div>
                  <h3>{f.title}</h3>
                  <p>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── HOME DELIVERY ── */}
        <section className="about-section about-delivery-section">
          <div className="about-section-inner about-delivery-grid">
            <div className="delivery-visual" aria-hidden="true">
              <div className="delivery-icon-wrap">🚚</div>
            </div>
            <div className="delivery-content">
              <span className="section-label">Doorstep Service</span>
              <h2>Home Delivery — Right at Your Door</h2>
              <p>
                Place your order through our website, share your Google Maps location, and sit back.
                Our delivery team will bring your fresh groceries straight to your home.
              </p>
              <ul className="delivery-features">
                <li>📍 Google Maps-based precision delivery</li>
                <li>⚡ Same-day and next-day delivery options</li>
                <li>💳 Cash on Delivery and Online Payment accepted</li>
                <li>🆓 Free delivery on orders above ₹{settings.freeDeliveryLimit || 1000}</li>
                <li>📦 Securely packed to preserve freshness</li>
              </ul>
              <Link to="/Cart" className="about-btn-primary">Start Shopping</Link>
            </div>
          </div>
        </section>

        {/* ── STORE LOCATION ── */}
        <section className="about-section about-location-section">
          <div className="about-section-inner about-location-grid">
            <div className="location-content">
              <span className="section-label">Find Us</span>
              <h2>Store Location</h2>
              <p>
                Visit us in person or drop by anytime for the freshest picks straight off the shelves.
              </p>
              <div className="location-detail-list">
                <div className="location-detail-item">
                  <span className="loc-icon">📍</span>
                  <div>
                    <strong>Address</strong>
                    <p>{settings.address || 'Sapthagiri Colony, Karimnagar, Telangana'}</p>
                  </div>
                </div>
                <div className="location-detail-item">
                  <span className="loc-icon">📞</span>
                  <div>
                    <strong>Phone</strong>
                    <p><a href={`tel:${settings.phone || '+918686969980'}`}>{settings.phone || '+91 8686969980'}</a></p>
                  </div>
                </div>
                <div className="location-detail-item">
                  <span className="loc-icon">✉️</span>
                  <div>
                    <strong>Email</strong>
                    <p><a href={`mailto:${settings.email || 'mahadevasupermartstore2@gmail.com'}`}>{settings.email || 'mahadevasupermartstore2@gmail.com'}</a></p>
                  </div>
                </div>
                <div className="location-detail-item">
                  <span className="loc-icon">🕐</span>
                  <div>
                    <strong>Business Hours</strong>
                    <p>Mon – Sat: 8:00 AM – 9:00 PM</p>
                    <p>Sunday: 9:00 AM – 7:00 PM</p>
                  </div>
                </div>
              </div>
              <a
                href="https://maps.google.com/?q=Sapthagiri+Colony+Karimnagar+Telangana"
                target="_blank"
                rel="noopener noreferrer"
                className="about-btn-primary"
                aria-label="Open store location in Google Maps"
              >
                📍 Open in Google Maps
              </a>
            </div>
            <div className="location-map-placeholder" aria-hidden="true">
              <div className="map-pin-animation">
                <div className="map-ripple"></div>
                <div className="map-pin">📍</div>
              </div>
              <p>{settings.address || 'Sapthagiri Colony, Karimnagar, Telangana'}</p>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
};

export default AboutUs;
