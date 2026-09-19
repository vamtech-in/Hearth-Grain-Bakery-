import express from 'express';
import { readDb, writeDb, generateOrderNumber } from '../db.js';

const router = express.Router();

// GET /api/orders - Get orders (admin view)
router.get('/', (req, res) => {
  try {
    const db = readDb();
    let orders = [...(db.orders || [])];
    const { status, search } = req.query;

    if (status && status !== 'all') {
      orders = orders.filter(o => o.status.toLowerCase() === status.toLowerCase());
    }

    if (search) {
      const q = search.toLowerCase();
      orders = orders.filter(o =>
        o.id.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerPhone.includes(q)
      );
    }

    // Sort newest first
    orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({ success: true, count: orders.length, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/orders/:id - Customer order tracker lookup
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const db = readDb();
    const query = id.toUpperCase().trim();

    // Check by Order ID or exact Phone Number
    const order = (db.orders || []).find(o => 
      o.id.toUpperCase() === query || 
      o.customerPhone.replace(/[\s\-\+]/g, '').includes(query.replace(/[\s\-\+]/g, ''))
    );

    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found. Please verify your order number or phone number.' });
    }

    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/orders - Place a new order
router.post('/', (req, res) => {
  try {
    const {
      customerName,
      customerPhone,
      customerEmail,
      fulfillmentType, // 'pickup' | 'delivery'
      pickupTime,
      deliveryAddress,
      paymentMethod,
      items,
      notes
    } = req.body;

    if (!customerName || !customerPhone || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Customer name, phone, and at least one item are required.'
      });
    }

    const subtotal = items.reduce((sum, item) => sum + (Number(item.price) * Number(item.quantity || 1)), 0);
    const packagingFee = fulfillmentType === 'delivery' ? 25 : 15;
    const total = subtotal + packagingFee;

    const newOrder = {
      id: generateOrderNumber(),
      createdAt: new Date().toISOString(),
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerEmail: customerEmail ? customerEmail.trim() : '',
      fulfillmentType: fulfillmentType || 'pickup',
      pickupTime: pickupTime || 'In 30-45 minutes',
      deliveryAddress: deliveryAddress ? deliveryAddress.trim() : null,
      paymentMethod: paymentMethod || 'counter',
      status: 'Received',
      items: items.map(item => ({
        id: item.id,
        name: item.name,
        price: Number(item.price),
        quantity: Number(item.quantity || 1)
      })),
      subtotal,
      packagingFee,
      total,
      notes: notes ? notes.trim() : ''
    };

    const db = readDb();
    if (!db.orders) db.orders = [];
    db.orders.unshift(newOrder);
    writeDb(db);

    res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      data: newOrder
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH /api/orders/:id/status - Update order status
router.patch('/:id/status', (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = ['Received', 'In the Oven / Baking', 'Ready for Pickup', 'Completed', 'Cancelled'];
    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Invalid status. Must be one of: ${allowedStatuses.join(', ')}`
      });
    }

    const db = readDb();
    const order = (db.orders || []).find(o => o.id.toUpperCase() === id.toUpperCase());

    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    order.status = status;
    order.updatedAt = new Date().toISOString();
    writeDb(db);

    res.json({ success: true, message: `Order status updated to ${status}`, data: order });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
