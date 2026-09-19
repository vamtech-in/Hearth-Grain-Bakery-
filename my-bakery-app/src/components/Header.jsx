import React, { useState } from 'react';
import { useCart } from '../context/CartContext';

export default function Header() {
  const [navOpen, setNavOpen] = useState(false);
  const { cartCount, setIsCartOpen, setIsTrackerOpen, setIsReservationOpen } = useCart();

  const handleNavAction = (action) => {
    setNavOpen(false);
    if (action) action();
  };

  return (
    <header className="site-header">
      <div className="container nav-container">
        <a href="#home" className="brand" aria-label="Hearth and Grain home">
          <span className="brand-mark">H&amp;G</span>
          <span className="brand-text">
            <strong>Hearth &amp; Grain</strong>
            <small>ARTISAN BAKERY</small>
          </span>
        </a>

        {/* Action icons on mobile & desktop */}
        <div className="header-right-tools">
          <button 
            type="button" 
            className="cart-toggle-badge-btn"
            onClick={() => setIsCartOpen(true)}
            aria-label={`View shopping basket with ${cartCount} items`}
          >
            <span className="basket-icon">🥖</span>
            <span className="basket-text">Basket</span>
            {cartCount > 0 && <span className="cart-counter-pill">{cartCount}</span>}
          </button>

          <button 
            id="navToggle" 
            className={`nav-toggle ${navOpen ? 'open' : ''}`} 
            type="button" 
            aria-label="Open navigation menu" 
            aria-expanded={navOpen} 
            onClick={() => setNavOpen(!navOpen)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>

        <nav id="navLinks" className={`nav-links ${navOpen ? 'open' : ''}`} aria-label="Main navigation">
          <a href="#schedule" onClick={() => setNavOpen(false)}>Daily Bakes</a>
          <a href="#menu" onClick={() => setNavOpen(false)}>Artisan Menu</a>
          <a href="#story" onClick={() => setNavOpen(false)}>Our Story</a>
          <a href="#reviews" onClick={() => setNavOpen(false)}>Reviews</a>
          <a href="#visit" onClick={() => setNavOpen(false)}>Visit Us</a>
          <button 
            type="button" 
            className="nav-link-btn"
            onClick={() => handleNavAction(() => setIsTrackerOpen(true))}
          >
            🔍 Track Order
          </button>
          <button 
            type="button" 
            className="nav-button"
            onClick={() => handleNavAction(() => setIsReservationOpen(true))}
          >
            Book Table
          </button>
        </nav>
      </div>
    </header>
  );
}