import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { bakeryApi } from '../services/api';

export default function ReservationModal() {
  const { isReservationOpen, setIsReservationOpen, showToast } = useCart();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    date: new Date().toISOString().split('T')[0],
    time: '9:00 AM',
    guests: 2,
    occasion: 'Morning Coffee & Pastry',
    specialRequests: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successBooking, setSuccessBooking] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isReservationOpen) return null;

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    try {
      const res = await bakeryApi.bookReservation(formData);
      if (res.success && res.data) {
        setSuccessBooking(res.data);
        showToast('Table reserved successfully!', 'success');
      } else {
        throw new Error(res.error || 'Failed to book table');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Error processing reservation.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSuccessBooking(null);
    setIsReservationOpen(false);
  };

  return (
    <div className="modal-backdrop" onClick={handleClose}>
      <div 
        className="modal-content reservation-modal"
        onClick={e => e.stopPropagation()}
        role="dialog"
      >
        <div className="modal-header">
          <div>
            <span className="eyebrow">TABLE &amp; TASTING RESERVATION</span>
            <h3>Join Us at the Hearth</h3>
          </div>
          <button 
            className="modal-close-btn"
            onClick={handleClose}
            aria-label="Close reservation modal"
          >
            ✕
          </button>
        </div>

        {successBooking ? (
          <div className="reservation-success-card">
            <div className="success-icon">☕✨</div>
            <h4>We've Saved Your Table!</h4>
            <p className="success-intro">
              Warm bread and artisanal coffee await your arrival.
            </p>
            <div className="booking-ref-box">
              <span className="ref-label">RESERVATION CODE</span>
              <strong className="ref-code">{successBooking.id}</strong>
            </div>
            <div className="reservation-details-grid">
              <div>
                <small>DATE</small>
                <strong>{successBooking.date}</strong>
              </div>
              <div>
                <small>TIME</small>
                <strong>{successBooking.time}</strong>
              </div>
              <div>
                <small>PARTY</small>
                <strong>{successBooking.guests} {successBooking.guests === 1 ? 'Guest' : 'Guests'}</strong>
              </div>
              <div>
                <small>NAME</small>
                <strong>{successBooking.name}</strong>
              </div>
            </div>
            <button className="button button-primary button-block" onClick={handleClose}>
              Got It, See You Soon!
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="reservation-form">
            {errorMsg && (
              <div className="form-alert error">
                <span>⚠️</span> {errorMsg}
              </div>
            )}

            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="resName">Your Name *</label>
                <input
                  type="text"
                  id="resName"
                  name="name"
                  required
                  placeholder="e.g. Diya Sengupta"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="resPhone">Phone Number *</label>
                <input
                  type="tel"
                  id="resPhone"
                  name="phone"
                  required
                  placeholder="e.g. +91 98765 43210"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="resEmail">Email (For confirmation details)</label>
              <input
                type="email"
                id="resEmail"
                name="email"
                placeholder="e.g. diya@example.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="form-grid three-col">
              <div className="form-group">
                <label htmlFor="resDate">Date *</label>
                <input
                  type="date"
                  id="resDate"
                  name="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={formData.date}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="resTime">Preferred Time *</label>
                <select
                  id="resTime"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                >
                  <option value="8:30 AM">8:30 AM (Opening Bake)</option>
                  <option value="9:30 AM">9:30 AM (Morning Coffee)</option>
                  <option value="11:00 AM">11:00 AM (Brunch Loaves)</option>
                  <option value="1:00 PM">1:00 PM (Afternoon Tea)</option>
                  <option value="3:30 PM">3:30 PM (Pastry Hour)</option>
                  <option value="5:30 PM">5:30 PM (Evening Baguette)</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="resGuests">Guests *</label>
                <select
                  id="resGuests"
                  name="guests"
                  value={formData.guests}
                  onChange={handleChange}
                >
                  <option value="1">1 Person</option>
                  <option value="2">2 People</option>
                  <option value="3">3 People</option>
                  <option value="4">4 People</option>
                  <option value="5">5 People</option>
                  <option value="6">6+ People (Group)</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="resOccasion">Occasion / Visit Type</label>
              <select
                id="resOccasion"
                name="occasion"
                value={formData.occasion}
                onChange={handleChange}
              >
                <option value="Morning Coffee & Pastry">Morning Coffee &amp; Pastry</option>
                <option value="Sourdough Tasting Experience">Sourdough Tasting Experience</option>
                <option value="Casual Catch-up">Casual Catch-up</option>
                <option value="Bakery Tour & Consultation">Bakery Tour &amp; Consultation</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="resSpecial">Special Dietary or Seating Requests</label>
              <input
                type="text"
                id="resSpecial"
                name="specialRequests"
                placeholder="e.g. Quiet corner, high chair, vegan butter..."
                value={formData.specialRequests}
                onChange={handleChange}
              />
            </div>

            <div className="modal-footer-actions">
              <button
                type="button"
                className="button button-secondary"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="button button-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Reserving...' : 'Confirm Table Reservation'}
                <span aria-hidden="true">→</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
