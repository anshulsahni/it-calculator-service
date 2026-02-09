/**
 * Indian Income Tax Calculator Service
 * Main Express server setup
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const taxRoutes = require('./routes/taxRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// API Routes
app.use('/', taxRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    name: 'Indian Income Tax Calculator Service',
    version: '1.0.0',
    endpoints: {
      health: 'GET /health',
      calculateTax: 'POST /calculate-tax'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Indian Income Tax Calculator Service running on http://localhost:${PORT}`);
});

module.exports = app;
