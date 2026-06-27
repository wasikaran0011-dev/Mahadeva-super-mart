import './Footer.css';

const Footer = () => {
  return (
    <footer className="main-footer">
      <div className="footer-container">
        
        {/* Brand Column */}
        <div className="footer-brand-col">
          <div className="footer-logo">
            <div className="logo-icon-wrapper mini">
              <svg className="logo-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 11V7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7V11" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                <path d="M3 9C3 7.89543 3.89543 7 5 7H19C20.1046 7 21 7.89543 21 9V17C21 19.2091 19.2091 21 17 21H7C4.79086 21 3 19.2091 3 17V9Z" fill="currentColor"/>
              </svg>
            </div>
            <span className="footer-brand-title">MAHADEVA SUPER MART</span>
          </div>
          <p className="footer-desc">
            Your premium neighborhood supermarket, now delivering fresh groceries and daily essentials straight to your home.
          </p>
          <p className="footer-copyright">&copy; 2026 Mahadeva Super Mart. All rights reserved.</p>
        </div>
        
        {/* Quick Links Column */}
        <div className="footer-links-col">
          <h4 className="footer-header">Quick Links</h4>
          <ul className="footer-links">
            <li><a href="#about-us">About Us</a></li>
            <li><a href="#shop-grocery">Shop Grocery</a></li>
            <li><a href="#offers">Special Offers</a></li>
            <li><a href="#contact">Contact Support</a></li>
          </ul>
        </div>

        {/* Customer Service Column */}
        <div className="footer-links-col">
          <h4 className="footer-header">Customer Service</h4>
          <ul className="footer-links">
            <li><a href="#terms">Terms & Conditions</a></li>
            <li><a href="#privacy">Privacy Policy</a></li>
            <li><a href="#delivery">Delivery & Refund Policy</a></li>
            <li><a href="#faq">FAQ</a></li>
          </ul>
        </div>

        {/* Contact Column */}
        <div className="footer-contact-col">
          <h4 className="footer-header">Get In Touch</h4>
          <p className="footer-info"><strong>Address:</strong> Sapthagiri Colony, Karimnagar.</p>
          <p className="footer-info"><strong>Phone:</strong> +91 8686969980</p>
          <p className="footer-info"><strong>Email:</strong> mahadevasupermartstore2@gmail.com</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
