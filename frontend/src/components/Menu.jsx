import React, { useState, useEffect } from 'react';
import { bakeryApi } from '../services/api';
import { useCart } from '../context/CartContext';

// Shown whenever the live bakery API is unreachable or returns nothing,
// so the menu section is never blank for the visitor.
const FALLBACK_MENU = [
  { id: 'fb-br-1', name: 'Country Sourdough', category: 'bread', price: 220, description: '24-hour wild-yeast fermented, crackling crust.', tags: ['Bestseller'], inStock: true, image: '/images/image4.jpg' },
  { id: 'fb-br-2', name: 'Seeded Rye', category: 'bread', price: 200, description: 'Flax, sunflower and caraway seed crust.', tags: [], inStock: true, image: '/images/image4.jpg' },
  { id: 'fb-br-3', name: 'Baguette Tradition', category: 'bread', price: 140, description: 'Crisp Parisian-style baguette, baked twice daily.', tags: [], inStock: true, image: '/images/image4.jpg' },
  { id: 'fb-br-4', name: 'Whole Wheat Loaf', category: 'bread', price: 190, description: 'Stoneground whole wheat, tender crumb.', tags: [], inStock: true, image: '/images/image4.jpg' },
  { id: 'fb-br-5', name: 'Olive & Rosemary Focaccia', category: 'bread', price: 210, description: 'Kalamata olives, virgin olive oil, sea salt.', tags: [], inStock: true, image: '/images/image4.jpg' },
  { id: 'fb-pa-1', name: 'Butter Croissant', category: 'pastry', price: 110, description: '72-hour laminated, all butter.', tags: ['Bestseller'], inStock: true, image: '/images/image3.jpg' },
  { id: 'fb-pa-2', name: 'Almond Croissant', category: 'pastry', price: 150, description: 'Frangipane-filled, toasted almond flakes.', tags: [], inStock: true, image: '/images/image3.jpg' },
  { id: 'fb-pa-3', name: 'Cinnamon Babka', category: 'pastry', price: 180, description: 'Swirled with cinnamon sugar, brushed with syrup.', tags: [], inStock: true, image: '/images/image3.jpg' },
  { id: 'fb-pa-4', name: 'Pain au Chocolat', category: 'pastry', price: 130, description: 'Dark chocolate batons, flaky layers.', tags: [], inStock: true, image: '/images/image3.jpg' },
  { id: 'fb-co-1', name: 'Single-Origin Espresso', category: 'coffee', price: 90, description: 'Rotating single-origin, brewed to order.', tags: [], inStock: true, image: '/images/image5.jpg' },
  { id: 'fb-co-2', name: 'Oat Milk Flat White', category: 'coffee', price: 130, description: 'Silky micro-foam, house-made oat milk.', tags: ['Popular'], inStock: true, image: '/images/image5.jpg' },
  { id: 'fb-co-3', name: 'Cold Brew', category: 'coffee', price: 140, description: '18-hour steeped, smooth and low-acid.', tags: [], inStock: true, image: '/images/image5.jpg' }
];

