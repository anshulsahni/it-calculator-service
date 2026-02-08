/**
 * Input validation utilities for tax calculation
 */

const { SECTION_80C_LIMIT } = require('./constants');

/**
 * Validate tax calculation input
 * @param {Object} input - User input object
 * @returns {Object} - { isValid: boolean, errors: string[] }
 */
function validateTaxInput(input) {
  const errors = [];

  // Check if input exists
  if (!input || typeof input !== 'object') {
    return {
      isValid: false,
      errors: ['Invalid input: must be an object']
    };
  }

  // Mandatory field validation: incomeFromSalary
  if (input.incomeFromSalary === undefined || input.incomeFromSalary === null) {
    errors.push('incomeFromSalary is mandatory');
  } else if (!isValidNumber(input.incomeFromSalary)) {
    errors.push('incomeFromSalary must be a valid number');
  } else if (input.incomeFromSalary < 0) {
    errors.push('incomeFromSalary cannot be negative');
  }

  // incomeFromRent validation
  if (input.incomeFromRent !== undefined && input.incomeFromRent !== null) {
    if (!isValidNumber(input.incomeFromRent)) {
      errors.push('incomeFromRent must be a valid number');
    } else if (input.incomeFromRent < 0) {
      errors.push('incomeFromRent cannot be negative');
    }
  }

  // hraComponent validation
  if (input.hraComponent !== undefined && input.hraComponent !== null) {
    if (!isValidNumber(input.hraComponent)) {
      errors.push('hraComponent must be a valid number');
    } else if (input.hraComponent < 0) {
      errors.push('hraComponent cannot be negative');
    }
  }

  // annualRent validation
  if (input.annualRent !== undefined && input.annualRent !== null) {
    if (!isValidNumber(input.annualRent)) {
      errors.push('annualRent must be a valid number');
    } else if (input.annualRent < 0) {
      errors.push('annualRent cannot be negative');
    }
  }

  // section80C validation
  if (input.section80C !== undefined && input.section80C !== null) {
    if (!isValidNumber(input.section80C)) {
      errors.push('section80C must be a valid number');
    } else if (input.section80C < 0) {
      errors.push('section80C cannot be negative');
    } else if (input.section80C > SECTION_80C_LIMIT) {
      errors.push(`section80C cannot exceed ₹${SECTION_80C_LIMIT.toLocaleString('en-IN')}`);
    }
  }

  // regime validation
  if (input.regime !== undefined && input.regime !== null) {
    if (!['new', 'old'].includes(input.regime)) {
      errors.push('regime must be either "new" or "old"');
    }
  }

  // isMetro validation
  if (input.isMetro !== undefined && input.isMetro !== null) {
    if (typeof input.isMetro !== 'boolean') {
      errors.push('isMetro must be a boolean (true or false)');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Sanitize and normalize input
 * @param {Object} input - User input object
 * @returns {Object} - Normalized input with defaults
 */
function normalizeInput(input) {
  return {
    incomeFromSalary: input.incomeFromSalary,
    incomeFromRent: input.incomeFromRent || 0,
    hraComponent: input.hraComponent || 0,
    annualRent: input.annualRent || 0,
    section80C: Math.min(input.section80C || 0, SECTION_80C_LIMIT),
    regime: (input.regime || 'new').toLowerCase(),
    isMetro: input.isMetro === true
  };
}

/**
 * Check if value is a valid number
 * @param {*} value - Value to check
 * @returns {boolean}
 */
function isValidNumber(value) {
  return typeof value === 'number' && !isNaN(value) && isFinite(value);
}

module.exports = {
  validateTaxInput,
  normalizeInput,
  isValidNumber
};
