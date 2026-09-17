import React from 'react';

export default function Visit() {
  return (
    <section id="visit" className="visit-section">
      <div className="container visit-grid">
        <div className="visit-content">
          <span className="eyebrow">COME SAY HELLO</span>
          <h2>Your morning <span>starts here.</span></h2>
          <p>Drop by for a fresh loaf, stay for a cup of coffee, and leave with something delicious.</p>

          <div className="visit-details">
            <div className="visit-detail">
              <span className="detail-icon">⌖</span>
              <div>
                <strong>Find us</strong>
                <p>24 Grain Street<br />Your City, India</p>
              </div>
            </div>

            <div className="visit-detail">
              <span className="detail-icon">◷</span>
              <div>
                <strong>Opening hours</strong>
                <p>Monday–Saturday: 8 AM–7 PM<br />Sunday: 8 AM–2 PM</p>
              </div>
            </div>

            <div className="visit-detail">
              <span className="detail-icon">✆</span>
              <div>
                <strong>Call us</strong>
                <p>+91 98765 43210</p>
              </div>
            </div>
          </div>

          <a href="tel:+919876543210" className="button button-primary">
            Call to Reserve
            <span aria-hidden="true">→</span>
          </a>
        </div>

        <div className="visit-card">
          <div className="visit-card-top">
            <span className="visit-card-label">TODAY AT THE BAKERY</span>
            <span className="visit-status"><span></span> Open today</span>
          </div>
          <div className="visit-card-main">
            <span className="visit-card-symbol">✦</span>
            <h3>Fresh bread.<br />Warm welcome.</h3>
            <p>Come early. Stay awhile.</p>
          </div>
          <div className="visit-card-bottom">
            <span>Hearth &amp; Grain</span>
            <span>Since 1987</span>
          </div>
        </div>
      </div>
    </section>
  );
}