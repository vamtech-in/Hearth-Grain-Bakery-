import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';

export default function Header() {
  const [navOpen, setNavOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const {
    cartCount,
    setIsCartOpen,
    setIsTrackerOpen,
    setIsReservationOpen,
  } = useCart();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleNavAction = (action) => {
    setNavOpen(false);
    if (action) action();
  };

  return (
    <header className={`site-header ${scrolled ? 'is-scrolled' : ''}`}>
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

          {/* Basket - Fixed spacing and clean counter */}
          <button
            type="button"
            className="cart-toggle-badge-btn"
            onClick={() => setIsCartOpen(true)}
            aria-label={`View shopping basket with ${cartCount} items`}
          >
            <span className="basket-icon">🛒</span>
            <span className="basket-text">Cart</span>

            {cartCount > 0 && (
              <span className="cart-counter-pill">
                {cartCount}
              </span>
            )}
          </button>

          {/* Mobile menu toggle */}
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

          {/* Track Order - Styled cleanly as a nav action */}
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
            className="button button-primary nav-button"
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