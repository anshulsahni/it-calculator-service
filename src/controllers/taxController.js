/**
 * Tax Controller - Handles API requests for tax calculation
 */

const { calculateTax } = require('../services/taxCalculator');
const { validateTaxInput, normalizeInput } = require('../utils/validator');

/**
 * Health check endpoint handler
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
function healthCheck(req, res) {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
}

/**
 * Calculate tax endpoint handler
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
function calculateTaxHandler(req, res) {
  try {
    const input = req.body;

    // Validate input
    const validation = validateTaxInput(input);
    if (!validation.isValid) {
      return res.status(400).json({
        error: 'Validation failed',
        errors: validation.errors
      });
    }

    // Normalize input with defaults
    const normalizedInput = normalizeInput(input);

    // Calculate tax
    const result = calculateTax(normalizedInput);

    // Return success response
    res.status(200).json(result);
  } catch (error) {
    console.error('Error calculating tax:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}

module.exports = {
  healthCheck,
  calculateTaxHandler
};
