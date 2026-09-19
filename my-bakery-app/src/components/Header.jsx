import React, { useState } from 'react';
import { useCart } from '../context/CartContext';

export default function Header() {
  const [navOpen, setNavOpen] = useState(false);

  const {
    cartCount,
    setIsCartOpen,
    setIsTrackerOpen,
    setIsReservationOpen,
  } = useCart();

  const handleNavAction = (action) => {
    setNavOpen(false);
    if (action) action();
  };

  return (
    <header className="site-header">
      <div className="container nav-container">

        {/* Brand */}
        <a href="#home" className="brand" aria-label="Hearth and Grain home">
          <img
            src="/favicon.png"
            alt="Hearth & Grain"
            className="brand-logo"
          />

          <span className="brand-text">
            <strong>Hearth &amp; Grain</strong>
            <small>ARTISAN BAKERY</small>
          </span>
        </a>

        {/* Header actions */}
        <div className="header-right-tools">

          {/* Basket */}
          <button
            type="button"
            className="cart-toggle-badge-btn"
            onClick={() => setIsCartOpen(true)}
            aria-label={`View shopping basket with ${cartCount} items`}
          >
            <span className="basket-icon">🥖</span>
            <span className="basket-text">Basket</span>

            {cartCount > 0 && (
              <span className="cart-counter-pill">
                {cartCount}
              </span>
            )}
          </button>

          {/* Mobile menu */}
          <button
            id="navToggle"
            className={`nav-toggle ${navOpen ? 'open' : ''}`}
            type="button"
            aria-label={navOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={navOpen}
            onClick={() => setNavOpen(!navOpen)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

        </div>

        {/* Navigation */}
        <nav
          id="navLinks"
          className={`nav-links ${navOpen ? 'open' : ''}`}
          aria-label="Main navigation"
        >
          <a href="#schedule" onClick={() => setNavOpen(false)}>
            This week's bake
          </a>

          <a href="#menu" onClick={() => setNavOpen(false)}>
            Menu
          </a>

          <a href="#story" onClick={() => setNavOpen(false)}>
            Our story
          </a>

          <a href="#reviews" onClick={() => setNavOpen(false)}>
            Reviews
          </a>

          <a href="#visit" onClick={() => setNavOpen(false)}>
            Visit
          </a>

          {/* Track Order */}
          <button
            type="button"
            className="nav-link-btn"
            onClick={() =>
              handleNavAction(() => setIsTrackerOpen(true))
            }
          >
            🔍 Track Order
          </button>

          {/* Book Table */}
          <button
            type="button"
            className="nav-button"
            onClick={() =>
              handleNavAction(() => setIsReservationOpen(true))
            }
          >
            Book Table
          </button>
        </nav>

      </div>
    </header>
  );
}
