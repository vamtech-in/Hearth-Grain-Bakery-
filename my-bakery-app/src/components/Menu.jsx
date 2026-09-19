import React, { useState, useEffect } from 'react';
import { bakeryApi } from '../services/api';
import { useCart } from '../context/CartContext';

export default function Menu() {
  const [items, setItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const { addToCart, setIsCartOpen, setIsReservationOpen } = useCart();

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const res = await bakeryApi.getMenu();
      if (res.success && res.data) {
        setItems(res.data);
      }
    } catch (err) {
      console.error('Failed to load menu items:', err);
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

  // Group by category when 'all' is selected
  const groupedCategories = ['bread', 'pastry', 'coffee'];
  const categoryHeaders = {
    bread: { num: '01', title: 'Artisan Bread', desc: 'Slow-fermented with wild yeast and naturally leavened', img: '/images/image4.jpg' },
    pastry: { num: '02', title: 'French Pastry', desc: 'Buttery, 84-layered lamination baked fresh every sunrise', img: '/images/image3.jpg' },
    coffee: { num: '03', title: 'Specialty Coffee', desc: 'Single-origin beans thoughtfully brewed and balanced', img: '/images/image5.jpg' }
  };

  return (
    <section id="menu" className="menu-section">
      <div className="container">
        <div className="section-heading menu-heading">
          <div>
            <span className="eyebrow">OUR ARTISAN MENU</span>
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
          /* Grouped Categorized View */
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
                      <li key={item.id} className={`dotted-item-card ${!item.inStock ? 'sold-out' : ''}`}>
                        <div className="item-main-row">
                          <span className="item-name">{item.name}</span>
                          <span className="dotted-line" aria-hidden="true"></span>
                          <span className="item-price">₹{item.price}</span>
                        </div>
                        
                        {item.description && (
                          <p className="item-card-desc">{item.description}</p>
                        )}

                        <div className="item-card-footer">
                          {item.tags && item.tags.length > 0 && (
                            <div className="item-tags">
                              {item.tags.map((t, idx) => (
                                <span key={idx} className="item-tag-pill">{t}</span>
                              ))}
                            </div>
                          )}

                          {item.inStock ? (
                            <button
                              type="button"
                              className="add-to-basket-btn"
                              onClick={() => addToCart(item)}
                              aria-label={`Add ${item.name} to basket`}
                            >
                              + Add to Basket
                            </button>
                          ) : (
                            <span className="sold-out-badge">Sold Out Today</span>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </article>
              );
            })}
          </div>
        ) : (
          /* Filtered Grid View */
          <div className="filtered-items-grid">
            {filteredItems.map(item => (
              <div key={item.id} className={`filtered-item-card ${!item.inStock ? 'sold-out' : ''}`}>
                <div className="filtered-item-img-wrap">
                  <img src={item.image || '/images/image1.jpg'} alt={item.name} />
                  {!item.inStock && <span className="sold-out-overlay-badge">Sold Out</span>}
                </div>
                <div className="filtered-item-body">
                  <div className="filtered-item-header">
                    <h4>{item.name}</h4>
                    <span className="filtered-item-price">₹{item.price}</span>
                  </div>
                  <p className="filtered-item-desc">{item.description}</p>
                  
                  {item.tags && item.tags.length > 0 && (
                    <div className="item-tags">
                      {item.tags.map((t, idx) => (
                        <span key={idx} className="item-tag-pill">{t}</span>
                      ))}
                    </div>
                  )}

                  <div className="filtered-item-actions">
                    {item.inStock ? (
                      <button
                        type="button"
                        className="button button-primary button-small button-block"
                        onClick={() => addToCart(item)}
                      >
                        + Add to Basket • ₹{item.price}
                      </button>
                    ) : (
                      <button type="button" className="button button-secondary button-small button-block" disabled>
                        Sold Out Today
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="menu-footer">
          <p>Planning a morning event or have specific dietary inquiries?</p>
          <button 
            type="button" 
            className="text-link-button"
            onClick={() => setIsReservationOpen(true)}
          >
            Speak with our team &amp; Reserve <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>
    </section>
  );
}