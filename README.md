# Indian Income Tax Calculator Service

A Node.js HTTP service to calculate Indian income tax for individuals supporting both the new and old tax regimes (FY 2023-24).

## Features

- **Dual Tax Regime Support**: Calculate tax using either the new or old regime
- **Multiple Income Sources**: Handle salary, rental income, and other deductions
- **HRA Exemption**: Automatic HRA calculation for old regime with metro/non-metro distinction
- **Section 80C Deductions**: Support for up to ₹1.5 lakhs deduction in old regime
- **Standard Deduction**: ₹75,000 in new regime, ₹50,000 in old regime
- **Health & Education Cess**: 4% cess on calculated income tax
- **Input Validation**: Comprehensive validation with descriptive error messages
- **REST API**: Simple JSON-based API endpoints

## Project Structure

```
it-calculator-service/
├── src/
│   ├── index.js                 # Express server setup
│   ├── routes/
│   │   └── taxRoutes.js         # API route definitions
│   ├── controllers/
│   │   └── taxController.js     # Request handlers
│   ├── services/
│   │   └── taxCalculator.js     # Core tax calculation logic
│   └── utils/
│       ├── validator.js          # Input validation
│       └── constants.js          # Tax slabs and constants
├── tests/
│   └── taxCalculator.test.js    # Unit tests
├── package.json
├── .env.example
├── .gitignore
└── README.md
```

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd it-calculator-service
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create environment file**
   ```bash
   cp .env.example .env
   ```

4. **Start the server**
   ```bash
   npm start
   ```

   Or for development with auto-reload:
   ```bash
   npm run dev
   ```

The service will start on `http://localhost:3000`

## API Endpoints

### 1. Health Check

**Endpoint:** `GET /health`

**Description:** Check if the service is running

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-02-08T10:30:45.123Z"
}
```

**Status Code:** 200

---

### 2. Calculate Income Tax

**Endpoint:** `POST /calculate-tax`

**Description:** Calculate income tax based on provided financial details

#### Request Body

```json
{
  "incomeFromSalary": 1000000,          // Mandatory - Annual salary
  "incomeFromRent": 0,                  // Optional (default: 0) - Annual rental income
  "hraComponent": 300000,               // Optional (default: 0) - HRA component of salary
  "annualRent": 240000,                 // Optional (default: 0) - Annual rent paid
  "section80C": 150000,                 // Optional (default: 0, max: 150000) - 80C deduction
  "regime": "new",                      // Optional (default: "new") - "new" or "old"
  "isMetro": true                       // Optional (default: false) - Metro city indicator
}
```

#### Response (Success - 200)

```json
{
  "regime": "new",
  "grossIncome": 1000000,
  "totalDeductions": 75000,
  "taxableIncome": 925000,
  "incomeTax": 32500,
  "cess": 1300,
  "totalTaxLiability": 33800,
  "breakdown": {
    "standardDeduction": 75000,
    "hraExemption": 0,
    "section80C": 0
  }
}
```

#### Response (Validation Error - 400)

```json
{
  "error": "Validation failed",
  "errors": [
    "incomeFromSalary is mandatory",
    "section80C cannot exceed ₹150,000"
  ]
}
```

#### Response (Server Error - 500)

```json
{
  "error": "Internal server error",
  "message": "Error details"
}
```

## Tax Slabs (FY 2025-26 / AY 2026-27)

### New Regime (Default)
| Income Range | Tax Rate |
|---|---|
| Up to ₹4,00,000 | Nil |
| ₹4,00,001 - ₹8,00,000 | 5% |
| ₹8,00,001 - ₹12,00,000 | 10% |
| ₹12,00,001 - ₹16,00,000 | 15% |
| ₹16,00,001 - ₹20,00,000 | 20% |
| ₹20,00,001 - ₹24,00,000 | 25% |
| Above ₹24,00,000 | 30% |

**Deductions:**
- Standard Deduction: ₹75,000
- No HRA exemption
- No Section 80C deduction

### Old Regime
| Income Range | Tax Rate |
|---|---|
| Up to ₹2,50,000 | Nil |
| ₹2,50,001 - ₹5,00,000 | 5% |
| ₹5,00,001 - ₹10,00,000 | 20% |
| Above ₹10,00,000 | 30% |

**Deductions:**
- Standard Deduction: ₹50,000
- HRA Exemption: Applicable (calculated)
- Section 80C: Up to ₹1,50,000

## HRA Exemption Calculation (Old Regime Only)

HRA exemption is the **minimum** of:

1. Actual HRA received
2. 50% of salary (if metro) OR 40% of salary (if non-metro)
3. Actual rent paid minus 10% of salary

**Example:**
- Salary: ₹12,00,000
- HRA: ₹3,00,000
- Annual rent: ₹2,40,000
- Metro: Yes

Calculation:
- Actual HRA: ₹3,00,000
- 50% of salary: ₹6,00,000
- Rent - 10% salary: ₹2,40,000 - ₹1,20,000 = ₹1,20,000

**HRA exemption: ₹1,20,000 (minimum)**

## Example Usage

### cURL

**Example 1: New Regime - Simple Salary**
```bash
curl -X POST http://localhost:3000/calculate-tax \
  -H "Content-Type: application/json" \
  -d '{
    "incomeFromSalary": 800000
  }'
