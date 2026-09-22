import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { bakeryApi } from '../services/api';

export default function OrderTrackerModal() {
  const { isTrackerOpen, setIsTrackerOpen, activeTrackingId } = useCart();
  const [searchInput, setSearchInput] = useState('');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchOrder = async (queryId) => {
    if (!queryId) return;
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await bakeryApi.getOrderById(queryId);
      if (res.success && res.data) {
        setOrder(res.data);
      } else {
        setOrder(null);
        setErrorMsg('Order not found. Check your Order ID or registered phone number.');
      }
    } catch (err) {
      setOrder(null);
      setErrorMsg(err.message || 'Unable to fetch order status.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isTrackerOpen) {
      if (activeTrackingId) {
        setSearchInput(activeTrackingId);
        fetchOrder(activeTrackingId);
      } else if (!order) {
        // Look for any last saved order in localStorage
        const lastId = localStorage.getItem('hg_last_order_id');
        if (lastId) {
          setSearchInput(lastId);
          fetchOrder(lastId);
        }
      }
    }
  }, [isTrackerOpen, activeTrackingId]);

  // Keep last order ID saved for easy lookup
  useEffect(() => {
    if (order && order.id) {
      localStorage.setItem('hg_last_order_id', order.id);
    }
  }, [order]);

  if (!isTrackerOpen) return null;

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      fetchOrder(searchInput.trim());
    }
  };

  const getStepStatus = (stepIndex) => {
    if (!order) return 'pending';
    const status = order.status || '';

    // Step 0: Received
    // Step 1: Baking
    // Step 2: Ready
    // Step 3: Completed
    let currentStep = 0;
    if (status === 'Received') currentStep = 0;
    else if (status.includes('Baking') || status.includes('Oven')) currentStep = 1;
    else if (status.includes('Ready') || status.includes('Delivery')) currentStep = 2;
    else if (status === 'Completed') currentStep = 3;

    if (stepIndex < currentStep) return 'completed';
    if (stepIndex === currentStep) return 'active';
    return 'upcoming';
  };

  return (
    <div className="modal-backdrop" onClick={() => setIsTrackerOpen(false)}>
      <div 
        className="modal-content tracker-modal"
        onClick={e => e.stopPropagation()}
        role="dialog"
      >
        <div className="modal-header">
          <div>
            <span className="eyebrow">LIVE OVEN TRACKER</span>
            <h3>Order Status &amp; Progress</h3>
          </div>
          <button 
            className="modal-close-btn"
            onClick={() => setIsTrackerOpen(false)}
            aria-label="Close tracker"
          >
            ✕
          </button>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="tracker-search-form">
          <div className="tracker-input-group">
            <input
              type="text"
              placeholder="Enter Order # (e.g. HG-7821) or Phone..."
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
            />
            <button type="submit" className="button button-primary" disabled={loading}>
              {loading ? 'Searching...' : 'Track'}
            </button>
          </div>
        </form>

        {errorMsg && (
          <div className="form-alert error tracker-alert">
            <span>⚠️</span> {errorMsg}
          </div>
        )}

        {order ? (
          <div className="tracker-result-card">
            <div className="tracker-header-badge">
              <div>
                <span className="order-badge-label">ORDER NUMBER</span>
                <h4 className="order-number-display">{order.id}</h4>
              </div>
              <div className={`status-pill ${order.status.toLowerCase().replace(/[\s\/]/g, '-')}`}>
                <span className="pulsing-dot"></span>
                {order.status}
              </div>
            </div>

            {/* Stepper Progress */}
            <div className="tracker-stepper">
              <div className={`step-node ${getStepStatus(0)}`}>
                <div className="step-circle">📝</div>
                <span className="step-label">Order Confirmed</span>
              </div>
              <div className={`step-connector ${getStepStatus(1)}`}></div>

              <div className={`step-node ${getStepStatus(1)}`}>
                <div className="step-circle">🔥</div>
                <span className="step-label">In the Oven</span>
              </div>
              <div className={`step-connector ${getStepStatus(2)}`}></div>

              <div className={`step-node ${getStepStatus(2)}`}>
                <div className="step-circle">🥖</div>
                <span className="step-label">{order.fulfillmentType === 'delivery' ? 'Out for Delivery' : 'Ready at Counter'}</span>
              </div>
              <div className={`step-connector ${getStepStatus(3)}`}></div>

              <div className={`step-node ${getStepStatus(3)}`}>
                <div className="step-circle">✨</div>
                <span className="step-label">Delivered &amp; Enjoyed</span>
              </div>
            </div>

            {/* Order Details */}
            <div className="tracker-order-summary">
              <div className="info-grid">
                <div>
                  <small>CUSTOMER</small>
                  <strong>{order.customerName}</strong>
                </div>
                <div>
                  <small>TYPE</small>
                  <strong>{order.fulfillmentType === 'delivery' ? '🚲 Bicycle Delivery' : '🏬 Counter Pickup'}</strong>
                </div>
                <div>
                  <small>ESTIMATED TIME</small>
                  <strong>{order.pickupTime || 'Today'}</strong>
                </div>
                <div>
                  <small>PAYMENT</small>
                  <strong>{order.paymentMethod === 'counter' ? 'Pay at Counter' : 'UPI Online'}</strong>
                </div>
              </div>

              {order.deliveryAddress && (
                <div className="address-banner">
                  <small>DELIVERY ADDRESS</small>
                  <p>{order.deliveryAddress}</p>
                </div>
              )}

              <div className="items-list-box">
                <small>ITEMS ORDERED</small>
                <ul>
                  {order.items.map((i, idx) => (
                    <li key={idx}>
                      <span>{i.quantity}x {i.name}</span>
                      <span>₹{i.price * i.quantity}</span>
                    </li>
                  ))}
                </ul>
                <div className="total-row">
                  <span>Grand Total</span>
                  <strong>₹{order.total}</strong>
                </div>
              </div>
            </div>

            <div className="tracker-actions">
              <button 
                type="button" 
                className="button button-secondary"
                onClick={() => fetchOrder(order.id)}
              >
                ↻ Refresh Status
              </button>
            </div>
          </div>
        ) : (
          !loading && (
            <div className="tracker-empty-state">
              <span className="empty-oven-icon">🥖</span>
              <p>Enter your order number or phone above to watch your loaf bake in real time!</p>
            </div>
          )
        )}
      </div>
    </div>
  );
}
