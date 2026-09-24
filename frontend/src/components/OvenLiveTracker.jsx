import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';

const BAKE_BATCHES = [
  {
    id: 'batch-1',
    name: 'Baguette Tradition & Olive Focaccia',
    category: 'bread',
    itemRef: { id: 'fb-br-3', name: 'Baguette Tradition', price: 140, image: '/images/Bagutee.jpg', category: 'bread' },
    status: 'In Oven (Caramelizing Crust)',
    deck: 'Hearth Deck #1 • 245°C',
    targetMinutes: 12,
    progressPercent: 78,
    timeLabel: 'Next Drop in:',
    icon: '🥖'
  },
  {
    id: 'batch-2',
    name: '84-Layer Butter Croissants & Babka',
    category: 'pastry',
    itemRef: { id: 'fb-pa-1', name: 'Butter Croissant', price: 110, image: '/images/butter.jpg', category: 'pastry' },
    status: 'Final Proof & Lamination',
    deck: 'Deck #2 • 210°C Deck',
    targetMinutes: 34,
    progressPercent: 45,
    timeLabel: 'Baking soon at:',
    icon: '🥐'
  },
  {
    id: 'batch-3',
    name: 'Wild Country Sourdough Loaves',
    category: 'bread',
    itemRef: { id: 'fb-br-1', name: 'Country Sourdough', price: 220, image: '/images/wheatleaf.jpg', category: 'bread' },
    status: 'Cold Retardation Ferment',
    deck: 'Stone Deck #3 • 250°C',
    targetMinutes: 72,
    progressPercent: 20,
    timeLabel: 'Afternoon Bake at:',
    icon: '🍞'
  }
];

export default function OvenLiveTracker() {
  const { addToCart, openItemDetail, showToast } = useCart();
  const [activeBatchIndex, setActiveBatchIndex] = useState(0);
  const [secondsRemaining, setSecondsRemaining] = useState(12 * 60 + 45); // 12m 45s

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsRemaining(prev => {
        if (prev <= 1) {
          return 15 * 60; // reset to 15m
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (totalSec) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const currentBatch = BAKE_BATCHES[activeBatchIndex];

  const handleReserveBatch = (batch) => {
    if (batch.itemRef) {
      addToCart(batch.itemRef, 1);
      showToast(`🔥 Reserved 1x "${batch.itemRef.name}" from the next hot oven batch!`, 'success');
    }
  };

  return (
    <section className="oven-tracker-section">
      <div className="container">
        <div className="oven-tracker-wrapper">
          
          {/* Header Bar */}
          <div className="oven-tracker-header">
            <div className="oven-status-pill">
              <span className="live-pulsing-dot" aria-hidden="true"></span>
              <span className="live-status-text">LIVE HEARTH MONITOR</span>
            </div>
            <span className="oven-temperature-tag">
              🔥 {currentBatch.deck}
            </span>
          </div>

          {/* Main Display Grid */}
          <div className="oven-tracker-grid">
            
            {/* Left: Active Batch Highlight */}
            <div className="oven-tracker-main">
              <div className="oven-badge-row">
                <span className="batch-stage-tag">{currentBatch.status}</span>
                <span className="batch-icon">{currentBatch.icon}</span>
              </div>

              <h3 className="current-batch-title">{currentBatch.name}</h3>
              <p className="current-batch-desc">
                Stone-baked with live wood-steam injection. Crisp golden crust emerging hot from our deck ovens.
              </p>

              {/* Progress Bar & Countdown */}
              <div className="bake-progress-container">
                <div className="bake-progress-labels">
                  <span className="progress-phase">Bake Stage: <strong>Maillard Crust Browning</strong></span>
                  <span className="progress-percentage">{currentBatch.progressPercent}% Ready</span>
                </div>
                <div className="bake-progress-track">
                  <div 
                    className="bake-progress-fill" 
                    style={{ width: `${currentBatch.progressPercent}%` }}
                  ></div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="oven-actions-row">
                <button
                  type="button"
                  className="button button-primary reserve-loaf-btn"
                  onClick={() => handleReserveBatch(currentBatch)}
                >
                  🥖 Reserve Fresh From This Batch
                </button>
                <button
                  type="button"
                  className="button button-secondary inspect-btn"
                  onClick={() => openItemDetail(currentBatch.itemRef)}
                >
                  View Bake Specs
                </button>
              </div>
            </div>

            {/* Right: Big Countdown Clock & Today's Carousel */}
            <div className="oven-tracker-sidebar">
              <div className="countdown-display-card">
                <span className="countdown-eyebrow">ESTIMATED DROP TIME</span>
                <div className="countdown-clock">
                  <div className="countdown-digits">{formatTime(secondsRemaining)}</div>
                  <span className="countdown-unit">MINUTES : SECONDS</span>
                </div>
                <div className="countdown-flame-note">
                  <span>♨️ Best enjoyed warm within 45 minutes</span>
                </div>
              </div>

              {/* Batch Selector Tabs */}
              <div className="batch-switcher-list">
                {BAKE_BATCHES.map((batch, idx) => (
                  <button
                    key={batch.id}
                    type="button"
                    className={`batch-tab-btn ${activeBatchIndex === idx ? 'active' : ''}`}
                    onClick={() => setActiveBatchIndex(idx)}
                  >
                    <span className="batch-tab-icon">{batch.icon}</span>
                    <div className="batch-tab-info">
                      <span className="batch-tab-name">{batch.name}</span>
                      <span className="batch-tab-deck">{batch.deck.split('•')[0]}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
