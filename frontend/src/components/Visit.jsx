import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { bakeryApi } from '../services/api';

export default function Visit() {
  const { setIsReservationOpen, showToast } = useCart();

  const [inquiryName, setInquiryName] = useState('');
  const [inquiryPhone, setInquiryPhone] = useState('');
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [sendingInquiry, setSendingInquiry] = useState(false);

  // Bakery opening status
  const now = new Date();
  const day = now.getDay();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const openingMinutes = 8 * 60;
  const closingMinutes = day === 0 ? 14 * 60 : 19 * 60;

  const isOpen =
    currentMinutes >= openingMinutes &&
    currentMinutes < closingMinutes;

  const handleInquirySubmit = async (e) => {
    e.preventDefault();

    if (!inquiryName.trim() || !inquiryMessage.trim()) {
      return;
    }

    setSendingInquiry(true);

    try {
      const res = await bakeryApi.submitContact({
        name: inquiryName.trim(),
        phone: inquiryPhone.trim(),
        message: inquiryMessage.trim(),
      });

      if (res.success) {
        showToast(
          'Inquiry received! We will get back to you shortly.',
          'success'
        );

        setInquiryName('');
        setInquiryPhone('');
        setInquiryMessage('');
      }
    } catch (err) {
      showToast(
        'Could not send message. Please try calling us.',
        'error'
      );
    } finally {
      setSendingInquiry(false);
    }
  };

  return (
    <section id="visit" className="visit-section">
      <div className="container">

        {/* =================================================
            MAIN VISIT CONTENT
        ================================================= */}

        <div className="visit-grid">

          {/* LEFT CONTENT */}
          <div className="visit-content">

            <span className="eyebrow">
              <span className="eyebrow-line" />
              COME SAY HELLO
            </span>

            <h2>
              Your morning
              <span>starts here.</span>
            </h2>

            <p>
              Drop by for a warm loaf fresh from the peel, stay for
              a cup of single-origin coffee, and leave with something
              delicious.
            </p>

            <div className="visit-details">

              <div className="visit-detail">
                <span className="detail-icon" aria-hidden="true">
                  ⌖
                </span>

                <div>
                  <strong>Find our Bakery</strong>
                  <p>
                    24 Grain Street, Artisan Quarter
                    <br />
                    Mumbai, Maharashtra 400001
                  </p>
                </div>
              </div>

              <div className="visit-detail">
                <span className="detail-icon" aria-hidden="true">
                  ◷
                </span>

                <div>
                  <strong>Baking Hours</strong>
                  <p>
                    Monday–Saturday: 8:00 AM – 7:00 PM
                    <br />
                    Sunday: 8:00 AM – 2:00 PM
                  </p>
                </div>
              </div>

              <div className="visit-detail">
                <span className="detail-icon" aria-hidden="true">
                  ✆
                </span>

                <div>
                  <strong>Call the Bakers</strong>
                  <p>
                    <a
                      href="tel:+919876543210"
                      className="phone-link"
                    >
                      +91 98765 43210
                    </a>
                  </p>
                </div>
              </div>

            </div>

            <div className="visit-actions-group">
              <button
                type="button"
                className="button button-primary"
                onClick={() => setIsReservationOpen(true)}
              >
                <span aria-hidden="true">◷</span>
                Reserve a Table
                <span aria-hidden="true">→</span>
              </button>

              <a
                href="tel:+919876543210"
                className="button button-secondary"
              >
                Call Counter
              </a>
            </div>

          </div>

          {/* RIGHT CARD */}
          <div className="visit-card">

            <div className="visit-card-top">

              <span className="visit-card-label">
                TODAY AT THE BAKERY
              </span>

              <span
                className={`visit-status ${
                  isOpen ? 'open' : 'closed'
                }`}
                aria-live="polite"
              >
                <span
                  className="status-indicator-dot"
                  aria-hidden="true"
                />

                {isOpen ? 'Open Now' : 'Closed'}
              </span>

            </div>

            <div className="visit-card-main">

              <span
                className="visit-card-symbol"
                aria-hidden="true"
              >
                ✦
              </span>

              <h3>
                Fresh bread.
                <br />
                Warm welcome.
              </h3>

              <p>
                Come early for crusty batards. Stay awhile for
                the aromas, coffee and conversation.
              </p>

              <div className="visit-card-features">

                <div className="feature-pill">
                  <span aria-hidden="true">✦</span>
                  100% Wild Sourdough
                </div>

                <div className="feature-pill">
                  <span aria-hidden="true">✦</span>
                  French Normandy Butter
                </div>

                <div className="feature-pill">
                  <span aria-hidden="true">✦</span>
                  Specialty Roast
                </div>

              </div>

            </div>

            <div className="visit-card-bottom">
              <span>Hearth &amp; Grain</span>
              <span>Est. 1987 · Baking Daily</span>
            </div>

          </div>

        </div>


        {/* =================================================
            FULL WIDTH QUICK INQUIRY
        ================================================= */}

        <div className="quick-inquiry-box">

          <div className="inquiry-heading">
            <div>
              <span className="inquiry-eyebrow">
                HAVE A QUESTION?
              </span>

              <h3>Leave a note for the baker.</h3>
            </div>

            <span
              className="inquiry-icon"
              aria-hidden="true"
            >
              ✦
            </span>
          </div>

          <p className="inquiry-description">
            Ask about custom orders, catering, ingredients,
            or anything else before your visit.
          </p>

          <form
            onSubmit={handleInquirySubmit}
            className="inquiry-form"
          >

            <div className="inquiry-fields">

              <div className="inquiry-field">
                <label htmlFor="inquiry-name">
                  Your Name
                </label>

                <input
                  id="inquiry-name"
                  type="text"
                  placeholder="Enter your name"
                  required
                  autoComplete="name"
                  value={inquiryName}
                  onChange={(e) =>
                    setInquiryName(e.target.value)
                  }
                />
              </div>

              <div className="inquiry-field">
                <label htmlFor="inquiry-phone">
                  Phone Number
                </label>

                <input
                  id="inquiry-phone"
                  type="tel"
                  placeholder="+91 XXXXX XXXXX"
                  autoComplete="tel"
                  value={inquiryPhone}
                  onChange={(e) =>
                    setInquiryPhone(e.target.value)
                  }
                />
              </div>

            </div>

            <div className="inquiry-field">
              <label htmlFor="inquiry-message">
                Your Message
              </label>

              <textarea
                id="inquiry-message"
                placeholder="Special request, bulk catering, or ingredient question..."
                required
                rows={3}
                value={inquiryMessage}
                onChange={(e) =>
                  setInquiryMessage(e.target.value)
                }
              />
            </div>

            <div className="inquiry-submit-row">

              <span>
                We usually reply within one business day.
              </span>

              <button
                type="submit"
                className="button button-small button-secondary"
                disabled={sendingInquiry}
              >
                {sendingInquiry
                  ? 'Sending...'
                  : 'Send to Bakery'}

                {!sendingInquiry && (
                  <span aria-hidden="true">→</span>
                )}
              </button>

            </div>

          </form>

        </div>

      </div>
    </section>
  );
}