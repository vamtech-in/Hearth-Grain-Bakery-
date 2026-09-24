import React from 'react';

export default function Story() {
  return (
    <section id="story" className="story-section">
      <div className="story-decoration story-decoration-top" aria-hidden="true" />
      <div className="story-decoration story-decoration-bottom" aria-hidden="true" />

      <div className="container story-wrap">

        <div className="story-content">

          {/* Section label */}
          <div className="story-heading animate-fade-up">
            <span className="eyebrow">
              OUR STORY
            </span>

            <span className="story-year" aria-label="Established in 1987">
              SINCE 1987
            </span>
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

          {/* Story */}
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

          {/* Pull quote */}
          <blockquote className="story-pull-quote animate-fade-up delay-3">
            <span className="quote-mark" aria-hidden="true">
              “
            </span>

            <p>
              We still believe in the old ways — long fermentation,
              honest ingredients and the patience to let good things
              happen naturally.
            </p>

            <span className="quote-mark quote-mark-end" aria-hidden="true">
              ”
            </span>
          </blockquote>

          {/* Bakery values */}
          <div className="story-values animate-fade-up delay-3">

            <div className="story-value">
              <span className="story-value-number">01</span>
              <strong>Slow Fermentation</strong>
              <span>Time makes better bread.</span>
            </div>

            <div className="story-value-divider" aria-hidden="true" />

            <div className="story-value">
              <span className="story-value-number">02</span>
              <strong>Honest Ingredients</strong>
              <span>Simple things, carefully chosen.</span>
            </div>

            <div className="story-value-divider" aria-hidden="true" />

            <div className="story-value">
              <span className="story-value-number">03</span>
              <strong>Made By Hand</strong>
              <span>Every loaf gets our attention.</span>
            </div>

          </div>

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

      </div>
    </section>
  );
}