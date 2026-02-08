/**
 * Core tax calculation service for Indian income tax
 */

const {
  STANDARD_DEDUCTION_NEW_REGIME,
  STANDARD_DEDUCTION_OLD_REGIME,
  CESS_PERCENTAGE,
  SECTION_80C_LIMIT,
  NEW_REGIME_SLABS,
  OLD_REGIME_SLABS,
} = require("../utils/constants");

/**
 * Calculate HRA exemption (Old Regime only)
 * HRA exemption is the minimum of:
 * 1. Actual HRA received
 * 2. 50% of salary (if metro) OR 40% of salary (if non-metro)
 * 3. Actual rent paid minus 10% of salary
 * @param {number} salary - Annual salary
 * @param {number} hraComponent - HRA component of salary
 * @param {number} annualRent - Annual rent paid
 * @param {boolean} isMetro - Whether residence is in metro city
 * @returns {number} - HRA exemption amount
 */
function calculateHRAExemption(salary, hraComponent, annualRent, isMetro) {
  // HRA exemption only applies if both HRA and rent are present
  if (!hraComponent || !annualRent) {
    return 0;
  }

  const rentPercentage = isMetro ? 0.5 : 0.4;
  const percentageOfSalary = salary * rentPercentage;
  const rentMinusTenPercent = Math.max(0, annualRent - (salary * 0.1));

  // Minimum of the three values
  return Math.min(hraComponent, percentageOfSalary, rentMinusTenPercent);
}

/**
 * Calculate tax for new regime
 * New regime: No HRA, No Section 80C, Higher tax-free limit
 * @param {number} taxableIncome - Taxable income after standard deduction
 * @returns {number} - Income tax amount
 */
function calculateNewRegimeTax(taxableIncome) {
  if (taxableIncome <= 0) {
    return 0;
  }

  let tax = 0;
  let remainingIncome = taxableIncome;

  for (const slab of NEW_REGIME_SLABS) {
    if (remainingIncome <= 0) break;

    const slabIncome = Math.min(
      remainingIncome,
      slab.max - slab.min
    );

    tax += slabIncome * (slab.rate / 100);
    remainingIncome -= slabIncome;
  }

  return tax;
}

/**
 * Calculate tax for old regime
 * Old regime: HRA and Section 80C allowed, Lower tax-free limit
 * @param {number} taxableIncome - Taxable income after deductions
 * @returns {number} - Income tax amount
 */
function calculateOldRegimeTax(taxableIncome) {
  if (taxableIncome <= 0) {
    return 0;
  }

  let tax = 0;
  let remainingIncome = taxableIncome;

  for (const slab of OLD_REGIME_SLABS) {
    if (remainingIncome <= 0) break;

    const slabIncome = Math.min(
      remainingIncome,
      slab.max - slab.min
    );

    tax += slabIncome * (slab.rate / 100);
    remainingIncome -= slabIncome;
  }

  return tax;
}

/**
 * Main tax calculation function
 * @param {Object} input - Normalized input object
 * @returns {Object} - Tax calculation result
 */
function calculateTax(input) {
  const {
    incomeFromSalary,
    incomeFromRent,
    hraComponent,
    annualRent,
    section80C,
    regime,
    isMetro,
  } = input;

  // Calculate gross income
  const grossIncome = incomeFromSalary + incomeFromRent;

  // Select standard deduction based on regime
  const standardDeduction =
    regime === "new"
      ? STANDARD_DEDUCTION_NEW_REGIME
      : STANDARD_DEDUCTION_OLD_REGIME;

  let totalDeductions = standardDeduction;
  let breakdown = {
    standardDeduction: standardDeduction,
    hraExemption: 0,
    section80C: 0,
  };

  // Apply regime-specific deductions
  if (regime === "old") {
    // Old regime: HRA exemption applies
    const hraExemption = calculateHRAExemption(
      incomeFromSalary - hraComponent,
      hraComponent,
      annualRent,
      isMetro,
    );
    totalDeductions += hraExemption;
    breakdown.hraExemption = hraExemption;

    // Old regime: Section 80C deduction applies
    const applicableSection80C = Math.min(section80C, SECTION_80C_LIMIT);
    totalDeductions += applicableSection80C;
    breakdown.section80C = applicableSection80C;
  }

  // Calculate taxable income
  const taxableIncome = Math.max(0, grossIncome - totalDeductions);

  // Calculate income tax based on regime
  const incomeTax =
    regime === "new"
      ? calculateNewRegimeTax(taxableIncome)
      : calculateOldRegimeTax(taxableIncome);

  // Calculate cess (4% on income tax)
  const cess = incomeTax * (CESS_PERCENTAGE / 100);

  // Total tax liability
  const totalTaxLiability = incomeTax + cess;

  return {
    regime,
    grossIncome,
    totalDeductions,
    taxableIncome,
    incomeTax: Math.round(incomeTax * 100) / 100,
    cess: Math.round(cess * 100) / 100,
    totalTaxLiability: Math.round(totalTaxLiability * 100) / 100,
    breakdown,
  };
}

module.exports = {
  calculateTax,
  calculateHRAExemption,
  calculateNewRegimeTax,
  calculateOldRegimeTax
};
