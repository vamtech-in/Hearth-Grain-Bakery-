import React from 'react';
import { CartProvider } from './context/CartContext';
import Header from './components/Header';
import Hero from './components/Hero';
import Stats from './components/Stats';
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
import AdminPortalModal from './components/AdminPortalModal';
import ToastContainer from './components/Toast';

import './styles/index.css';

export default function App() {
  return (
    <CartProvider>
      <div className="bakery-app">
        <Header />
        <main>
          <Hero />
          <Stats />
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
        <AdminPortalModal />
        <ToastContainer />
      </div>
    </CartProvider>
  );
}