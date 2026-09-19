import express from 'express';
import { readDb, writeDb, generateId } from '../db.js';

const router = express.Router();

// GET /api/schedule - Weekly bake schedule & today's special
router.get('/schedule', (req, res) => {
  try {
    const db = readDb();
    const currentDay = new Date().getDay();
    const schedule = db.schedule || [];
    const todaySpecial = schedule.find(s => s.index === currentDay) || schedule[0];

    res.json({
      success: true,
      currentDay,
      todaySpecial,
      schedule
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/reviews - Customer reviews
router.get('/reviews', (req, res) => {
  try {
    const db = readDb();
    const reviews = db.reviews || [];
    res.json({ success: true, count: reviews.length, data: reviews });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/reviews - Add a review
router.post('/reviews', (req, res) => {
  try {
    const { author, rating, title, comment } = req.body;
    if (!author || !rating || !comment) {
      return res.status(400).json({ success: false, error: 'Author, rating, and review text are required.' });
    }

    const db = readDb();
    const newReview = {
      id: generateId('rev'),
      author: author.trim(),
      rating: Math.min(5, Math.max(1, Number(rating))),
      title: title ? title.trim() : 'Artisan Bread Lover',
      comment: comment.trim(),
      date: 'Just now',
      verified: true
    };

    if (!db.reviews) db.reviews = [];
    db.reviews.unshift(newReview);
    writeDb(db);

    res.status(201).json({ success: true, message: 'Thank you for your warm review!', data: newReview });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/contact - Submit contact message
router.post('/contact', (req, res) => {
  try {
    const { name, email, phone, message } = req.body;
    if (!name || !message) {
      return res.status(400).json({ success: false, error: 'Name and message are required.' });
    }

    const db = readDb();
    const inquiry = {
      id: generateId('msg'),
      name: name.trim(),
      email: email ? email.trim() : '',
      phone: phone ? phone.trim() : '',
      message: message.trim(),
      createdAt: new Date().toISOString()
    };

    if (!db.contactMessages) db.contactMessages = [];
    db.contactMessages.unshift(inquiry);
    writeDb(db);

    res.status(201).json({ success: true, message: 'Message sent! Our bakers will get back to you shortly.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/newsletter - Subscribe
router.post('/newsletter', (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !email.includes('@')) {
      return res.status(400).json({ success: false, error: 'Please enter a valid email address.' });
    }

    const db = readDb();
    if (!db.subscribers) db.subscribers = [];

    const cleanEmail = email.toLowerCase().trim();
    if (db.subscribers.includes(cleanEmail)) {
      return res.json({ success: true, message: 'You are already on our morning bake dispatch list!' });
    }

    db.subscribers.push(cleanEmail);
    writeDb(db);

    res.status(201).json({ success: true, message: 'Welcome to the Hearth & Grain family!' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/stats - Bakery dashboard stats
router.get('/stats', (req, res) => {
  try {
    const db = readDb();
    const orders = db.orders || [];
    const reservations = db.reservations || [];
    const menu = db.menu || [];

    const totalRevenue = orders
      .filter(o => o.status !== 'Cancelled')
      .reduce((sum, o) => sum + (o.total || 0), 0);

    const activeOrders = orders.filter(o => o.status === 'Received' || o.status.includes('Baking')).length;
    const readyOrders = orders.filter(o => o.status.includes('Ready')).length;

    res.json({
      success: true,
      data: {
        totalRevenue,
        totalOrders: orders.length,
        activeOrders,
        readyOrders,
        totalReservations: reservations.length,
        menuItemCount: menu.length,
        inStockCount: menu.filter(m => m.inStock).length,
        subscribersCount: (db.subscribers || []).length
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
