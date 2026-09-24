import React, { useState, useEffect } from 'react';
import { bakeryApi } from '../services/api';
import { useCart } from '../context/CartContext';

export default function Schedule() {
  const [scheduleData, setScheduleData] = useState([]);
  const [selectedDayIndex, setSelectedDayIndex] = useState(new Date().getDay());
  const [currentDayIndex, setCurrentDayIndex] = useState(new Date().getDay());
  const [loading, setLoading] = useState(true);
  const { addToCart, setIsCartOpen } = useCart();

  useEffect(() => {
    async function fetchSchedule() {
      try {
        const res = await bakeryApi.getSchedule();
        if (res.success && res.schedule) {
          setScheduleData(res.schedule);
          if (res.currentDay !== undefined) {
            setCurrentDayIndex(res.currentDay);
            setSelectedDayIndex(res.currentDay);
          }
        }
      } catch (err) {
        console.error('Failed to load baking schedule:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchSchedule();
  }, []);

  const bakes = scheduleData.length > 0 ? scheduleData : [
    { index: 0, dayName: 'SUN', name: 'Sunday', bake: 'Cinnamon Babka & Brioche', time: '8:00 AM', description: 'Sunday brunch specialty with swirled cinnamon babka and orange zest brioche.' },
    { index: 1, dayName: 'MON', name: 'Monday', bake: 'Miche au Levain', time: '8:00 AM', description: 'Hearty round rustic sourdough made with stoneground whole wheat.' },
    { index: 2, dayName: 'TUE', name: 'Tuesday', bake: 'Seeded Rye', time: '8:00 AM', description: 'Crusted with toasted flaxseed, sunflower seeds, and wild caraway.' },
    { index: 3, dayName: 'WED', name: 'Wednesday', bake: 'Pain de Campagne', time: '8:00 AM', description: 'Traditional French country boule, perfect for pairing with cheeses.' },
    { index: 4, dayName: 'THU', name: 'Thursday', bake: 'Sesame Whole Wheat', time: '8:00 AM', description: 'Toasted sesame seed crust with a tender, moist crumb.' },
    { index: 5, dayName: 'FRI', name: 'Friday', bake: 'Baguette Tradition & Challah', time: '8:00 AM', description: 'Crisp Parisian baguettes and golden braided egg challah.' },
    { index: 6, dayName: 'SAT', name: 'Saturday', bake: 'Olive & Rosemary Fougasse', time: '8:00 AM', description: 'Provencal bread bursting with Kalamata olives and virgin olive oil.' },
  ];

  const activeSpecial = bakes.find(b => b.index === selectedDayIndex) || bakes[0];
  const isToday = activeSpecial.index === currentDayIndex;

  const handlePreorder = () => {
    addToCart({
      id: `special-${activeSpecial.index}`,
      name: `${activeSpecial.bake} (${activeSpecial.name} Special)`,
      price: 210,
      category: 'bread',
      image: '/images/wheatleaf.jpg'
    });
    setIsCartOpen(true);
  };

  return (
    <section id="schedule" className="schedule-section">
      <div className="container">
        
        {/* Section Heading */}
        <div className="section-heading schedule-heading">
          <div>
            <span className="eyebrow">
              <span className="eyebrow-line"></span>
              WHAT'S IN THE OVEN
            </span>
            <h2>Fresh from the hearth, <span>every day.</span></h2>
          </div>
          <p>Each dawn brings a dedicated artisan bake. Click any day below to explore the recipe and reserve your loaf.</p>
        </div>

        {/* Schedule Grid */}
        <div className="schedule-grid" role="list">
          {bakes.map((item) => {
            const isSelected = selectedDayIndex === item.index;
            const isTodayItem = currentDayIndex === item.index;

            return (
              <div 
                key={item.index} 
                role="listitem"
                tabIndex={0}
                className={`schedule-day ${isTodayItem ? 'today' : ''} ${isSelected && !isTodayItem ? 'selected' : ''}`}
                onClick={() => setSelectedDayIndex(item.index)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setSelectedDayIndex(item.index); }}
              >
                <span className="day-name">
                  {item.dayName} {isTodayItem && 'TODAY'}
                </span>
                <strong>{item.name}</strong>
                <span className="day-bake">{item.bake}</span>
                <span className="day-time">Ready {item.time}</span>
              </div>
            );
          })}
        </div>

        {/* Specialty Bake Spotlight Box */}
        <div className="today-bake">
          <div>
            <span className="today-bake-label">
              {isToday ? "SUNDAY'S SPECIALTY BAKE" : `${activeSpecial.name.toUpperCase()}'S SPECIALTY BAKE`}
            </span>
            <h3>{activeSpecial.bake}</h3>
            <p style={{ marginTop: '8px', fontSize: '15px', color: 'var(--text-light)' }}>
              {activeSpecial.description}
            </p>
            <div style={{ display: 'flex', gap: '20px', marginTop: '14px', fontSize: '12px', fontWeight: '700', color: 'var(--coffee-soft)' }}>
              <span>⏱️ Oven Hot from {activeSpecial.time}</span>
              <span>🥖 Small Batch Limited Quantities</span>
            </div>
          </div>

          <button 
            type="button" 
            className="button button-primary"
            onClick={handlePreorder}
            style={{ whiteSpace: 'nowrap', flexShrink: 0 }}
          >
            {isToday ? "Pre-order for Sunday" : `Pre-order for ${activeSpecial.name}`}
            <span aria-hidden="true">→</span>
          </button>
        </div>

      </div>
    </section>
  );
}