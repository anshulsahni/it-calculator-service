/**
 * Unit tests for tax calculation service
 */

const {
  calculateTax,
  calculateHRAExemption,
  calculateNewRegimeTax,
  calculateOldRegimeTax
} = require('../src/services/taxCalculator');

describe('Tax Calculator Service', () => {
  describe('calculateHRAExemption', () => {
    test('should return 0 when HRA component is 0', () => {
      const result = calculateHRAExemption(1000000, 0, 240000, true);
      expect(result).toBe(0);
    });

    test('should return 0 when annual rent is 0', () => {
      const result = calculateHRAExemption(1000000, 300000, 0, true);
      expect(result).toBe(0);
    });

    test('should calculate HRA correctly for metro city', () => {
      // Salary: 1200000, HRA: 300000, Rent: 240000, Metro: true
      // Min of: 300000, (50% of 1200000 = 600000), (240000 - 120000 = 120000)
      // Result: 120000
      const result = calculateHRAExemption(1200000, 300000, 240000, true);
      expect(result).toBe(120000);
    });

    test('should calculate HRA correctly for non-metro city', () => {
      // Salary: 1000000, HRA: 250000, Rent: 200000, Metro: false
      // Min of: 250000, (40% of 1000000 = 400000), (200000 - 100000 = 100000)
      // Result: 100000
      const result = calculateHRAExemption(1000000, 250000, 200000, false);
      expect(result).toBe(100000);
    });

    test('should handle rent less than 10% of salary', () => {
      // Salary: 1000000, HRA: 200000, Rent: 50000, Metro: true
      // Min of: 200000, (50% of 1000000 = 500000), (50000 - 100000 = 0, max 0)
      // Result: 0
      const result = calculateHRAExemption(1000000, 200000, 50000, true);
      expect(result).toBe(0);
    });

    test('should cap HRA at actual percentage of salary', () => {
      // Salary: 1000000, HRA: 600000, Rent: 400000, Metro: true
      // Min of: 600000, (50% of 1000000 = 500000), (400000 - 100000 = 300000)
      // Result: 300000
      const result = calculateHRAExemption(1000000, 600000, 400000, true);
      expect(result).toBe(300000);
    });
  });

  describe('calculateNewRegimeTax', () => {
    test('should return 0 for income less than 3,00,000', () => {
      const result = calculateNewRegimeTax(250000);
      expect(result).toBe(0);
    });

    test('should calculate tax at 5% slab correctly', () => {
      // Taxable income after deduction: 500000
      // 400000 @ 0% = 0
      // 100000 @ 5% = 5000
      const result = calculateNewRegimeTax(500000);
      expect(result).toBe(5000);
    });

    test('should calculate tax for multiple slabs correctly', () => {
      // Income: 1000000
      // 400000 @ 0% = 0
      // 400000 @ 5% = 20000
      // 200000 @ 10% = 20000
      // Total: 40000
      const result = calculateNewRegimeTax(1000000);
      expect(result).toBe(40000);
    });

    test('should calculate tax for high income correctly', () => {
      // Income: 1600000
      // 400000 @ 0% = 0
      // 400000 @ 5% = 20000
      // 400000 @ 10% = 40000
      // 400000 @ 15% = 60000
      // Total: 120000
      const result = calculateNewRegimeTax(1600000);
      expect(result).toBe(120000);
    });

    test('should return 0 for zero or negative income', () => {
      expect(calculateNewRegimeTax(0)).toBe(0);
      expect(calculateNewRegimeTax(-100000)).toBe(0);
    });
  });

  describe('calculateOldRegimeTax', () => {
    test('should return 0 for income less than 2,50,000', () => {
      const result = calculateOldRegimeTax(200000);
      expect(result).toBe(0);
    });

    test('should calculate tax at 5% slab correctly', () => {
      // Income: 300000 (250000 tax-free + 50000 @ 5%)
      // Tax: 50000 * 0.05 = 2500
      const result = calculateOldRegimeTax(300000);
      expect(result).toBe(2500);
    });

    test('should calculate tax for multiple slabs correctly', () => {
      // Income: 600000
      // 250000 @ 0% = 0
      // 250000 @ 5% = 12500
      // 100000 @ 20% = 20000
      // Total: 32500
      const result = calculateOldRegimeTax(600000);
      expect(result).toBe(32500);
    });

    test('should calculate tax for high income correctly', () => {
      // Income: 1200000
      // 250000 @ 0% = 0
      // 250000 @ 5% = 12500
      // 500000 @ 20% = 100000
      // 200000 @ 30% = 60000
      // Total: 172500
      const result = calculateOldRegimeTax(1200000);
      expect(result).toBe(172500);
    });

    test('should return 0 for zero or negative income', () => {
      expect(calculateOldRegimeTax(0)).toBe(0);
      expect(calculateOldRegimeTax(-100000)).toBe(0);
    });
  });

  describe('calculateTax - New Regime', () => {
    test('should calculate tax for new regime with only salary', () => {
      const input = {
        incomeFromSalary: 1000000,
        incomeFromRent: 0,
        hraComponent: 0,
        annualRent: 0,
        section80C: 0,
        regime: 'new',
        isMetro: false
      };

      const result = calculateTax(input);

      expect(result.regime).toBe('new');
      expect(result.grossIncome).toBe(1000000);
      expect(result.totalDeductions).toBe(75000); // New regime standard deduction
      expect(result.taxableIncome).toBe(925000);
      // 400000 @ 0% = 0, 400000 @ 5% = 20000, 125000 @ 10% = 12500 = 32500
      expect(result.incomeTax).toBe(32500);
      expect(result.cess).toBe(1300); // 4% of 32500
      expect(result.totalTaxLiability).toBe(33800);
    });

    test('should ignore HRA and 80C in new regime', () => {
      const input = {
        incomeFromSalary: 1000000,
        incomeFromRent: 0,
        hraComponent: 300000,
        annualRent: 240000,
        section80C: 150000,
        regime: 'new',
        isMetro: true
      };

      const result = calculateTax(input);

      // HRA and 80C should be 0 in new regime
      expect(result.breakdown.hraExemption).toBe(0);
      expect(result.breakdown.section80C).toBe(0);
      expect(result.totalDeductions).toBe(75000); // Only standard deduction (new regime)
    });

    test('should include rental income in gross income', () => {
      const input = {
        incomeFromSalary: 800000,
        incomeFromRent: 200000,
        hraComponent: 0,
        annualRent: 0,
        section80C: 0,
        regime: 'new',
        isMetro: false
      };

      const result = calculateTax(input);

      expect(result.grossIncome).toBe(1000000);
      expect(result.totalDeductions).toBe(75000);
      expect(result.taxableIncome).toBe(925000);
    });
  });

  describe('calculateTax - Old Regime', () => {
    test('should calculate tax for old regime with HRA', () => {
      const input = {
        incomeFromSalary: 1200000,
        incomeFromRent: 0,
        hraComponent: 300000,
        annualRent: 240000,
        section80C: 0,
        regime: 'old',
        isMetro: true
      };

      const result = calculateTax(input);

      expect(result.regime).toBe('old');
      expect(result.grossIncome).toBe(1200000);
      expect(result.breakdown.hraExemption).toBe(120000); // Calculated as min of three values
      expect(result.totalDeductions).toBe(170000); // 50000 standard + 120000 HRA
      expect(result.taxableIncome).toBe(1030000);
    });

    test('should apply Section 80C deduction in old regime', () => {
      const input = {
        incomeFromSalary: 1000000,
        incomeFromRent: 0,
        hraComponent: 0,
        annualRent: 0,
        section80C: 150000,
        regime: 'old',
        isMetro: false
      };

      const result = calculateTax(input);

      expect(result.breakdown.section80C).toBe(150000);
      expect(result.totalDeductions).toBe(200000); // 50000 standard + 150000 80C
      expect(result.taxableIncome).toBe(800000);
    });

    test('should cap Section 80C at limit', () => {
      const input = {
        incomeFromSalary: 1000000,
        incomeFromRent: 0,
        hraComponent: 0,
        annualRent: 0,
        section80C: 200000, // More than limit
        regime: 'old',
        isMetro: false
      };

      const result = calculateTax(input);

      expect(result.breakdown.section80C).toBe(150000); // Capped at limit
      expect(result.totalDeductions).toBe(200000); // 50000 standard + 150000 80C (capped)
    });

    test('should apply HRA and 80C together in old regime', () => {
      const input = {
        incomeFromSalary: 1200000,
        incomeFromRent: 0,
        hraComponent: 300000,
        annualRent: 240000,
        section80C: 150000,
        regime: 'old',
        isMetro: true
      };

      const result = calculateTax(input);

      expect(result.breakdown.hraExemption).toBe(120000);
      expect(result.breakdown.section80C).toBe(150000);
      expect(result.totalDeductions).toBe(320000); // 50000 + 120000 + 150000
      expect(result.taxableIncome).toBe(880000);
    });
  });

  describe('calculateTax - Edge Cases', () => {
    test('should handle zero salary (edge case)', () => {
      const input = {
        incomeFromSalary: 0,
        incomeFromRent: 100000,
        hraComponent: 0,
        annualRent: 0,
        section80C: 0,
        regime: 'new',
        isMetro: false
      };

      const result = calculateTax(input);

      expect(result.grossIncome).toBe(100000);
      expect(result.taxableIncome).toBe(25000); // 100000 - 75000 standard deduction (new regime)
      expect(result.incomeTax).toBe(0); // Below new regime tax-free limit
    });

    test('should handle high income', () => {
      const input = {
        incomeFromSalary: 10000000,
        incomeFromRent: 5000000,
        hraComponent: 0,
        annualRent: 0,
        section80C: 0,
        regime: 'new',
        isMetro: false
      };

      const result = calculateTax(input);

      expect(result.grossIncome).toBe(15000000);
      expect(result.totalDeductions).toBe(75000);
      expect(result.taxableIncome).toBe(14925000);
      expect(result.incomeTax).toBeGreaterThan(4000000); // High income, high tax
    });

    test('should handle default regime (new)', () => {
      const input = {
        incomeFromSalary: 1000000,
        incomeFromRent: 0,
        hraComponent: 0,
        annualRent: 0,
        section80C: 0,
        regime: 'new',
        isMetro: false
      };

      const result = calculateTax(input);
      expect(result.regime).toBe('new');
    });

    test('should apply cess correctly', () => {
      const input = {
        incomeFromSalary: 1000000,
        incomeFromRent: 0,
        hraComponent: 0,
        annualRent: 0,
        section80C: 0,
        regime: 'new',
        isMetro: false
      };

      const result = calculateTax(input);

      // Cess should be 4% of income tax
      const expectedCess = result.incomeTax * 0.04;
      expect(result.cess).toBeCloseTo(expectedCess, 2);
      expect(result.totalTaxLiability).toBeCloseTo(result.incomeTax + result.cess, 2);
    });
  });

  describe('calculateTax - Comparison between regimes', () => {
    test('should compare tax liability between regimes', () => {
      const baseInput = {
        incomeFromSalary: 1000000,
        incomeFromRent: 0,
        hraComponent: 0,
        annualRent: 0,
        section80C: 0,
        isMetro: false
      };

      const newRegimeResult = calculateTax({ ...baseInput, regime: 'new' });
      const oldRegimeResult = calculateTax({ ...baseInput, regime: 'old' });

      // Both should have same gross income
      expect(newRegimeResult.grossIncome).toBe(oldRegimeResult.grossIncome);

      // But different standard deductions
      expect(newRegimeResult.breakdown.standardDeduction).toBe(75000); // New regime
      expect(oldRegimeResult.breakdown.standardDeduction).toBe(50000); // Old regime

      // Both are calculated
      expect(newRegimeResult.totalTaxLiability).toBeGreaterThan(0);
      expect(oldRegimeResult.totalTaxLiability).toBeGreaterThan(0);
    });
  });

  describe('calculateTax - Breakdown verification', () => {
    test('should provide correct breakdown', () => {
      const input = {
        incomeFromSalary: 1200000,
        incomeFromRent: 0,
        hraComponent: 300000,
        annualRent: 240000,
        section80C: 150000,
        regime: 'old',
        isMetro: true
      };

      const result = calculateTax(input);

      expect(result.breakdown).toHaveProperty('standardDeduction');
      expect(result.breakdown).toHaveProperty('hraExemption');
      expect(result.breakdown).toHaveProperty('section80C');
      expect(result.breakdown.standardDeduction).toBe(50000); // Old regime standard deduction

      const totalBreakdown =
        result.breakdown.standardDeduction +
        result.breakdown.hraExemption +
        result.breakdown.section80C;

      expect(totalBreakdown).toBe(result.totalDeductions);
    });
  });
});