```

**Example 2: Old Regime - With HRA and 80C**
```bash
curl -X POST http://localhost:3000/calculate-tax \
  -H "Content-Type: application/json" \
  -d '{
    "incomeFromSalary": 1200000,
    "hraComponent": 300000,
    "annualRent": 240000,
    "section80C": 150000,
    "regime": "old",
    "isMetro": true
  }'
```

**Example 3: With Rental Income**
```bash
curl -X POST http://localhost:3000/calculate-tax \
  -H "Content-Type: application/json" \
  -d '{
    "incomeFromSalary": 1000000,
    "incomeFromRent": 500000,
    "regime": "new"
  }'
```

### JavaScript/Node.js

```javascript
const axios = require('axios');

async function calculateTax() {
  try {
    const response = await axios.post('http://localhost:3000/calculate-tax', {
      incomeFromSalary: 1000000,
      hraComponent: 300000,
      annualRent: 240000,
      section80C: 150000,
      regime: 'old',
      isMetro: true
    });
    console.log('Tax Calculation Result:', response.data);
  } catch (error) {
    console.error('Error:', error.response.data);
  }
}

calculateTax();
```

### Python

```python
import requests
import json

url = 'http://localhost:3000/calculate-tax'
payload = {
    'incomeFromSalary': 1000000,
    'hraComponent': 300000,
    'annualRent': 240000,
    'section80C': 150000,
    'regime': 'old',
    'isMetro': True
}

response = requests.post(url, json=payload)
result = response.json()
print(json.dumps(result, indent=2))
```

## Running Tests

```bash
npm test
```

## Key Features & Rules

1. **Mandatory Field**: Only `incomeFromSalary` is required
2. **Regime Selection**: Defaults to "new" regime if not specified
3. **HRA Calculation**: Only calculated in old regime and only when both `hraComponent` and `annualRent` are provided
4. **Section 80C Limit**: Maximum ₹1,50,000 (capped automatically if higher value provided)
5. **Standard Deduction**: ₹75,000 (new regime), ₹50,000 (old regime)
6. **Gross Income**: Sum of salary and rental income
7. **Health & Education Cess**: 4% on calculated income tax

## Input Validation

The service validates all inputs and provides descriptive error messages for:
- Missing mandatory fields
- Invalid data types
- Negative values
- Out-of-range values (e.g., section80C > ₹1,50,000)
- Invalid regime values

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| PORT | 3000 | Server port |
| NODE_ENV | development | Environment (development/production) |

## Error Handling

The service returns appropriate HTTP status codes:
- **200**: Successful tax calculation
- **400**: Validation error (invalid input)
- **404**: Endpoint not found
- **500**: Internal server error

## Notes

- All monetary values are in Indian Rupees (₹)
- Tax calculations are based on FY 2025-26 (AY 2026-27) specifications
- HRA exemption calculation follows Indian income tax rules
- The service performs rounding to 2 decimal places for monetary values

## Development

### Project Setup
```bash
npm install
npm run dev
```

### Code Structure
- `src/services/taxCalculator.js` - Core calculation logic
- `src/utils/constants.js` - Tax slabs and configuration
- `src/utils/validator.js` - Input validation
- `src/controllers/taxController.js` - Request handlers
- `src/routes/taxRoutes.js` - API route definitions

## License

MIT

## Support

For issues or questions, please check the API documentation or open an issue in the repository.
