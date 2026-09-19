import express from 'express';
import { readDb, writeDb, generateId } from '../db.js';

const router = express.Router();

// GET /api/menu - Get all menu items with category, search, stock filtering
router.get('/', (req, res) => {
  try {
    const db = readDb();
    let items = db.menu || [];
    const { category, search, inStock } = req.query;

    if (category && category !== 'all') {
      items = items.filter(item => item.category.toLowerCase() === category.toLowerCase());
    }

    if (search) {
      const q = search.toLowerCase();
      items = items.filter(item => 
        item.name.toLowerCase().includes(q) || 
        item.description.toLowerCase().includes(q) ||
        (item.tags && item.tags.some(t => t.toLowerCase().includes(q)))
      );
    }

    if (inStock === 'true') {
      items = items.filter(item => item.inStock);
    }

    res.json({
      success: true,
      count: items.length,
      data: items
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/menu - Add a new menu item
router.post('/', (req, res) => {
  try {
    const { name, category, price, description, tags, image } = req.body;
    if (!name || !category || !price) {
      return res.status(400).json({ success: false, error: 'Name, category, and price are required' });
    }

    const db = readDb();
    const newItem = {
      id: generateId(category.substring(0, 2)),
      name: name.trim(),
      category: category.toLowerCase().trim(),
      price: Number(price),
      description: description ? description.trim() : '',
      tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map(t => t.trim()) : []),
      inStock: true,
      image: image || '/images/image1.jpg'
    };

    db.menu.push(newItem);
    writeDb(db);

    res.status(201).json({ success: true, data: newItem });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/menu/:id - Update menu item or toggle stock
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const db = readDb();
    const index = db.menu.findIndex(item => item.id === id);

    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Menu item not found' });
    }

    const current = db.menu[index];
    const updated = {
      ...current,
      ...req.body,
      id: current.id,
      price: req.body.price !== undefined ? Number(req.body.price) : current.price,
      inStock: req.body.inStock !== undefined ? Boolean(req.body.inStock) : current.inStock
    };

    db.menu[index] = updated;
    writeDb(db);

    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/menu/:id - Delete menu item
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const db = readDb();
    const filtered = db.menu.filter(item => item.id !== id);

    if (filtered.length === db.menu.length) {
      return res.status(404).json({ success: false, error: 'Menu item not found' });
    }

    db.menu = filtered;
    writeDb(db);

    res.json({ success: true, message: 'Item removed successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
