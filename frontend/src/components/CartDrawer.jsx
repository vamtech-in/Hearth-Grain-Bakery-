import React from 'react';
import { useCart } from '../context/CartContext';

export default function CartDrawer() {
  const {
    cartItems,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    subtotal,
    cartCount,
    setIsCheckoutOpen
  } = useCart();

  if (!isCartOpen) return null;

  const handleCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  return (
    <div className="cart-backdrop" onClick={() => setIsCartOpen(false)}>
      <aside 
        className="cart-drawer" 
        onClick={e => e.stopPropagation()}
        role="dialog" 
        aria-label="Your fresh bakery basket"
      >
        <div className="cart-header">
          <div className="cart-title-wrapper">
            <span className="cart-icon">🥖</span>
            <div>
              <h3>Your Bakery Basket</h3>
              <p className="cart-subtitle">{cartCount} fresh {cartCount === 1 ? 'item' : 'items'} selected</p>
            </div>
          </div>
          <button 
            className="cart-close-btn" 
            onClick={() => setIsCartOpen(false)}
            aria-label="Close basket"
          >
            ✕
          </button>
        </div>

        <div className="cart-body">
          {cartItems.length === 0 ? (
            <div className="cart-empty-state">
              <div className="cart-empty-icon">🥐</div>
              <h4>Your basket is empty</h4>
              <p>Fresh baguettes, flaky croissants, and morning bakes are waiting for you.</p>
              <button 
                className="button button-primary"
                onClick={() => {
                  setIsCartOpen(false);
                  const menuEl = document.getElementById('menu');
                  if (menuEl) menuEl.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Explore Today's Bake
              </button>
            </div>
          ) : (
            <ul className="cart-item-list">
              {cartItems.map(item => (
                <li key={item.id} className="cart-item-card">
                  <img 
                    src={item.image || '/images/wheatleaf.jpg'} 
                    alt={item.name} 
                    className="cart-item-img" 
                  />
                  <div className="cart-item-details">
                    <div className="cart-item-head">
                      <strong className="cart-item-name">{item.name}</strong>
                      <button 
                        className="cart-remove-btn"
                        onClick={() => removeFromCart(item.id)}
                        title="Remove item"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="cart-item-category">{item.category}</div>
                    <div className="cart-item-foot">
                      <div className="cart-stepper">
                        <button 
                          onClick={() => updateQuantity(item.id, -1)}
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>
                        <span>{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, 1)}
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                      <span className="cart-item-subtotal">₹{item.price * item.quantity}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="cart-footer">
            <div className="cart-summary-row">
              <span>Subtotal</span>
              <span>₹{subtotal}</span>
            </div>
            <div className="cart-summary-row fee-row">
              <span>Eco-Bakery Packaging</span>
              <span>₹15</span>
            </div>
            <div className="cart-summary-row total-row">
              <strong>Estimated Total</strong>
              <strong>₹{subtotal + 15}</strong>
            </div>
            <button 
              className="button button-primary button-block checkout-trigger-btn"
              onClick={handleCheckout}
            >
              Proceed to Checkout
              <span aria-hidden="true">→</span>
            </button>
            <p className="cart-footnote">Freshly packed in recycled artisan kraft paper bags.</p>
          </div>
        )}
      </aside>
    </div>
  );
}
