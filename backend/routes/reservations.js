import express from 'express';
import { readDb, writeDb, generateId } from '../db.js';

const router = express.Router();

// GET /api/reservations - List all reservations
router.get('/', (req, res) => {
  try {
    const db = readDb();
    const reservations = db.reservations || [];
    reservations.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json({ success: true, count: reservations.length, data: reservations });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/reservations - Book a table
router.post('/', (req, res) => {
  try {
    const { name, phone, email, date, time, guests, occasion, specialRequests } = req.body;

    if (!name || !phone || !date || !time) {
      return res.status(400).json({
        success: false,
        error: 'Name, phone, date, and preferred time are required.'
      });
    }

    const db = readDb();
    const newReservation = {
      id: generateId('RES'),
      name: name.trim(),
      phone: phone.trim(),
      email: email ? email.trim() : '',
      date,
      time,
      guests: Number(guests || 2),
      occasion: occasion || 'Bakery Visit',
      specialRequests: specialRequests ? specialRequests.trim() : '',
      status: 'Confirmed',
      createdAt: new Date().toISOString()
    };

    if (!db.reservations) db.reservations = [];
    db.reservations.unshift(newReservation);
    writeDb(db);

    res.status(201).json({
      success: true,
      message: 'Table reserved successfully! We look forward to hosting you.',
      data: newReservation
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH /api/reservations/:id/status - Update reservation status
router.patch('/:id/status', (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const db = readDb();
    const reservation = (db.reservations || []).find(r => r.id === id);

    if (!reservation) {
      return res.status(404).json({ success: false, error: 'Reservation not found' });
    }

    reservation.status = status;
    reservation.updatedAt = new Date().toISOString();
    writeDb(db);

    res.json({ success: true, data: reservation });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
