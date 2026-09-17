import React from 'react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <a href="#home" className="brand">
            <span className="brand-mark">H&G</span>
            <span className="brand-text">
              <strong>Hearth &amp; Grain</strong>
              <small>ARTISAN BAKERY</small>
            </span>
          </a>
          <p>Honest bread. Thoughtful coffee. A little goodness every day.</p>
        </div>

        <div className="footer-links">
          <h4>Explore</h4>
          <a href="#home">Home</a>
          <a href="#schedule">This week's bake</a>
          <a href="#menu">Menu</a>
          <a href="#story">Our story</a>
          <a href="#visit">Visit</a>
        </div>

        <div className="footer-links">
          <h4>Connect</h4>
          <a href="mailto:hello@hearthandgrain.com">Email Us</a>
          <a href="tel:+919876543210">Call Us</a>
          <a href="#visit">Find Our Bakery</a>
        </div>
      </div>

      <div className="container footer-bottom">
        <p>© {currentYear} Hearth &amp; Grain Bakery. All rights reserved.</p>
        <p>Baked with love and patience.</p>
      </div>
    </footer>
  );
}