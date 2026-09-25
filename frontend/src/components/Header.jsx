import React, { useEffect, useState } from 'react';
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

  /* =========================================================
     Scroll state
  ========================================================= */

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 12);
    };

    onScroll();

    window.addEventListener('scroll', onScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, []);


  /* =========================================================
     Navigation helpers
  ========================================================= */

  const closeNavigation = () => {
    setNavOpen(false);
  };

  const handleNavAction = (action) => {
    setNavOpen(false);

    if (action) {
      action();
    }
  };


  /* =========================================================
     Render
  ========================================================= */

  return (
    <header
      className={`site-header ${
        scrolled ? 'is-scrolled' : ''
      }`}
    >
      <div className="container nav-container">

        {/* =====================================================
            BRAND
        ===================================================== */}

        <a
          href="#home"
          className="brand"
          aria-label="Hearth and Grain home"
          onClick={closeNavigation}
        >
          <span className="brand-logo-wrap">
            <img
              src="/favicon.png"
              alt="Hearth & Grain"
              className="brand-logo"
            />
          </span>

          <span className="brand-text">
            <strong>Hearth &amp; Grain</strong>
            <small>ARTISAN BAKERY</small>
          </span>
        </a>


        {/* =====================================================
            HEADER ACTIONS

            Cart + Book Table + Mobile Menu
            These stay visible outside the mobile nav.
        ===================================================== */}

        <div className="header-right-tools">

          {/* ---------------------------------------------------
              Cart
          --------------------------------------------------- */}

          <button
            type="button"
            className="cart-toggle-badge-btn"
            onClick={() => setIsCartOpen(true)}
            aria-label={`View shopping basket with ${cartCount} ${
              cartCount === 1 ? 'item' : 'items'
            }`}
          >
            <span
              className="header-action-icon"
              aria-hidden="true"
            >
              🛒
            </span>

            <span className="basket-text">
              Cart
            </span>

            {cartCount > 0 && (
              <span
                className="cart-counter-pill"
                aria-hidden="true"
              >
                {cartCount}
              </span>
            )}
          </button>


          {/* ---------------------------------------------------
              Book a Table

              IMPORTANT:
              This is intentionally outside nav-links so it
              remains visible on tablet/mobile.
          --------------------------------------------------- */}

          <button
            type="button"
            className="button button-primary header-book-button"
            onClick={() =>
              handleNavAction(() =>
                setIsReservationOpen(true)
              )
            }
            aria-label="Book a table"
          >
            <span
              className="nav-button-icon"
              aria-hidden="true"
            >
              ☕
            </span>

            <span className="header-book-text">
              Book a Table
            </span>
          </button>


          {/* ---------------------------------------------------
              Mobile menu toggle
          --------------------------------------------------- */}

          <button
            id="navToggle"
            className={`nav-toggle ${
              navOpen ? 'open' : ''
            }`}
            type="button"
            aria-label={
              navOpen
                ? 'Close navigation menu'
                : 'Open navigation menu'
            }
            aria-expanded={navOpen}
            aria-controls="navLinks"
            onClick={() =>
              setNavOpen((previous) => !previous)
            }
          >
            <span />
            <span />
            <span />
          </button>

        </div>


        {/* =====================================================
            NAVIGATION
        ===================================================== */}

        <nav
          id="navLinks"
          className={`nav-links ${
            navOpen ? 'open' : ''
          }`}
          aria-label="Main navigation"
        >

          {/* This week's bake */}

          <a
            href="#schedule"
            onClick={closeNavigation}
          >
            <span
              className="nav-emoji"
              aria-hidden="true"
            >
              🥖
            </span>

            <span>
              This week's bake
            </span>
          </a>


          {/* Menu */}

          <a
            href="#menu"
            onClick={closeNavigation}
          >
            <span
              className="nav-emoji"
              aria-hidden="true"
            >
              🥐
            </span>

            <span>
              Menu
            </span>
          </a>


          {/* Our story */}

          <a
            href="#story"
            onClick={closeNavigation}
          >
            <span
              className="nav-emoji"
              aria-hidden="true"
            >
              🤎
            </span>

            <span>
              Our story
            </span>
          </a>


          {/* Reviews */}

          <a
            href="#reviews"
            onClick={closeNavigation}
          >
            <span
              className="nav-emoji"
              aria-hidden="true"
            >
              ✦
            </span>

            <span>
              Reviews
            </span>
          </a>


          {/* Visit */}

          <a
            href="#visit"
            onClick={closeNavigation}
          >
            <span
              className="nav-emoji"
              aria-hidden="true"
            >
              📍
            </span>

            <span>
              Visit
            </span>
          </a>


          {/* Track Order */}

          <button
            type="button"
            className="nav-link-btn"
            onClick={() =>
              handleNavAction(() =>
                setIsTrackerOpen(true)
              )
            }
          >
            <span
              className="nav-emoji"
              aria-hidden="true"
            >
              🔎
            </span>

            <span>
              Track Order
            </span>
          </button>

        </nav>

      </div>
    </header>
  );
}