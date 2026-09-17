import React from 'react';

export default function Menu() {
  return (
    <section id="menu" className="menu-section">
      <div className="container">
        <div className="section-heading menu-heading">
          <div>
            <span className="eyebrow">OUR MENU</span>
            <h2>Simple ingredients. <span>Beautiful results.</span></h2>
          </div>
          <p>Everything is made in small batches using traditional techniques and carefully selected ingredients.</p>
        </div>

        <div className="menu-grid">
          {/* Bread Menu */}
          <article className="menu-category">
            <div className="menu-category-header">
              <span className="menu-number">01</span>
              <div>
                <h3>Bread</h3>
                <p>Slow-fermented and naturally leavened</p>
              </div>
            </div>
            <img src="/images/image4.jpg" alt="Fresh artisan bread loaves" className="menu-feature-image" />
            
            <ul className="dotted-menu-list">
              <li className="dotted-item"><span className="item-name">Country Sourdough</span><span className="dotted-line"></span><span className="item-price">₹180</span></li>
              <li className="dotted-item"><span className="item-name">Seeded Rye</span><span className="dotted-line"></span><span className="item-price">₹220</span></li>
              <li className="dotted-item"><span className="item-name">Baguette Tradition</span><span className="dotted-line"></span><span className="item-price">₹150</span></li>
              <li className="dotted-item"><span className="item-name">Whole Wheat Loaf</span><span className="dotted-line"></span><span className="item-price">₹190</span></li>
            </ul>
          </article>

          {/* Pastry Menu */}
          <article className="menu-category">
            <div className="menu-category-header">
              <span className="menu-number">02</span>
              <div>
                <h3>Pastry</h3>
                <p>Buttery, flaky and baked fresh daily</p>
              </div>
            </div>
            <img src="/images/image3.jpg" alt="Fresh butter croissant pastry" className="menu-feature-image" />
            
            <ul className="dotted-menu-list">
              <li className="dotted-item"><span className="item-name">Butter Croissant</span><span className="dotted-line"></span><span className="item-price">₹120</span></li>
              <li className="dotted-item"><span className="item-name">Almond Croissant</span><span className="dotted-line"></span><span className="item-price">₹160</span></li>
              <li className="dotted-item"><span className="item-name">Cinnamon Babka</span><span className="dotted-line"></span><span className="item-price">₹180</span></li>
              <li className="dotted-item"><span className="item-name">Seasonal Danish</span><span className="dotted-line"></span><span className="item-price">₹150</span></li>
            </ul>
          </article>

          {/* Coffee Menu */}
          <article className="menu-category">
            <div className="menu-category-header">
              <span className="menu-number">03</span>
              <div>
                <h3>Coffee</h3>
                <p>Thoughtfully brewed and perfectly balanced</p>
              </div>
            </div>
            
            <div className="coffee-image-wrapper">
              <img src="/images/image5.jpg" alt="Handcrafted coffee and espresso" className="menu-feature-image" />
            </div>

            <ul className="dotted-menu-list">
              <li className="dotted-item"><span className="item-name">Espresso</span><span className="dotted-line"></span><span className="item-price">₹100</span></li>
              <li className="dotted-item"><span className="item-name">Americano</span><span className="dotted-line"></span><span className="item-price">₹120</span></li>
              <li className="dotted-item"><span className="item-name">Cappuccino</span><span className="dotted-line"></span><span className="item-price">₹160</span></li>
              <li className="dotted-item"><span className="item-name">Cold Brew</span><span className="dotted-line"></span><span className="item-price">₹180</span></li>
            </ul>
          </article>
        </div>

        <div className="menu-footer">
          <p>Have an allergy or special request? Please speak with our team before ordering.</p>
          <a href="#visit" className="text-link">Ask our team <span aria-hidden="true">→</span></a>
        </div>
      </div>
    </section>
  );
}