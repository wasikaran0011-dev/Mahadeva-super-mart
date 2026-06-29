import { Link } from 'react-router-dom';
import { useStoreSettings } from '../../Context/StoreSettingsContext.jsx';
import './Footer.css';

const Footer = () => {
  const { settings } = useStoreSettings();

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
            <span className="footer-brand-title">{settings.storeName.toUpperCase()}</span>
          </div>
          <p className="footer-desc">
            Your premium neighborhood supermarket, now delivering fresh groceries and daily essentials straight to your home.
          </p>
          <p className="footer-copyright">&copy; {new Date().getFullYear()} {settings.storeName}. All rights reserved.</p>
        </div>
        
        {/* Quick Links Column */}
        <div className="footer-links-col">
          <h4 className="footer-header">Quick Links</h4>
          <ul className="footer-links">
            <li><Link to="/about-us">About Us</Link></li>
            <li><Link to="/Home">Shop Grocery</Link></li>
            <li><Link to="/Home">Special Offers</Link></li>
            <li><Link to="/contact-us">Contact Support</Link></li>
          </ul>
        </div>

        {/* Customer Service Column */}
        <div className="footer-links-col">
          <h4 className="footer-header">Customer Service</h4>
          <ul className="footer-links">
            <li><a href="#terms">Terms &amp; Conditions</a></li>
            <li><a href="#privacy">Privacy Policy</a></li>
            <li><a href="#delivery">Delivery &amp; Refund Policy</a></li>
            <li><a href="#faq">FAQ</a></li>
          </ul>
        </div>

        {/* Contact Column */}
        <div className="footer-contact-col">
          <h4 className="footer-header">Get In Touch</h4>
          <p className="footer-info"><strong>Address:</strong> {settings.address || 'Sapthagiri Colony, Karimnagar.'}</p>
          <p className="footer-info"><strong>Phone:</strong> <a href={`tel:${settings.phone || '+918686969980'}`} className="footer-contact-link">{settings.phone || '+91 8686969980'}</a></p>
          <p className="footer-info"><strong>Email:</strong> <a href={`mailto:${settings.email || 'mahadevasupermartstore2@gmail.com'}`} className="footer-contact-link">{settings.email || 'mahadevasupermartstore2@gmail.com'}</a></p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
