import React from 'react';

export default function Story() {
  return (
    <section id="story" className="story-section">
      <div className="container story-grid">
        <div className="story-image">
          <img src="/images/image2.jpg" alt="Warm bakery interior with wooden shelves" className="real-bakery-image" />
          <div className="image-label">Est. 1987</div>
        </div>

        <div className="story-content">
          <span className="eyebrow">OUR STORY</span>
          <h2>A little bakery <span>with a big heart.</span></h2>
          <p>Hearth &amp; Grain began with a simple idea: make good bread and share it with the neighbourhood.</p>
          <p>What started as a small family bakery has grown into a place where people gather over warm loaves, fresh pastries and thoughtfully brewed coffee.</p>
          
          <blockquote className="story-pull-quote">
            "We still believe in the old ways — long fermentation, honest ingredients and the patience to let good things happen naturally."
          </blockquote>

          <div className="story-signature">
            <span className="signature-line"></span>
            <div>
              <strong>Made with patience</strong>
              <small>Founder &amp; Head Baker</small>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}