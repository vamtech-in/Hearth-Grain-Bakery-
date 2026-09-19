import express from 'express';
import cors from 'cors';
import { initDb } from './db.js';
import menuRoutes from './routes/menu.js';
import orderRoutes from './routes/orders.js';
import reservationRoutes from './routes/reservations.js';
import interactionRoutes from './routes/interactions.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize database
initDb();

// Middlewares
app.use(cors());
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    bakery: 'Hearth & Grain Artisan Bakery',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api', interactionRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'API route not found' });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🥖 Hearth & Grain Bakery API Server running at http://localhost:${PORT}`);
});
