import React from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Stats from './components/Stats';
import Schedule from './components/Schedule';
import Menu from './components/Menu';
import Story from './components/Story';
import Visit from './components/Visit';
import Footer from './components/Footer';
import './App.css';

export default function App() {
  return (
    <div className="bakery-app">
      <Header />
      <main>
        <Hero />
        <Stats />
        <Schedule />
        <Menu />
        <Story />
        <Visit />
      </main>
      <Footer />
    </div>
  );
}