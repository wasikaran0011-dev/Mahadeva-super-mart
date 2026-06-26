import './Features.css';

const Features = () => {
  const featuresList = [
    {
      title: 'Best Quality',
      subtitle: 'Products you can trust',
      icon: (
        <svg className="feature-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="8" r="7"></circle>
          <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
        </svg>
      )
    },
    {
      title: 'Lowest Prices',
      subtitle: 'Best value for your money',
      icon: (
        <svg className="feature-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
          <line x1="7" y1="7" x2="7.01" y2="7"></line>
        </svg>
      )
    },
    {
      title: 'Fresh Everyday',
      subtitle: 'Handpicked for you',
      icon: (
        <svg className="feature-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 22s8-4 12-4 8 4 8 4V2s-8 4-12 4-8-4-8-4z"></path>
          <path d="M12 18V6"></path>
        </svg>
      )
    },
    {
      title: 'Fast & Easy Delivery',
      subtitle: 'Quick delivery to your doorstep',
      icon: (
        <svg className="feature-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="1" y="3" width="15" height="13"></rect>
          <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
          <circle cx="5.5" cy="18.5" r="2.5"></circle>
          <circle cx="18.5" cy="18.5" r="2.5"></circle>
        </svg>
      )
    }
  ];

  return (
    <section className="features-bar-section" aria-label="Store Guarantees">
      <div className="features-card">
        {featuresList.map((item) => (
          <div key={item.title} className="feature-col">
            <div className="feature-icon-wrapper">
              {item.icon}
            </div>
            <div className="feature-text-wrapper">
              <h4 className="feature-title">{item.title}</h4>
              <p className="feature-subtitle">{item.subtitle}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Features;
