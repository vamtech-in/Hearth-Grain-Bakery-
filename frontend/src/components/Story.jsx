import React from 'react';

export default function Story() {
  return (
    <section id="story" className="story-section">
      {/* Background ambient lighting and grain */}
      <div className="story-ambient-glow" aria-hidden="true" />
      <div className="story-decoration story-decoration-top" aria-hidden="true" />
      <div className="story-decoration story-decoration-bottom" aria-hidden="true" />

      <div className="container story-wrap">
        <div className="story-grid">
          
          {/* LEFT COLUMN: Narrative & Editorial Content */}
          <div className="story-content">
            {/* Section label */}
            <div className="story-heading animate-fade-up">
              <span className="eyebrow">OUR STORY</span>
              <span className="story-year" aria-label="Established in 1987">SINCE 1987</span>
            </div>

            {/* Main heading */}
            <h2 className="animate-fade-up delay-1">
              A little bakery
              <span>with a big heart.</span>
            </h2>

            {/* Intro */}
            <p className="story-intro animate-fade-up delay-2">
              Hearth &amp; Grain began with a simple idea:
              make good bread and share it with the neighbourhood.
            </p>

            {/* Story Body */}
            <div className="story-body animate-fade-up delay-2">
              <p>
                What started as a small family bakery has grown into
                a place where people gather over warm loaves, fresh
                pastries and thoughtfully brewed coffee.
              </p>
              <p>
                We keep things simple. We work with time, quality
                ingredients and traditional methods to create food
                that feels both familiar and special.
              </p>
            </div>

            {/* Pull Quote */}
            <blockquote className="story-pull-quote animate-fade-up delay-3">
              <span className="quote-mark" aria-hidden="true">“</span>
              <p>
                We still believe in the old ways — long fermentation,
                honest ingredients and the patience to let good things
                happen naturally.
              </p>
              <span className="quote-mark quote-mark-end" aria-hidden="true">”</span>
            </blockquote>

            {/* Signature */}
            <div className="story-signature animate-fade-up delay-4">
              <span className="signature-line" aria-hidden="true" />
              <div className="signature-text">
                <strong>Made with patience</strong>
                <small>Founder &amp; Head Baker</small>
              </div>
              <span className="signature-line" aria-hidden="true" />
            </div>
          </div>

          {/* RIGHT COLUMN: Visual Editorial Card & Core Pillars */}
          <div className="story-visual-column animate-fade-up delay-3">
            <div className="story-badge-card">
              <div className="badge-card-inner">
                <span className="badge-icon" aria-hidden="true">✦</span>
                <span className="badge-subtitle">TRADITION MEETS MASTERY</span>
                <h3>100% Wild Fermentation</h3>
                <p>No industrial shortcuts. Just flour, water, wild yeasts, and over 36 hours of patient cold-retardation.</p>
                <div className="badge-stats-row">
                  <div>
                    <strong>36+ hrs</strong>
                    <span>Ferment Time</span>
                  </div>
                  <div className="stat-separator" />
                  <div>
                    <strong>0</strong>
                    <span>Shortcuts Taken</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bakery Values Stacked Immersive Grid */}
            <div className="story-values-stack">
              <div className="story-value-card">
                <span className="story-value-number">01</span>
                <div>
                  <strong>Slow Fermentation</strong>
                  <span>Time makes better bread.</span>
                </div>
              </div>

              <div className="story-value-card">
                <span className="story-value-number">02</span>
                <div>
                  <strong>Honest Ingredients</strong>
                  <span>Simple things, carefully chosen.</span>
                </div>
              </div>

              <div className="story-value-card">
                <span className="story-value-number">03</span>
                <div>
                  <strong>Made By Hand</strong>
                  <span>Every loaf gets our attention.</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}