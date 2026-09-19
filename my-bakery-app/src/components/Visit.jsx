import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { bakeryApi } from '../services/api';

export default function Visit() {
  const { setIsReservationOpen, showToast } = useCart();
  const [inquiryName, setInquiryName] = useState('');
  const [inquiryPhone, setInquiryPhone] = useState('');
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [sendingInquiry, setSendingInquiry] = useState(false);

  // Determine if bakery is currently open
  const now = new Date();
  const day = now.getDay();
  const hour = now.getHours();
  // Mon-Sat: 8 AM to 7 PM (19:00). Sun: 8 AM to 2 PM (14:00)
  const isOpen = (day === 0 && hour >= 8 && hour < 14) || (day > 0 && hour >= 8 && hour < 19);

  const handleInquirySubmit = async (e) => {
    e.preventDefault();
    if (!inquiryName.trim() || !inquiryMessage.trim()) return;

    setSendingInquiry(true);
    try {
      const res = await bakeryApi.submitContact({
        name: inquiryName,
        phone: inquiryPhone,
        message: inquiryMessage
      });
      if (res.success) {
        showToast('Inquiry received! We will get back to you shortly.', 'success');
        setInquiryName('');
        setInquiryPhone('');
        setInquiryMessage('');
      }
    } catch (err) {
      showToast('Could not send message. Please try calling us.', 'error');
    } finally {
      setSendingInquiry(false);
    }
  };

  return (
    <section id="visit" className="visit-section">
      <div className="container visit-grid">
        <div className="visit-content">
          <span className="eyebrow">COME SAY HELLO</span>
          <h2>Your morning <span>starts here.</span></h2>
          <p>Drop by for a warm loaf fresh from the peel, stay for a cup of single-origin coffee, and leave with something delicious.</p>

          <div className="visit-details">
            <div className="visit-detail">
              <span className="detail-icon">⌖</span>
              <div>
                <strong>Find our Bakery</strong>
                <p>24 Grain Street, Artisan Quarter<br />Mumbai, Maharashtra 400001</p>
              </div>
            </div>

            <div className="visit-detail">
              <span className="detail-icon">◷</span>
              <div>
                <strong>Baking Hours</strong>
                <p>Monday–Saturday: 8:00 AM – 7:00 PM<br />Sunday: 8:00 AM – 2:00 PM</p>
              </div>
            </div>

            <div className="visit-detail">
              <span className="detail-icon">✆</span>
              <div>
                <strong>Call the Bakers</strong>
                <p><a href="tel:+919876543210" className="phone-link">+91 98765 43210</a></p>
              </div>
            </div>
          </div>

          <div className="visit-actions-group">
            <button 
              type="button" 
              className="button button-primary"
              onClick={() => setIsReservationOpen(true)}
            >
              📅 Reserve a Table
              <span aria-hidden="true">→</span>
            </button>
            <a href="tel:+919876543210" className="button button-secondary">
              Call Counter
            </a>
          </div>

          {/* Quick Note to Bakers */}
          <div className="quick-inquiry-box">
            <h4>Leave a Note for Head Baker</h4>
            <form onSubmit={handleInquirySubmit} className="inquiry-form">
              <div className="inquiry-fields">
                <input
                  type="text"
                  placeholder="Your Name"
                  required
                  value={inquiryName}
                  onChange={e => setInquiryName(e.target.value)}
                />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={inquiryPhone}
                  onChange={e => setInquiryPhone(e.target.value)}
                />
              </div>
              <textarea
                placeholder="Special request, bulk catering, or gluten question..."
                required
                rows="2"
                value={inquiryMessage}
                onChange={e => setInquiryMessage(e.target.value)}
              />
              <button 
                type="submit" 
                className="button button-small button-secondary inquiry-submit-btn"
                disabled={sendingInquiry}
              >
                {sendingInquiry ? 'Sending...' : 'Send to Bakery'}
              </button>
            </form>
          </div>
        </div>

        <div className="visit-card">
          <div className="visit-card-top">
            <span className="visit-card-label">TODAY AT THE BAKERY</span>
            <span className={`visit-status ${isOpen ? 'open' : 'closed'}`}>
              <span className="status-indicator-dot"></span> 
              {isOpen ? 'Oven Hot & Open Now' : 'Closed for Dough Fermentation'}
            </span>
          </div>
          <div className="visit-card-main">
            <span className="visit-card-symbol">✦</span>
            <h3>Fresh bread.<br />Warm welcome.</h3>
            <p>Come early for crusty batards. Stay awhile for the aromas.</p>
            <div className="visit-card-features">
              <div className="feature-pill">🌿 100% Wild Sourdough</div>
              <div className="feature-pill">🧈 French Normandy Butter</div>
              <div className="feature-pill">☕ Specialty Roast</div>
            </div>
          </div>
          <div className="visit-card-bottom">
            <span>Hearth &amp; Grain</span>
            <span>Est. 1987 • Baking Daily</span>
          </div>
        </div>
      </div>
    </section>
  );
}