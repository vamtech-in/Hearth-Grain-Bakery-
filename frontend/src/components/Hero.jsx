import React from 'react';

export default function Hero() {
  return (
    <section id="home" className="hero-section">

      {/* Background */}
      <div className="hero-bg" aria-hidden="true">
        <img
         src="/images/hero.jpg"
         alt=""
        className="hero-bg-image"
        />
        <div className="hero-bg-overlay" />
        <div className="hero-bg-grain" />
      </div>

      {/* Main content */}
      <div className="container hero-container">

        <div className="hero-main">

          {/* Eyebrow */}
          <div className="eyebrow hero-eyebrow animate-fade-up">
            <span className="eyebrow-line" />
            BAKED WITH PATIENCE
          </div>

          {/* Main heading */}
          <h1 className="hero-title animate-fade-up delay-1">
            Good bread
            <span>takes time.</span>
          </h1>

          {/* Description */}
          <p className="hero-description animate-fade-up delay-2">
            Slow-fermented sourdough, golden pastries and honest ingredients.
            Every morning, we bake with care so you can start your day with
            something special.
          </p>

          {/* Product philosophy */}
          <div className="hero-values animate-fade-up delay-2">
            <span>Slow Fermented</span>
            <span className="hero-value-dot" aria-hidden="true">
              •
            </span>
            <span>Fresh Daily</span>
            <span className="hero-value-dot" aria-hidden="true">
              •
            </span>
            <span>Handcrafted</span>
          </div>

          {/* Actions */}
          <div className="hero-actions animate-fade-up delay-3">
            <a href="#menu" className="button button-primary">
              Explore Our Menu
              <span aria-hidden="true">→</span>
            </a>

            <a href="#story" className="button button-outline">
              Our Story
            </a>
          </div>

          {/* Freshness note */}
          <div className="hero-note animate-fade-up delay-4">
            <span className="hero-note-icon" aria-hidden="true">
              ✦
            </span>

            <span>Fresh from our oven every morning</span>
          </div>

        </div>

        {/* Desktop information area */}
        <aside className="hero-aside" aria-label="Bakery information">

          {/* Established badge */}
          <div className="hero-est-badge">
            <span className="hero-est-label">EST.</span>

            <strong>1987</strong>

            <span className="hero-est-label">
              BAKING DAILY
            </span>
          </div>

          {/* Bakery card */}
          <div className="hero-info-card">

            <div className="hero-info-header">
              <span className="hero-status-dot" aria-hidden="true" />
              <span>BAKING TODAY</span>
            </div>

            <div className="hero-info-divider" />

            <div className="hero-info-row">
              <span>Fresh batch</span>
              <strong>Every morning</strong>
            </div>

            <div className="hero-info-row">
              <span>Open daily</span>
              <strong>7 AM — 7 PM</strong>
            </div>

            <div className="hero-info-divider" />

            <div className="hero-info-special">
              <span className="hero-special-icon" aria-hidden="true">
                ✦
              </span>

              <span>
                Naturally fermented
                <br />
                artisan sourdough
              </span>
            </div>

          </div>

        </aside>

      </div>

      {/* Bottom metadata */}
      <div className="hero-bottom">

        <div className="hero-bottom-line" />

        <span>
          ARTISAN BAKERY · HANDCRAFTED DAILY
        </span>

      </div>

      {/* Scroll indicator */}
      <a
        href="#menu"
        className="hero-scroll"
        aria-label="Scroll to menu"
      >
        <span>SCROLL</span>
        <span className="hero-scroll-line" aria-hidden="true" />
      </a>

    </section>
  );
}