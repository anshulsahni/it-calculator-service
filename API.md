# Indian Income Tax Calculator API Documentation

## Overview
A REST API service for calculating Indian income tax supporting both new and old tax regimes (FY 2025-26 / AY 2026-27).

## Base URL
```
http://localhost:5000
```

---

## Endpoints

### 1. Health Check
Verify that the API is running and responsive.

**Endpoint:** `GET /health`

**Response:** `200 OK`
```json
{
  "status": "ok",
  "timestamp": "2026-02-08T10:30:45.123Z"
}
```

---

### 2. Calculate Tax
Calculate income tax based on provided income and deductions.

**Endpoint:** `POST /calculate-tax`

**Request Body:**
```json
{
  "incomeFromSalary": 600000,
  "incomeFromRent": 0,
  "hraComponent": 100000,
  "annualRent": 300000,
  "section80C": 150000,
  "regime": "new",
  "isMetro": true
}
```

#### Request Parameters

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `incomeFromSalary` | number | Yes | - | Annual salary income (in ₹) |
| `incomeFromRent` | number | No | 0 | Annual rental income (in ₹) |
| `hraComponent` | number | No | 0 | HRA component of salary (in ₹). Used only in old regime |
| `annualRent` | number | No | 0 | Annual rent paid (in ₹). Required to calculate HRA exemption in old regime |
| `section80C` | number | No | 0 | Section 80C deductions (in ₹), capped at ₹150,000. Used only in old regime |
| `regime` | string | No | "new" | Tax regime: `"new"` or `"old"` |
| `isMetro` | boolean | No | false | Whether residence is in a metro city. Affects HRA calculation in old regime |

#### Validation Rules
- `incomeFromSalary` is **mandatory**
- All numeric fields must be non-negative
- `section80C` is automatically capped at ₹150,000 (excess is ignored)
- `regime` must be either `"new"` or `"old"`
- `isMetro` must be a boolean value

#### Success Response (200 OK)
```json
{
  "regime": "new",
  "grossIncome": 600000,
  "totalDeductions": 75000,
  "taxableIncome": 525000,
  "incomeTax": 6250,
  "cess": 250,
  "totalTaxLiability": 6500,
  "breakdown": {
    "standardDeduction": 75000,
    "hraExemption": 0,
    "section80C": 0
  }
}
```

#### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `regime` | string | The tax regime used for calculation |
| `grossIncome` | number | Income from Salary + Income from Rent |
| `totalDeductions` | number | Sum of all applicable deductions |
| `taxableIncome` | number | Gross Income - Total Deductions |
| `incomeTax` | number | Income tax calculated based on tax slabs |
| `cess` | number | 4% Health & Education Cess on income tax |
| `totalTaxLiability` | number | Income Tax + Cess |
| `breakdown.standardDeduction` | number | Standard deduction (₹75,000 new / ₹50,000 old regime) |
| `breakdown.hraExemption` | number | HRA exemption (old regime only) |
| `breakdown.section80C` | number | Section 80C deduction (old regime only) |

#### Error Response (400 Bad Request)
```json
{
  "error": "Validation failed",
  "errors": [
    "incomeFromSalary is mandatory",
    "section80C cannot exceed ₹150,000"
  ]
}
```

#### Error Response (500 Internal Server Error)
```json
{
  "error": "Internal server error",
  "message": "Error message details"
}
```

---

## Tax Calculation Details

### New Regime
- **Standard Deduction:** ₹75,000
- **HRA Exemption:** Not allowed
- **Section 80C:** Not allowed
- **Tax Slabs:**
  - ₹0 - ₹3,99,999: 0%
  - ₹4,00,000 - ₹7,99,999: 5%
  - ₹8,00,000 - ₹11,99,999: 10%
  - ₹12,00,000 - ₹15,99,999: 15%
  - ₹16,00,000 - ₹19,99,999: 20%
  - ₹20,00,000 - ₹23,99,999: 25%
  - Above ₹24,00,000: 30%

### Old Regime
- **Standard Deduction:** ₹50,000
- **HRA Exemption:** Applicable (minimum of: actual HRA, 50%/40% of salary, rent - 10% of salary)
- **Section 80C:** Up to ₹150,000
- **Tax Slabs:**
  - ₹0 - ₹2,49,999: 0%
  - ₹2,50,000 - ₹4,99,999: 5%
  - ₹5,00,000 - ₹9,99,999: 20%
  - Above ₹10,00,000: 30%

#### HRA Exemption Calculation
HRA exemption is the **minimum** of:
1. Actual HRA received
2. 50% of salary (if metro) / 40% of salary (if non-metro)
3. Actual rent paid - 10% of salary

**Note:** HRA exemption is only calculated when both `hraComponent` and `annualRent` are provided.

---

## Example Requests

### Example 1: New Regime (Simple)
```bash
curl -X POST http://localhost:5000/calculate-tax \
  -H "Content-Type: application/json" \
  -d '{
    "incomeFromSalary": 500000
  }'
```

### Example 2: Old Regime (With HRA)
```bash
curl -X POST http://localhost:5000/calculate-tax \
  -H "Content-Type: application/json" \
  -d '{
    "incomeFromSalary": 600000,
    "hraComponent": 120000,
    "annualRent": 300000,
    "section80C": 150000,
    "regime": "old",
    "isMetro": true
  }'
```

### Example 3: With Rental Income
```bash
curl -X POST http://localhost:5000/calculate-tax \
  -H "Content-Type: application/json" \
  -d '{
    "incomeFromSalary": 800000,
    "incomeFromRent": 200000,
    "regime": "new"
  }'
```

---

## Error Handling

The API returns appropriate HTTP status codes:

- **200 OK:** Successful tax calculation
- **400 Bad Request:** Validation error in request body
- **500 Internal Server Error:** Server-side error during processing

Always check the response status and error messages for debugging.

---

## Notes
- All monetary values should be in Indian Rupees (₹)
- Amounts are rounded to 2 decimal places in responses
- The API is stateless; each request is independent
- No authentication is required for the current version
