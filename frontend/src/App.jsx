import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import Header from './components/Header';
import Hero from './components/Hero';
import Stats from './components/Stats';
import OvenLiveTracker from './components/OvenLiveTracker';
import Schedule from './components/Schedule';
import Menu from './components/Menu';
import Story from './components/Story';
import ReviewsSection from './components/ReviewsSection';
import Visit from './components/Visit';
import Footer from './components/Footer';

// Modals & Drawers
import CartDrawer from './components/CartDrawer';
import CheckoutModal from './components/CheckoutModal';
import OrderTrackerModal from './components/OrderTrackerModal';
import ReservationModal from './components/ReservationModal';
import ItemDetailModal from './components/ItemDetailModal';
import ToastContainer from './components/Toast';

// Standalone Admin Page Component
import AdminDashboardPage from './pages/AdminDashboardPage';

import './styles/index.css';

function MainStorefront() {
  return (
    <div className="bakery-app">
      <Header />
      <main>
        <Hero />
        <Stats />
        <OvenLiveTracker />
        <Schedule />
        <Menu />
        <Story />
        <ReviewsSection />
        <Visit />
      </main>
      <Footer />

      {/* Interactive Modals and Flyouts */}
      <CartDrawer />
      <CheckoutModal />
      <OrderTrackerModal />
      <ReservationModal />
      <ItemDetailModal />
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <CartProvider>
      <Router>
        <Routes>
          {/* Main Bakery E-commerce Storefront */}
          <Route path="/" element={<MainStorefront />} />
          
          {/* Dedicated Full-Screen Standalone Admin Dashboard */}
          <Route path="/admin" element={<AdminDashboardPage />} />
          
          {/* Fallback route redirection */}
          <Route path="*" element='/' />
        </Routes>
      </Router>
    </CartProvider>
  );
}