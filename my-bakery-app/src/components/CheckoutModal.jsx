import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { bakeryApi } from '../services/api';

export default function CheckoutModal() {
  const {
    isCheckoutOpen,
    setIsCheckoutOpen,
    cartItems,
    subtotal,
    clearCart,
    openTracker,
    showToast
  } = useCart();

  const [fulfillmentType, setFulfillmentType] = useState('pickup'); // 'pickup' | 'delivery'
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    pickupTime: 'Today, within 45 mins',
    deliveryAddress: '',
    paymentMethod: 'counter', // 'counter' | 'upi' | 'cod'
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isCheckoutOpen) return null;

  const packagingFee = fulfillmentType === 'delivery' ? 25 : 15;
  const grandTotal = subtotal + packagingFee;

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.customerName.trim() || !formData.customerPhone.trim()) {
      setErrorMsg('Please enter your name and contact phone number.');
      return;
    }

    if (fulfillmentType === 'delivery' && !formData.deliveryAddress.trim()) {
      setErrorMsg('Please provide your complete delivery address.');
      return;
    }

    setIsSubmitting(true);
    try {
      const orderPayload = {
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        customerEmail: formData.customerEmail,
        fulfillmentType,
        pickupTime: fulfillmentType === 'pickup' ? formData.pickupTime : undefined,
        deliveryAddress: fulfillmentType === 'delivery' ? formData.deliveryAddress : undefined,
        paymentMethod: formData.paymentMethod,
        notes: formData.notes,
        items: cartItems.map(i => ({
          id: i.id,
          name: i.name,
          price: i.price,
          quantity: i.quantity
        }))
      };

      const res = await bakeryApi.createOrder(orderPayload);
      if (res.success && res.data) {
        showToast(`Order #${res.data.id} placed successfully!`, 'success');
        clearCart();
        setIsCheckoutOpen(false);
        openTracker(res.data.id);
      } else {
        throw new Error(res.error || 'Failed to place order');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Error processing order. Please check backend connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={() => setIsCheckoutOpen(false)}>
      <div 
        className="modal-content checkout-modal"
        onClick={e => e.stopPropagation()}
        role="dialog"
      >
        <div className="modal-header">
          <div>
            <span className="eyebrow">ORDER FRESH BAKES</span>
            <h3>Checkout &amp; Confirmation</h3>
          </div>
          <button 
            className="modal-close-btn"
            onClick={() => setIsCheckoutOpen(false)}
            aria-label="Close checkout"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="checkout-form">
          {errorMsg && (
            <div className="form-alert error">
              <span>⚠️</span> {errorMsg}
            </div>
          )}

          {/* Fulfillment Toggle */}
          <div className="fulfillment-toggle">
            <button
              type="button"
              className={`toggle-tab ${fulfillmentType === 'pickup' ? 'active' : ''}`}
              onClick={() => setFulfillmentType('pickup')}
            >
              <span className="tab-icon">🏬</span>
              <div>
                <strong>Bakery Pickup</strong>
                <small>24 Grain Street (Free)</small>
              </div>
            </button>

            <button
              type="button"
              className={`toggle-tab ${fulfillmentType === 'delivery' ? 'active' : ''}`}
              onClick={() => setFulfillmentType('delivery')}
            >
              <span className="tab-icon">🚲</span>
              <div>
                <strong>Artisan Delivery</strong>
                <small>Warm bicycle delivery (₹25)</small>
              </div>
            </button>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="customerName">Full Name *</label>
              <input
                type="text"
                id="customerName"
                name="customerName"
                required
                placeholder="e.g. Aarav Sharma"
                value={formData.customerName}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="customerPhone">Phone Number *</label>
              <input
                type="tel"
                id="customerPhone"
                name="customerPhone"
                required
                placeholder="e.g. +91 98765 43210"
                value={formData.customerPhone}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="customerEmail">Email Address (Optional for e-receipt)</label>
            <input
              type="email"
              id="customerEmail"
              name="customerEmail"
              placeholder="e.g. aarav@example.com"
              value={formData.customerEmail}
              onChange={handleChange}
            />
          </div>

          {fulfillmentType === 'pickup' ? (
            <div className="form-group">
              <label htmlFor="pickupTime">Preferred Pickup Slot</label>
              <select 
                id="pickupTime"
                name="pickupTime"
                value={formData.pickupTime}
                onChange={handleChange}
              >
                <option value="Today, within 45 mins">Warm & Ready in 30-45 mins</option>
                <option value="Morning Bake (8:30 AM - 10:30 AM)">Morning Bake (8:30 AM – 10:30 AM)</option>
                <option value="Noon Fresh (12:00 PM - 2:00 PM)">Noon Fresh (12:00 PM – 2:00 PM)</option>
                <option value="Evening Tea (4:30 PM - 6:30 PM)">Evening Tea (4:30 PM – 6:30 PM)</option>
              </select>
            </div>
          ) : (
            <div className="form-group">
              <label htmlFor="deliveryAddress">Delivery Address &amp; Landmarks *</label>
              <textarea
                id="deliveryAddress"
                name="deliveryAddress"
                required
                rows="2"
                placeholder="Apartment, Street address, Landmark..."
                value={formData.deliveryAddress}
                onChange={handleChange}
              />
            </div>
          )}

          <div className="form-group">
            <label>Payment Method</label>
            <div className="payment-options">
              <label className={`payment-option ${formData.paymentMethod === 'counter' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="counter"
                  checked={formData.paymentMethod === 'counter'}
                  onChange={handleChange}
                />
                <span>Pay at Counter / Pick-up</span>
              </label>
              <label className={`payment-option ${formData.paymentMethod === 'upi' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="upi"
                  checked={formData.paymentMethod === 'upi'}
                  onChange={handleChange}
                />
                <span>UPI / QR Scan</span>
              </label>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="notes">Special Baker Notes (Optional)</label>
            <input
              type="text"
              id="notes"
              name="notes"
              placeholder="e.g. Please slice sourdough, extra napkins..."
              value={formData.notes}
              onChange={handleChange}
            />
          </div>

          <div className="checkout-summary-box">
            <div className="summary-line">
              <span>Items ({cartItems.reduce((s, i) => s + i.quantity, 0)})</span>
              <span>₹{subtotal}</span>
            </div>
            <div className="summary-line">
              <span>{fulfillmentType === 'delivery' ? 'Bicycle Delivery' : 'Artisan Packaging'}</span>
              <span>₹{packagingFee}</span>
            </div>
            <div className="summary-line total">
              <strong>Total Amount</strong>
              <strong className="price-tag">₹{grandTotal}</strong>
            </div>
          </div>

          <div className="modal-footer-actions">
            <button
              type="button"
              className="button button-secondary"
              onClick={() => setIsCheckoutOpen(false)}
              disabled={isSubmitting}
            >
              Back to Basket
            </button>
            <button
              type="submit"
              className="button button-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Baking Order...' : `Confirm Order • ₹${grandTotal}`}
              <span aria-hidden="true">→</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
