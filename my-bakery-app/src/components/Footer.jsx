import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { bakeryApi } from '../services/api';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const { setIsAdminOpen, setIsTrackerOpen, setIsReservationOpen, showToast } = useCart();
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;

    setIsSubscribing(true);
    try {
      const res = await bakeryApi.subscribeNewsletter(email);
      if (res.success) {
        showToast(res.message || 'Subscribed to morning bake dispatch!', 'success');
        setEmail('');
      }
    } catch (err) {
      showToast('Could not subscribe. Please try again.', 'error');
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <a href="#home" className="brand">
            <span className="brand-mark">H&amp;G</span>
            <span className="brand-text">
              <strong>Hearth &amp; Grain</strong>
              <small>ARTISAN BAKERY</small>
            </span>
          </a>
          <p>Honest bread. Slow fermentation. Thoughtful coffee. A little morning goodness every day.</p>
          
          {/* Newsletter Dispatch */}
          <div className="newsletter-dispatch-box">
            <span className="newsletter-title">MORNING DISPATCH</span>
            <p className="newsletter-sub">Get secret weekend bakes and fresh loaf dispatches directly.</p>
            <form onSubmit={handleSubscribe} className="newsletter-form">
              <input
                type="email"
                placeholder="your.email@example.com"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                aria-label="Email for bakery dispatch"
              />
              <button type="submit" disabled={isSubscribing}>
                {isSubscribing ? '...' : 'Join'}
              </button>
            </form>
          </div>
        </div>

        <div className="footer-links">
          <h4>Explore</h4>
          <a href="#home">Home</a>
          <a href="#schedule">Daily Bakes</a>
          <a href="#menu">Artisan Menu</a>
          <a href="#story">Our Story</a>
          <a href="#reviews">Customer Reviews</a>
          <a href="#visit">Visit Us</a>
        </div>

        <div className="footer-links">
          <h4>Bakery Services</h4>
          <button type="button" className="footer-link-btn" onClick={() => setIsTrackerOpen(true)}>
            🔍 Track Your Order
          </button>
          <button type="button" className="footer-link-btn" onClick={() => setIsReservationOpen(true)}>
            📅 Book a Table
          </button>
          <a href="tel:+919876543210">Call: +91 98765 43210</a>
          <a href="mailto:hello@hearthandgrain.com">hello@hearthandgrain.com</a>

          <div className="staff-portal-trigger-box">
            <button 
              type="button"
              className="staff-portal-btn"
              onClick={() => setIsAdminOpen(true)}
              title="Bakery Staff Kitchen & Order Portal"
            >
              🔒 Staff Kitchen Portal
            </button>
          </div>
        </div>
      </div>

      <div className="container footer-bottom">
        <p>© {currentYear} Hearth &amp; Grain Artisan Bakery. All rights reserved.</p>
        <p>Slowly fermented • Baked with patience in wood-fired ovens.</p>
      </div>
    </footer>
  );
}