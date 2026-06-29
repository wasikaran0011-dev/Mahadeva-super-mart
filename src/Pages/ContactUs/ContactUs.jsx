import { useState, useEffect } from 'react';
import Header from '../../Components/Header/Header.jsx';
import Navbar from '../../Components/Navbar/Navbar.jsx';
import Footer from '../../Components/Footer/Footer.jsx';
import { Link } from 'react-router-dom';
import { useStoreSettings } from '../../Context/StoreSettingsContext.jsx';
import './ContactUs.css';

const ContactUs = () => {
  const { settings } = useStoreSettings();

  useEffect(() => {
    const prev = document.title;
    document.title = 'Contact Us | Mahadeva Super Mart';
    return () => { document.title = prev; };
  }, []);

  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const targetEmail = settings.email || 'mahadevasupermartstore2@gmail.com';
    // Compose a mailto: link with form data pre-filled
    const mailtoLink = `mailto:${targetEmail}?subject=${encodeURIComponent(formData.subject || 'Customer Enquiry')}&body=${encodeURIComponent(
      `Name: ${formData.name}\nEmail: ${formData.email}\n\n${formData.message}`
    )}`;
    window.location.href = mailtoLink;
    setSubmitted(true);
  };

  const contactMethods = [
    {
      icon: '📞',
      label: 'Call Us',
      value: settings.phone || '+91 8686969980',
      desc: 'Available Mon–Sat, 8 AM – 9 PM',
      href: `tel:${settings.phone || '+918686969980'}`,
      btnText: 'Call Now',
    },
    {
      icon: '✉️',
      label: 'Email Us',
      value: settings.email || 'mahadevasupermartstore2@gmail.com',
      desc: 'We respond within 24 hours',
      href: `mailto:${settings.email || 'mahadevasupermartstore2@gmail.com'}`,
      btnText: 'Send Email',
    },
    {
      icon: '📍',
      label: 'Visit Us',
      value: settings.address || 'Sapthagiri Colony, Karimnagar',
      desc: 'Telangana, India',
      href: 'https://maps.google.com/?q=Sapthagiri+Colony+Karimnagar+Telangana',
      btnText: 'Open Maps',
      external: true,
    },
  ];

  const businessHours = [
    { day: 'Monday', hours: '8:00 AM – 9:00 PM', open: true },
    { day: 'Tuesday', hours: '8:00 AM – 9:00 PM', open: true },
    { day: 'Wednesday', hours: '8:00 AM – 9:00 PM', open: true },
    { day: 'Thursday', hours: '8:00 AM – 9:00 PM', open: true },
    { day: 'Friday', hours: '8:00 AM – 9:00 PM', open: true },
    { day: 'Saturday', hours: '8:00 AM – 9:00 PM', open: true },
    { day: 'Sunday', hours: '9:00 AM – 7:00 PM', open: true },
  ];

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });

  return (
    <>
      <Header />
      <Navbar />
      <main className="contact-page">

        {/* ── PAGE HEADER ── */}
        <section className="contact-hero" aria-label="Contact us banner">
          <div className="contact-hero-inner">
            <span className="contact-hero-tag">We're Here to Help</span>
            <h1>Contact Us</h1>
            <p>
              Have a question about your order, our products, or our services?
              Reach out — we'll get back to you as soon as possible.
            </p>
          </div>
        </section>

        {/* ── CONTACT METHODS ── */}
        <section className="contact-section contact-methods-section">
          <div className="contact-inner">
            <div className="contact-methods-grid">
              {contactMethods.map((method, i) => (
                <div key={i} className="contact-method-card">
                  <div className="cm-icon">{method.icon}</div>
                  <div className="cm-label">{method.label}</div>
                  <div className="cm-value">{method.value}</div>
                  <div className="cm-desc">{method.desc}</div>
                  <a
                    href={method.href}
                    className="cm-btn"
                    {...(method.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                    aria-label={`${method.btnText} — ${method.label}`}
                  >
                    {method.btnText}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── STORE INFO + FORM ── */}
        <section className="contact-section contact-main-section">
          <div className="contact-inner contact-main-grid">

            {/* Left: Store Info */}
            <div className="contact-info-col">
              <h2>{settings.storeName || 'Mahadeva Super Mart'}</h2>
              <p className="contact-store-tagline">
                Your trusted neighborhood supermarket in Sapthagiri Colony, Karimnagar.
              </p>

              {/* Address */}
              <div className="contact-detail-block">
                <div className="cdb-icon">📍</div>
                <div>
                  <strong>Store Address</strong>
                  <p>{settings.address || 'Sapthagiri Colony, Karimnagar, Telangana, India'}</p>
                  <a
                    href="https://maps.google.com/?q=Sapthagiri+Colony+Karimnagar+Telangana"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="contact-maps-link"
                    aria-label="Open store location in Google Maps"
                  >
                    📍 Open in Google Maps
                  </a>
                </div>
              </div>

              {/* Phone */}
              <div className="contact-detail-block">
                <div className="cdb-icon">📞</div>
                <div>
                  <strong>Phone</strong>
                  <p>
                    <a href={`tel:${settings.phone || '+918686969980'}`} className="contact-link">{settings.phone || '+91 8686969980'}</a>
                  </p>
                </div>
              </div>

              {/* Email */}
              <div className="contact-detail-block">
                <div className="cdb-icon">✉️</div>
                <div>
                  <strong>Email</strong>
                  <p>
                    <a href={`mailto:${settings.email || 'mahadevasupermartstore2@gmail.com'}`} className="contact-link">
                      {settings.email || 'mahadevasupermartstore2@gmail.com'}
                    </a>
                  </p>
                </div>
              </div>

              {/* Business Hours */}
              <div className="contact-hours-block">
                <h3>Business Hours</h3>
                <div className="hours-table">
                  {businessHours.map((row, i) => (
                    <div
                      key={i}
                      className={`hours-row ${row.day === today ? 'hours-today' : ''}`}
                    >
                      <span className="hours-day">
                        {row.day}
                        {row.day === today && <span className="today-badge">Today</span>}
                      </span>
                      <span className="hours-time">{row.hours}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Contact Form */}
            <div className="contact-form-col">
              <div className="contact-form-card">
                <h2>Send Us a Message</h2>
                <p className="form-subtitle">
                  Fill out the form below and your default email client will open with your message pre-filled.
                </p>

                {submitted ? (
                  <div className="form-success">
                    <div className="form-success-icon">✅</div>
                    <h3>Thank You!</h3>
                    <p>Your email client should have opened with your message. We'll reply within 24 hours.</p>
                    <button
                      className="contact-btn-primary"
                      onClick={() => setSubmitted(false)}
                      type="button"
                    >
                      Send Another Message
                    </button>
                  </div>
                ) : (
                  <form className="contact-form" onSubmit={handleSubmit} noValidate>
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="contact-name">Full Name <span aria-hidden="true">*</span></label>
                        <input
                          type="text"
                          id="contact-name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="Your full name"
                          required
                          autoComplete="name"
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="contact-email">Email Address <span aria-hidden="true">*</span></label>
                        <input
                          type="email"
                          id="contact-email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="your@email.com"
                          required
                          autoComplete="email"
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label htmlFor="contact-subject">Subject</label>
                      <input
                        type="text"
                        id="contact-subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        placeholder="e.g. Order query, product availability..."
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="contact-message">Message <span aria-hidden="true">*</span></label>
                      <textarea
                        id="contact-message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="Tell us how we can help you..."
                        rows={5}
                        required
                      />
                    </div>
                    <button type="submit" className="contact-btn-primary">
                      ✉️ Send Message
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ── CUSTOMER SUPPORT ── */}
        <section className="contact-section contact-support-section">
          <div className="contact-inner">
            <div className="support-header">
              <span className="contact-section-label">Quick Help</span>
              <h2>Customer Support</h2>
              <p>Common ways we can assist you</p>
            </div>
            <div className="support-topics-grid">
              <div className="support-topic">
                <div className="support-topic-icon">📦</div>
                <h3>Order Tracking</h3>
                <p>Check the status of your current or past orders from the My Orders section.</p>
                <Link to="/my-orders" className="support-link">View My Orders →</Link>
              </div>
              <div className="support-topic">
                <div className="support-topic-icon">🔄</div>
                <h3>Returns & Refunds</h3>
                <p>Not satisfied with a product? Call us and we'll arrange a pickup or refund.</p>
                <a href={`tel:${settings.phone || '+918686969980'}`} className="support-link">Call {settings.phone || '+91 8686969980'} →</a>
              </div>
              <div className="support-topic">
                <div className="support-topic-icon">🚚</div>
                <h3>Delivery Issues</h3>
                <p>Facing a delay or wrong delivery? Contact us immediately and we'll resolve it.</p>
                <a href={`mailto:${settings.email || 'mahadevasupermartstore2@gmail.com'}`} className="support-link">Email Us →</a>
              </div>
              <div className="support-topic">
                <div className="support-topic-icon">💳</div>
                <h3>Payment Support</h3>
                <p>Questions about your bill or payment? We'll help clarify any discrepancies.</p>
                <a href={`tel:${settings.phone || '+918686969980'}`} className="support-link">Call Support →</a>
              </div>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
};

export default ContactUs;
