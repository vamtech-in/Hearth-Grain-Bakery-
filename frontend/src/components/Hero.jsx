import React from 'react';

export default function Hero() {
  return (
    <section id="home" className="hero-section">
      <div className="container hero-grid">
        
        {/* Left Content */}
        <div className="hero-content">
          <div className="eyebrow">
            <span className="eyebrow-line"></span>
            BAKED WITH PATIENCE
          </div>
          
          <h1>
            Good bread
            <span>takes time.</span>
          </h1>
          
          <p className="hero-description">
            Slow-fermented sourdough, golden pastries and honest ingredients. Every morning, we bake with care so you can start your day with something special.
          </p>
          
          <div className="hero-actions">
            <a href="#menu" className="button button-primary">
              Explore Our Menu
              <span aria-hidden="true">→</span>
            </a>
            <a href="#story" className="button button-secondary">
              Our Story
            </a>
          </div>
          
          <div className="hero-note">
            <span className="note-icon">✦</span>
            Fresh from our oven every morning
          </div>
        </div>

        {/* Right Visual with Fixed Badge & Image Size */}
        <div className="hero-visual">
          <div className="hero-image-wrapper">
            <img 
              src="/images/image1.jpg" 
              alt="Freshly baked artisan sourdough bread" 
              className="real-bakery-image" 
            />
            
            {/* Badge is now safely inside/anchored to the wrapper bounds */}
            <div className="hero-badge">
              <span className="badge-small">EST.</span>
              <strong>1987</strong>
              <span className="badge-small">BAKING DAILY</span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}