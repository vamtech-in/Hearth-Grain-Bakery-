import React, { useState } from 'react';

export default function Header() {
  const [navOpen, setNavOpen] = useState(false);

  return (
    <header className="site-header">
      <div className="container nav-container">
        <a href="#home" className="brand" aria-label="Hearth and Grain home">
          <span className="brand-mark">H&G</span>
          <span className="brand-text">
            <strong>Hearth &amp; Grain</strong>
            <small>ARTISAN BAKERY</small>
          </span>
        </a>

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

        <nav id="navLinks" className={`nav-links ${navOpen ? 'open' : ''}`} aria-label="Main navigation">
          <a href="#schedule" onClick={() => setNavOpen(false)}>This week's bake</a>
          <a href="#menu" onClick={() => setNavOpen(false)}>Menu</a>
          <a href="#story" onClick={() => setNavOpen(false)}>Our story</a>
          <a href="#visit" onClick={() => setNavOpen(false)}>Visit</a>
          <a href="#menu" className="nav-button" onClick={() => setNavOpen(false)}>View Menu</a>
        </nav>
      </div>
    </header>
  );
}