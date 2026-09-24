import React, { useState } from 'react';
import { useCart } from '../context/CartContext';

// Extended artisan metadata mapping for bakery offerings
const ARTISAN_DETAILS = {
  'Country Sourdough': {
    hydration: '78%',
    fermentHours: '36 Hours',
    flour: 'Stoneground Whole Wheat & French T65',
    crust: 'Thick, blistered, caramelized ear',
    crumb: 'Open, airy custard texture',
    tastingNotes: 'Wild honey, roasted hazelnut, subtle clean lactic acidity',
    allergens: ['Gluten (Wheat)'],
    dietary: ['100% Vegan', 'Wild Sourdough', 'No Commercial Yeast'],
    bestServed: 'Toasted with salted cultured butter or warm bone broth',
    pairing: { name: 'Oat Milk Flat White', price: 130, category: 'coffee', image: '/images/oat.jpg' }
  },
  'Seeded Rye': {
    hydration: '75%',
    fermentHours: '30 Hours',
    flour: 'Dark Bavarian Rye & Organic Khorasan',
    crust: 'Packed roasted seeds crust',
    crumb: 'Dense, aromatic, deeply nourishing',
    tastingNotes: 'Toasted sunflower, caraway seed warmth, earthy rye grain',
    allergens: ['Gluten (Rye/Wheat)', 'Sesame'],
    dietary: ['100% Vegan', 'High Fiber', 'Ancient Grains'],
    bestServed: 'Sliced thin with smoked salmon, aged gouda, or pickled cucumber',
    pairing: { name: 'Cold Brew', price: 140, category: 'coffee', image: '/images/cold.jpg' }
  },
  'Baguette Tradition': {
    hydration: '72%',
    fermentHours: '24 Hours',
    flour: 'Label Rouge French T55 Wheat',
    crust: 'Shatteringly crisp, blistered gold',
    crumb: 'Creamy honeycomb crumb with sweet aroma',
    tastingNotes: 'Sweet milk, toasted grain, subtle sea salt mineral crunch',
    allergens: ['Gluten (Wheat)'],
    dietary: ['100% Vegan', 'Bordeaux Heritage'],
    bestServed: 'Within 4 hours of oven bake, dipped in extra virgin olive oil',
    pairing: { name: 'Single-Origin Espresso', price: 90, category: 'coffee', image: '/images/espresso.jpg' }
  },
  'Whole Wheat Loaf': {
    hydration: '80%',
    fermentHours: '28 Hours',
    flour: '100% Organic Red Spring Wheat Stoneground in-house',
    crust: 'Soft golden toasted bran crust',
    crumb: 'Tender, pillowy, whole-grain structure',
    tastingNotes: 'Nutty malt, toasted oats, mild molasses sweetness',
    allergens: ['Gluten (Wheat)'],
    dietary: ['100% Vegan', '100% Whole Grain', 'No Added Sugar'],
    bestServed: 'Morning toast with almond butter or savory avocado mash',
    pairing: { name: 'Oat Milk Flat White', price: 130, category: 'coffee', image: '/images/oat.jpg' }
  },
  'Olive & Rosemary Focaccia': {
    hydration: '85%',
    fermentHours: '24 Hours',
    flour: 'Italian Tipo 00 & Semolina Rimacinata',
    crust: 'Golden olive-oil fried bottom, crispy top',
    crumb: 'Light, cloud-like, oil-infused airy bubbles',
    tastingNotes: 'Kalamata olive salinity, fresh mountain rosemary, grassy virgin olive oil',
    allergens: ['Gluten (Wheat)'],
    dietary: ['100% Vegan', 'Extra Virgin Olive Oil Only'],
    bestServed: 'Warmed gently at 180°C with balsamic glaze or marinara dip',
    pairing: { name: 'Single-Origin Espresso', price: 90, category: 'coffee', image: '/images/espresso.jpg' }
  },
  'Butter Croissant': {
    hydration: 'N/A (Laminated)',
    fermentHours: '72 Hours',
    flour: 'French T45 Flour & 84% Normandy Beurre d’Isigny AOP',
    crust: '84 golden caramelized gossamer layers',
    crumb: 'Honeycomb lamination with melting center',
    tastingNotes: 'Sweet cultured butter, hazelnut aroma, delicate caramelized sugar',
    allergens: ['Gluten (Wheat)', 'Dairy (Normandy Butter)'],
    dietary: ['Vegetarian', 'AOP Protected Butter'],
    bestServed: 'Warm from the morning 8:00 AM bake with café au lait',
    pairing: { name: 'Cappuccino', price: 120, category: 'coffee', image: '/images/espresso.jpg' }
  },
  'Almond Croissant': {
    hydration: 'N/A (Laminated)',
    fermentHours: '72 Hours',
    flour: 'French T45 & Sicilian Almond Meal',
    crust: 'Toasted almond flakes, powdered sugar dusting',
    crumb: 'Twice-baked with rich vanilla frangipane cream',
    tastingNotes: 'Roasted marzipan, Tahitian vanilla, sweet butter, toasted crunch',
    allergens: ['Gluten (Wheat)', 'Dairy', 'Tree Nuts (Almonds)', 'Eggs'],
    dietary: ['Vegetarian', 'Twice-Baked Special'],
    bestServed: 'Afternoon treat with a dark roast espresso',
    pairing: { name: 'Single-Origin Espresso', price: 90, category: 'coffee', image: '/images/espresso.jpg' }
  },
  'Cinnamon Babka': {
    hydration: 'Enriched Brioche',
    fermentHours: '24 Hours',
    flour: 'Enriched Brioche with Ceylon Cinnamon & Muscovado',
    crust: 'Sticky sugar glaze, golden braided ribbon',
    crumb: 'Rich, pillowy, buttery ribbon swirls',
    tastingNotes: 'Warm spicy cinnamon, caramelized brown sugar, buttery brioche',
    allergens: ['Gluten (Wheat)', 'Dairy', 'Eggs'],
    dietary: ['Vegetarian', 'Organic Ceylon Spice'],
    bestServed: 'Warmed slightly in oven with a dollop of clotted cream',
    pairing: { name: 'Cold Brew', price: 140, category: 'coffee', image: '/images/cold.jpg' }
  },
  'Pain au Chocolat': {
    hydration: 'N/A (Laminated)',
    fermentHours: '72 Hours',
    flour: 'French T45 & 70% Valrhona Dark Chocolate Batons',
    crust: 'Crisp parallel lamination ridges',
    crumb: 'Flaky pastry pockets embracing melted cocoa',
    tastingNotes: 'Bittersweet dark chocolate, rich lactic butter, toasted pastry',
    allergens: ['Gluten (Wheat)', 'Dairy', 'Soy Lecithin (Chocolate)'],
    dietary: ['Vegetarian', 'Valrhona Grand Cru'],
    bestServed: 'Warm so the chocolate batons gently soften',
    pairing: { name: 'Oat Milk Flat White', price: 130, category: 'coffee', image: '/images/oat.jpg' }
  },
  'Single-Origin Espresso': {
    hydration: '1:2 Brew Ratio',
    fermentHours: 'Anaerobic Natural',
    flour: '100% Arabica (Yirgacheffe, Ethiopia)',
    crust: 'Thick hazelnut crema',
    crumb: 'Medium-light body, silky texture',
    tastingNotes: 'Bergamot, jasmine blossom, bright raspberry, candied lemon',
    allergens: ['None'],
    dietary: ['100% Vegan', 'Direct Trade', 'Ethically Sourced'],
    bestServed: 'Freshly extracted within 30 seconds alongside sparkling water',
    pairing: { name: 'Butter Croissant', price: 110, category: 'pastry', image: '/images/butter.jpg' }
  },
  'Oat Milk Flat White': {
    hydration: 'Espresso + Microfoam',
    fermentHours: 'House-Steeped',
    flour: 'Specialty Espresso Blend & Organic Swedish Oats',
    crust: 'Velvety micro-foam latte art',
    crumb: 'Creamy, luscious, balanced body',
    tastingNotes: 'Toasted oats, milk chocolate, praline sweetness',
    allergens: ['Oats (Gluten-Free certified)'],
    dietary: ['100% Plant-Based / Dairy-Free', 'No Added Sugar'],
    bestServed: 'Hot at 62°C for optimal natural sweetness',
    pairing: { name: 'Pain au Chocolat', price: 130, category: 'pastry', image: '/images/pain.jpg' }
  },
  'Cold Brew': {
    hydration: '18h Immersion',
    fermentHours: '18h Steeped',
    flour: 'Guatemalan Huehuetenango Single-Origin',
    crust: 'Served over crystal clear ice rock',
    crumb: 'Ultra-smooth, round mouthfeel',
    tastingNotes: 'Dark cocoa nibs, black cherry, zero harsh bitterness',
    allergens: ['None'],
    dietary: ['100% Vegan', 'Sugar-Free', 'Low Acidity'],
    bestServed: 'Chilled over clear artisanal ice cubes',
    pairing: { name: 'Cinnamon Babka', price: 180, category: 'pastry', image: '/images/babka.jpg' }
  },
  'Cappuccino': {
    hydration: '1:1:1 Ratio',
    fermentHours: 'Artisan Roast',
    flour: 'Double shot espresso + Whole farm milk',
    crust: 'Dense velvety froth crown',
    crumb: 'Deep rich coffee body with creamy contrast',
    tastingNotes: 'Caramel malt, bittersweet dark chocolate, sweet cream',
    allergens: ['Dairy (Milk) / Oat available'],
    dietary: ['Vegetarian', 'Organic Farm Dairy'],
    bestServed: 'With a dusting of organic raw cocoa',
    pairing: { name: 'Almond Croissant', price: 150, category: 'pastry', image: '/images/almonds.jpg' }
  }
};