export default function Menu() {
  const [items, setItems] = useState(FALLBACK_MENU);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const { addToCart, setIsCartOpen, setIsReservationOpen } = useCart();

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const res = await bakeryApi.getMenu();
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        setItems(res.data);
      } else {
        setItems(FALLBACK_MENU);
      }
    } catch (err) {
      console.error('Failed to load menu items, showing offline menu:', err);
      setItems(FALLBACK_MENU);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const categories = [
    { id: 'all', label: 'All Offerings' },
    { id: 'bread', label: 'Artisan Bread 🥖' },
    { id: 'pastry', label: 'Morning Pastry 🥐' },
    { id: 'coffee', label: 'Specialty Coffee ☕' }
  ];

  const filteredItems = items.filter(item => {
    const matchesCat = activeCategory === 'all' || item.category === activeCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || 
      item.name.toLowerCase().includes(q) || 
      item.description.toLowerCase().includes(q) ||
      (item.tags && item.tags.some(t => t.toLowerCase().includes(q)));
    return matchesCat && matchesSearch;
  });

  const groupedCategories = ['bread', 'pastry', 'coffee'];
  const categoryHeaders = {
    bread: { num: '01', title: 'Artisan Bread', desc: 'Slow-fermented with wild yeast and naturally leavened', img: '/images/image4.jpg' },
    pastry: { num: '02', title: 'French Pastry', desc: 'Buttery, 84-layered lamination baked fresh every sunrise', img: '/images/image3.jpg' },
    coffee: { num: '03', title: 'Specialty Coffee', desc: 'Single-origin beans thoughtfully brewed and balanced', img: '/images/image5.jpg' }
  };

  return (
    <section id="menu" className="menu-section">
      <div className="container">
        
        {/* Section Heading */}
        <div className="section-heading menu-heading">
          <div>
            <span className="eyebrow">
              <span className="eyebrow-line"></span>
              OUR ARTISAN MENU
            </span>
            <h2>Simple ingredients. <span>Beautiful results.</span></h2>
          </div>
          <p>Everything is made in small batches every single morning using heirloom grains, cultured butter, and wild leaven.</p>
        </div>

        {/* Category & Search Filter Bar */}
        <div className="menu-controls-bar">
          <div className="category-tabs" role="tablist">
            {categories.map(cat => (
              <button
                key={cat.id}
                role="tab"
                aria-selected={activeCategory === cat.id}
                className={`category-tab-btn ${activeCategory === cat.id ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat.id)}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="menu-search-wrapper">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="menu-search-input"
              placeholder="Search sourdough, croissant, cold brew..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              aria-label="Search menu items"
            />
            {searchQuery && (
              <button 
                className="search-clear-btn" 
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* States: Loading, Empty, Categorized or Filtered Grid */}
        {loading ? (
          <div className="menu-loading-state">
            <div className="baking-spinner">🥖</div>
            <p>Loading morning bakes from our oven...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="menu-empty-state">
            <p>No items found matching "{searchQuery}". Try another search term or select all categories.</p>
            <button 
              className="button button-secondary button-small"
              onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}
            >
              Reset Filters
            </button>
          </div>
        ) : activeCategory === 'all' && !searchQuery ? (
          <div className="menu-grid">
            {groupedCategories.map(catKey => {
              const catInfo = categoryHeaders[catKey];
              const catItems = items.filter(i => i.category === catKey);
              if (catItems.length === 0) return null;

              return (
                <article key={catKey} className="menu-category">
                  <div className="menu-category-header">
                    <span className="menu-number">{catInfo.num}</span>
                    <div>
                      <h3>{catInfo.title}</h3>
                      <p>{catInfo.desc}</p>
                    </div>
                  </div>
                  
                  <div className="menu-category-image-wrap">
                    <img 
                      src={catInfo.img} 
                      alt={catInfo.title} 
                      className="menu-feature-image" 
                    />
                  </div>
                  
                  <ul className="dotted-menu-list">
                    {catItems.map(item => (
                      <li key={item.id} className={`dotted-item ${!item.inStock ? 'sold-out' : ''}`}>
                        <div style={{ width: '100%' }}>
                          <div style={{ display: 'flex', alignItems: 'baseline', width: '100%' }}>
                            <span className="item-name">{item.name}</span>
                            <span className="dotted-line" aria-hidden="true"></span>
                            <span className="item-price">₹{item.price}</span>
                          </div>

                          {item.description && (
                            <p style={{ fontSize: '12px', color: 'var(--text-light)', marginTop: '4px' }}>
                              {item.description}
                            </p>
                          )}

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                            {item.tags && item.tags.length > 0 ? (
                              <div style={{ display: 'flex', gap: '6px' }}>
                                {item.tags.map((t, idx) => (
                                  <span key={idx} className="item-tag-pill">{t}</span>
                                ))}
                              </div>
                            ) : <span />}

                            {item.inStock ? (
                              <button
                                type="button"
                                className="button button-secondary"
                                style={{ padding: '6px 12px', minHeight: '32px', fontSize: '10px' }}
                                onClick={() => addToCart(item)}
                              >
                                + Add
                              </button>
                            ) : (
                              <span style={{ fontSize: '10px', fontWeight: '700', color: 'var(--compote-red)' }}>Sold Out</span>
                            )}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="menu-grid">
            {filteredItems.map(item => (
              <div key={item.id} className="menu-category" style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h3 style={{ fontSize: '22px' }}>{item.name}</h3>
                  <span className="item-price" style={{ fontSize: '16px' }}>₹{item.price}</span>
                </div>
                <p style={{ marginTop: '10px', fontSize: '13px' }}>{item.description}</p>
                <div style={{ marginTop: 'auto', paddingTop: '20px' }}>
                  {item.inStock ? (
                    <button
                      type="button"
                      className="button button-primary"
                      style={{ width: '100%', minHeight: '40px' }}
                      onClick={() => addToCart(item)}
                    >
                      + Add to Basket
                    </button>
                  ) : (
                    <button type="button" className="button button-secondary" style={{ width: '100%', minHeight: '40px' }} disabled>
                      Sold Out Today
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Menu Footer */}
        <div className="menu-footer">
          <p>Planning a morning event or have specific dietary inquiries?</p>
          <button 
            type="button" 
            className="text-link"
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            onClick={() => setIsReservationOpen(true)}
          >
            Speak with our team &amp; Reserve <span aria-hidden="true">→</span>
          </button>
        </div>

      </div>
    </section>
  );
}