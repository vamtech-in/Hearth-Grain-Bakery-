import React from 'react';

export default function Schedule() {
  const currentDay = new Date().getDay();

  const bakes = [
    { name: "Sunday", bake: "Cinnamon Babka", dayName: "SUN", index: 0 },
    { name: "Monday", bake: "Miche au Levain", dayName: "MON", index: 1 },
    { name: "Tuesday", bake: "Seeded Rye", dayName: "TUE", index: 2 },
    { name: "Wednesday", bake: "Pain de Campagne", dayName: "WED", index: 3 },
    { name: "Thursday", bake: "Sesame Whole Wheat", dayName: "THU", index: 4 },
    { name: "Friday", bake: "Baguette Tradition", dayName: "FRI", index: 5 },
    { name: "Saturday", bake: "Olive Fougasse", dayName: "SAT", index: 6 },
  ];

  const todayBake = bakes[currentDay] || bakes[0];

  return (
    <section id="schedule" className="schedule-section">
      <div className="container">
        <div className="section-heading schedule-heading">
          <div>
            <span className="eyebrow">WHAT'S BAKING</span>
            <h2>Fresh from the oven, <span>every day.</span></h2>
          </div>
          <p>Each day brings something different. Come early for the best selection.</p>
        </div>

        <div className="schedule-grid">
          {bakes.map((item) => (
            <div 
              key={item.index} 
              className={`schedule-day ${currentDay === item.index ? 'today' : ''}`}
            >
              <span className="day-name">{item.dayName}</span>
              <strong>{item.name}</strong>
              <span className="day-bake">{item.bake}</span>
              <span className="day-time">From 8:00 AM</span>
            </div>
          ))}
        </div>

        <div className="today-bake">
          <span className="today-bake-label">TODAY'S SPECIAL BAKE</span>
          <strong>{todayBake.bake}</strong>
          <span>Available while supplies last</span>
        </div>
      </div>
    </section>
  );
}