export default function ItemDetailModal() {
  const { selectedItemDetail, closeItemDetail, addToCart } = useCart();
  const [qty, setQty] = useState(1);

  if (!selectedItemDetail) return null;

  const item = selectedItemDetail;
  const details = ARTISAN_DETAILS[item.name] || {
    hydration: '75%',
    fermentHours: '24-36 Hours',
    flour: 'Artisan stoneground flours & natural spring water',
    crust: 'Caramelized stone-baked crust',
    crumb: 'Natural wild yeast leavened crumb',
    tastingNotes: 'Roasted grain, wild honey, natural aroma',
    allergens: ['Gluten (Wheat)'],
    dietary: ['Artisan Crafted', 'Wild Fermented'],
    bestServed: 'Fresh from our stone hearth oven',
    pairing: { name: 'Single-Origin Espresso', price: 90, category: 'coffee', image: '/images/espresso.jpg' }
  };

  const handleAddToCart = () => {
    addToCart(item, qty);
    closeItemDetail();
  };

  const handleAddPairing = () => {
    if (details.pairing) {
      addToCart({
        id: `pair-${Date.now()}`,
        name: details.pairing.name,
        price: details.pairing.price,
        category: details.pairing.category,
        image: details.pairing.image
      }, 1);
    }
  };

  return (
    <div className="modal-backdrop" onClick={closeItemDetail} role="dialog" aria-modal="true">
      <div 
        className="modal-content item-detail-modal" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="item-detail-hero-banner">
          <img 
            src={item.image || '/images/wheatleaf.jpg'} 
            alt={item.name} 
            className="item-detail-image" 
          />
          <button 
            type="button" 
            className="modal-close-btn floating-close-btn" 
            onClick={closeItemDetail}
            aria-label="Close modal"
          >
            ✕
          </button>
          {!item.inStock && (
            <span className="item-detail-soldout-flag">Sold Out Today</span>
          )}
          <div className="item-detail-category-badge">
            {item.category?.toUpperCase() || 'ARTISAN OFFERING'}
          </div>
        </div>

        <div className="item-detail-body">
          <div className="item-detail-header-row">
            <div>
              <h2 className="item-detail-title">{item.name}</h2>
              <p className="item-detail-subtitle">{item.description}</p>
            </div>
            <div className="item-detail-price-tag">
              <span className="price-currency">₹</span>
              <span className="price-amount">{item.price}</span>
            </div>
          </div>

          {/* Artisan Specs Pill Grid */}
          <div className="artisan-specs-grid">
            <div className="spec-item">
              <span className="spec-icon">⏳</span>
              <div className="spec-content">
                <span className="spec-label">Fermentation</span>
                <span className="spec-value">{details.fermentHours}</span>
              </div>
            </div>
            <div className="spec-item">
              <span className="spec-icon">💧</span>
              <div className="spec-content">
                <span className="spec-label">Hydration / Ratio</span>
                <span className="spec-value">{details.hydration}</span>
              </div>
            </div>
            <div className="spec-item">
              <span className="spec-icon">🌾</span>
              <div className="spec-content">
                <span className="spec-label">Grain Origin</span>
                <span className="spec-value">Stone-Milled</span>
              </div>
            </div>
            <div className="spec-item">
              <span className="spec-icon">🔥</span>
              <div className="spec-content">
                <span className="spec-label">Oven Deck</span>
                <span className="spec-value">Stone Hearth 240°C</span>
              </div>
            </div>
          </div>

          {/* Sourcing & Ingredients */}
          <div className="detail-section">
            <h4 className="detail-section-title">🌾 Flour Sourcing & Ingredients</h4>
            <p className="detail-section-text">{details.flour}</p>
          </div>

          {/* Tasting Notes */}
          <div className="detail-section">
            <h4 className="detail-section-title">✨ Flavor & Tasting Notes</h4>
            <div className="tasting-notes-box">
              <p className="tasting-notes-text">"{details.tastingNotes}"</p>
            </div>
          </div>

          {/* Dietary & Allergen Badges */}
          <div className="detail-section">
            <h4 className="detail-section-title">🌱 Dietary & Allergen Guide</h4>
            <div className="dietary-tags-row">
              {details.dietary.map((badge, idx) => (
                <span key={`diet-${idx}`} className="dietary-badge-pill green">
                  ✓ {badge}
                </span>
              ))}
              {details.allergens.map((allergen, idx) => (
                <span key={`all-${idx}`} className="dietary-badge-pill warn">
                  ⚠️ Contains: {allergen}
                </span>
              ))}
            </div>
          </div>

          {/* Serving suggestion */}
          {details.bestServed && (
            <div className="detail-section">
              <h4 className="detail-section-title">🍽️ Baker's Serving Recommendation</h4>
              <p className="detail-section-text italic">{details.bestServed}</p>
            </div>
          )}

          {/* Perfect Pairing Callout */}
          {details.pairing && (
            <div className="pairing-callout-card">
              <div className="pairing-left">
                <span className="pairing-eyebrow">☕ MASTER PAIRING</span>
                <h5 className="pairing-title">{details.pairing.name}</h5>
                <span className="pairing-price">+ ₹{details.pairing.price}</span>
              </div>
              <button 
                type="button" 
                className="button button-secondary button-small"
                onClick={handleAddPairing}
              >
                + Add Pairing
              </button>
            </div>
          )}

          {/* Bottom Action Bar */}
          <div className="item-detail-footer-actions">
            <div className="quantity-selector-pill">
              <button 
                type="button" 
                className="qty-btn"
                onClick={() => setQty(Math.max(1, qty - 1))}
                disabled={qty <= 1}
              >
                −
              </button>
              <span className="qty-number">{qty}</span>
              <button 
                type="button" 
                className="qty-btn"
                onClick={() => setQty(qty + 1)}
              >
                +
              </button>
            </div>

            {item.inStock ? (
              <button 
                type="button" 
                className="button button-primary button-large add-basket-btn"
                onClick={handleAddToCart}
              >
                Add {qty} to Basket • ₹{item.price * qty}
              </button>
            ) : (
              <button 
                type="button" 
                className="button button-secondary button-large add-basket-btn"
                disabled
              >
                Sold Out for Today
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
