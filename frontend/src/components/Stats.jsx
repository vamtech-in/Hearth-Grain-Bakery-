import React from 'react';

export default function Stats() {
  return (
    <section className="stats-section" aria-label="Bakery highlights">
      <div className="container stats-grid">
        <div className="stat-item">
          <strong>36+ hrs</strong>
          <span>Ferment time</span>
        </div>
        <div className="stat-item">
          <strong>4:00 AM</strong>
          <span>Oven start time</span>
        </div>
        <div className="stat-item">
          <strong>1987</strong>
          <span>Building year</span>
        </div>
        <div className="stat-item">
          <strong>0</strong>
          <span>Shortcuts taken</span>
        </div>
      </div>
    </section>
  );
}