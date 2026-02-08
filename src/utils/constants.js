/**
 * Tax slabs and constants for Indian income tax calculation (FY 2023-24)
 */

// Standard Deduction - varies by regime
const STANDARD_DEDUCTION_NEW_REGIME = 75000;
const STANDARD_DEDUCTION_OLD_REGIME = 50000;

// Health and Education Cess percentage
const CESS_PERCENTAGE = 4;

// Section 80C maximum limit (Old Regime only)
const SECTION_80C_LIMIT = 150000;

// New Regime Tax Slabs (FY 2025-26 / AY 2026-27)
// Slabs define ranges where: income >= min AND income < max applies the rate
const NEW_REGIME_SLABS = [
  { min: 0, max: 400000, rate: 0 },
  { min: 400000, max: 800000, rate: 5 },
  { min: 800000, max: 1200000, rate: 10 },
  { min: 1200000, max: 1600000, rate: 15 },
  { min: 1600000, max: 2000000, rate: 20 },
  { min: 2000000, max: 2400000, rate: 25 },
  { min: 2400000, max: Infinity, rate: 30 }
];

// Old Regime Tax Slabs (FY 2023-24)
// Slabs define ranges where: income >= min AND income < max applies the rate
const OLD_REGIME_SLABS = [
  { min: 0, max: 250000, rate: 0 },
  { min: 250000, max: 500000, rate: 5 },
  { min: 500000, max: 1000000, rate: 20 },
  { min: 1000000, max: Infinity, rate: 30 }
];

module.exports = {
  STANDARD_DEDUCTION_NEW_REGIME,
  STANDARD_DEDUCTION_OLD_REGIME,
  CESS_PERCENTAGE,
  SECTION_80C_LIMIT,
  NEW_REGIME_SLABS,
  OLD_REGIME_SLABS
};
