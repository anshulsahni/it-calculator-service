/**
 * Tax API Routes
 */

const express = require('express');
const router = express.Router();
const { healthCheck, calculateTaxHandler } = require('../controllers/taxController');

/**
 * GET /health
 * Health check endpoint
 */
router.get('/health', healthCheck);

/**
 * POST /calculate-tax
 * Calculate income tax
 */
router.post('/calculate-tax', calculateTaxHandler);

module.exports = router;
