# Indian Income Tax Calculator Service - Implementation Plan

## Context
This plan designs a Node.js HTTP service to calculate Indian income tax for individuals. The service needs to support both the new and old tax regimes, handle various income sources (salary, rent), and compute deductions like HRA exemption and Section 80C. This addresses the need for a simple API-based tax calculator that can be integrated into financial planning applications.

## Project Structure

```
it-calculator-service/
├── src/
│   ├── index.js                 # Entry point, Express server setup
│   ├── routes/
│   │   └── taxRoutes.js         # API route definitions
│   ├── controllers/
│   │   └── taxController.js     # Request handling logic
│   ├── services/
│   │   └── taxCalculator.js     # Core tax calculation logic
│   └── utils/
│       ├── validator.js          # Input validation
│       └── constants.js          # Tax slabs and constants
├── tests/
│   └── taxCalculator.test.js    # Unit tests
├── package.json
├── .gitignore
├── .env.example
└── README.md
```

## API Endpoints

### 1. GET /health
- **Purpose:** Health check endpoint
- **Response:** `{ "status": "ok", "timestamp": ISO_timestamp }`
- **Status Code:** 200

### 2. POST /calculate-tax
- **Purpose:** Calculate income tax based on provided parameters
- **Request Body:**
  ```json
  {
    "incomeFromSalary": number (mandatory),
    "incomeFromRent": number (optional, default: 0),
    "hraComponent": number (optional, default: 0),
    "annualRent": number (optional, default: 0),
    "section80C": number (optional, default: 0, max: 150000),
    "regime": string (optional, "new" or "old", default: "new"),
    "isMetro": boolean (optional, default: false)
  }
  ```
- **Response:**
  ```json
  {
    "regime": "new" | "old",
    "grossIncome": number,
    "totalDeductions": number,
    "taxableIncome": number,
    "incomeTax": number,
    "cess": number,
    "totalTaxLiability": number,
    "breakdown": {
      "hraExemption": number,
      "section80C": number,
      "standardDeduction": number
    }
  }
  ```
- **Status Codes:** 200 (success), 400 (validation error), 500 (server error)

## Tax Calculation Logic

### Indian Tax Slabs (FY 2023-24)

#### New Regime (Default)
- Up to ₹3,00,000: Nil
- ₹3,00,001 - ₹6,00,000: 5%
- ₹6,00,001 - ₹9,00,000: 10%
- ₹9,00,001 - ₹12,00,000: 15%
- ₹12,00,001 - ₹15,00,000: 20%
- Above ₹15,00,000: 30%
- Standard Deduction: ₹50,000
- **Note:** Section 80C and HRA exemptions NOT allowed

#### Old Regime
- Up to ₹2,50,000: Nil
- ₹2,50,001 - ₹5,00,000: 5%
- ₹5,00,001 - ₹10,00,000: 20%
- Above ₹10,00,000: 30%
- Standard Deduction: ₹50,000
- Section 80C: Up to ₹1,50,000
- HRA Exemption: Applicable

#### Health & Education Cess
- 4% on calculated income tax (both regimes)

### HRA Exemption Calculation (Old Regime Only)

The HRA exemption is the **minimum** of:
1. Actual HRA received (`hraComponent`)
2. 50% of salary (if metro) OR 40% of salary (if non-metro)
   - Salary = `incomeFromSalary`
3. Actual rent paid minus 10% of salary
   - Rent paid = `annualRent`

**Formula:**
```
hraExemption = min(
  hraComponent,
  isMetro ? (salary * 0.50) : (salary * 0.40),
  max(0, annualRent - (salary * 0.10))
)
```

If `annualRent` is 0 or `hraComponent` is 0, HRA exemption = 0

## Implementation Steps

### Step 1: Project Initialization
- Initialize npm project with `package.json`
- Install dependencies:
  - `express` - HTTP server framework
  - `dotenv` - Environment variable management
  - `nodemon` - Development auto-reload (dev dependency)
  - `jest` - Testing framework (dev dependency, optional)
- Create `.gitignore` (node_modules, .env, etc.)
- Create `.env.example` for environment variables (PORT, etc.)

### Step 2: Core Tax Calculation Service
**File:** `src/services/taxCalculator.js`
- Implement `calculateTax(input)` function
- Implement regime-specific calculation functions:
  - `calculateNewRegimeTax(taxableIncome)`
  - `calculateOldRegimeTax(taxableIncome)`
- Implement `calculateHRAExemption(salary, hraComponent, annualRent, isMetro)`
- Handle edge cases (negative values, invalid inputs)

### Step 3: Constants and Configuration
**File:** `src/utils/constants.js`
- Define tax slabs for both regimes
- Define standard deduction amount
- Define 80C limit
- Define cess percentage

### Step 4: Input Validation
**File:** `src/utils/validator.js`
- Validate mandatory field: `incomeFromSalary`
- Validate numeric fields are non-negative
- Validate `regime` is either "new" or "old"
- Validate `section80C` doesn't exceed ₹1,50,000
- Return descriptive error messages

### Step 5: Controller Layer
**File:** `src/controllers/taxController.js`
- `healthCheck()` - Returns health status
- `calculateTaxHandler()` - Handles POST request:
  - Extract and validate input
  - Call tax calculation service
  - Return formatted response
  - Handle errors with appropriate status codes

### Step 6: Routes
**File:** `src/routes/taxRoutes.js`
- Define GET /health route
- Define POST /calculate-tax route
- Export router

### Step 7: Server Setup
**File:** `src/index.js`
- Initialize Express app
- Configure middleware (express.json(), CORS if needed)
- Mount routes
- Start server on configured PORT (default: 3000)
- Add error handling middleware

### Step 8: Documentation
**File:** `README.md`
- Project overview
- Installation instructions
- API documentation with examples
- Sample requests/responses

### Step 9: Testing (Optional)
**File:** `tests/taxCalculator.test.js`
- Test new regime calculations
- Test old regime calculations
- Test HRA exemption logic
- Test edge cases (zero income, maximum deductions, etc.)

## Verification Plan

### Manual Testing
1. **Start the server:**
   ```bash
   npm install
   npm start
   ```

2. **Test health endpoint:**
   ```bash
   curl http://localhost:3000/health
   ```
   Expected: `{"status":"ok","timestamp":"..."}`

3. **Test new regime calculation:**
   ```bash
   curl -X POST http://localhost:3000/calculate-tax \
     -H "Content-Type: application/json" \
     -d '{"incomeFromSalary": 800000}'
   ```
   Expected: Tax calculation with new regime

4. **Test old regime with HRA:**
   ```bash
   curl -X POST http://localhost:3000/calculate-tax \
     -H "Content-Type: application/json" \
     -d '{
       "incomeFromSalary": 1000000,
       "hraComponent": 300000,
       "annualRent": 240000,
       "section80C": 150000,
       "regime": "old",
       "isMetro": true
     }'
   ```
   Expected: Tax calculation with HRA exemption and 80C deduction

5. **Test validation:**
   ```bash
   curl -X POST http://localhost:3000/calculate-tax \
     -H "Content-Type: application/json" \
     -d '{}'
   ```
   Expected: 400 error with validation message

### Automated Testing (if implemented)
```bash
npm test
```

## Key Implementation Notes

1. **Mandatory Field:** Only `incomeFromSalary` is mandatory; all other fields have sensible defaults
2. **Regime-Specific Rules:**
   - New regime: No HRA, no 80C, higher tax-free limit, more slabs
   - Old regime: HRA and 80C allowed, lower tax-free limit
3. **HRA Only Applicable:** When old regime is selected AND both `hraComponent` and `annualRent` are provided
4. **Section 80C Limit:** Capped at ₹1,50,000 even if user provides higher value
5. **Standard Deduction:** ₹50,000 available in both regimes
6. **Cess:** 4% health and education cess on calculated tax
7. **Income Sources:** Total income = salary + rental income

## Dependencies

```json
{
  "dependencies": {
    "express": "^4.18.2",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.1",
    "jest": "^29.7.0"
  }
}
```

## Environment Variables

```
PORT=3000
NODE_ENV=development
```

This plan provides a complete, production-ready Indian income tax calculator service with proper separation of concerns, validation, and support for both tax regimes.
