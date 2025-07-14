# Backend Testing Guide - Sticker Pricing API

## Overview
This guide provides step-by-step instructions to test the custom sticker pricing backend implementation using curl commands.

## Prerequisites
1. Ensure the Medusa development server is running: `npm run dev`
2. The server should be accessible at `http://localhost:9000`
3. Your sticker variant ID: `variant_01JVXFAJY3W3JSBH3HJPEHYRYZ`

## API Endpoints

### 1. Calculate Sticker Pricing
**Endpoint:** `POST /store/stickers/calculate-pricing`

**Purpose:** Calculate pricing for a specific quantity of stickers

**Test Cases:**

#### Test 1: Single Sticker (Base Price)
```bash
curl -X POST http://localhost:9000/store/stickers/calculate-pricing \
  -H "Content-Type: application/json" \
  -d '{
    "variantId": "variant_01JVXFAJY3W3JSBH3HJPEHYRYZ",
    "quantity": 1
  }'
```

**Expected Response:**
```json
{
  "pricing": {
    "unitPrice": 100,
    "totalPrice": 100,
    "appliedTier": {
      "minQuantity": 1,
      "maxQuantity": 9,
      "pricePerUnit": 100
    },
    "savings": 0,
    "originalPrice": 100
  }
}
```

#### Test 2: Bulk Discount (10 stickers)
```bash
curl -X POST http://localhost:9000/store/stickers/calculate-pricing \
  -H "Content-Type: application/json" \
  -d '{
    "variantId": "variant_01JVXFAJY3W3JSBH3HJPEHYRYZ",
    "quantity": 10
  }'
```

**Expected Response:**
```json
{
  "pricing": {
    "unitPrice": 90,
    "totalPrice": 900,
    "appliedTier": {
      "minQuantity": 10,
      "maxQuantity": 24,
      "pricePerUnit": 90
    },
    "savings": 100,
    "originalPrice": 1000
  }
}
```

#### Test 3: Maximum Discount (250 stickers)
```bash
curl -X POST http://localhost:9000/store/stickers/calculate-pricing \
  -H "Content-Type: application/json" \
  -d '{
    "variantId": "variant_01JVXFAJY3W3JSBH3HJPEHYRYZ",
    "quantity": 250
  }'
```

**Expected Response:**
```json
{
  "pricing": {
    "unitPrice": 50,
    "totalPrice": 12500,
    "appliedTier": {
      "minQuantity": 200,
      "maxQuantity": null,
      "pricePerUnit": 50
    },
    "savings": 12500,
    "originalPrice": 25000
  }
}
```

#### Test 4: Error Handling - Invalid Quantity
```bash
curl -X POST http://localhost:9000/store/stickers/calculate-pricing \
  -H "Content-Type: application/json" \
  -d '{
    "variantId": "variant_01JVXFAJY3W3JSBH3HJPEHYRYZ",
    "quantity": 0
  }'
```

**Expected Response:** Error message about invalid quantity

#### Test 5: Error Handling - Non-Sticker Variant
```bash
curl -X POST http://localhost:9000/store/stickers/calculate-pricing \
  -H "Content-Type: application/json" \
  -d '{
    "variantId": "var_normal_product",
    "quantity": 5
  }'
```

**Expected Response:** Error message about non-sticker variant

### 2. Get Pricing Tiers
**Endpoint:** `GET /store/stickers/pricing-tiers`

**Purpose:** Retrieve all available pricing tiers

#### Test 6: Get All Pricing Tiers
```bash
curl -X GET "http://localhost:9000/store/stickers/pricing-tiers"
```

**Expected Response:**
```json
{
  "pricingTiers": [
    {
      "minQuantity": 1,
      "maxQuantity": 9,
      "pricePerUnit": 100
    },
    {
      "minQuantity": 10,
      "maxQuantity": 24,
      "pricePerUnit": 90
    },
    {
      "minQuantity": 25,
      "maxQuantity": 49,
      "pricePerUnit": 80
    },
    {
      "minQuantity": 50,
      "maxQuantity": 99,
      "pricePerUnit": 70
    },
    {
      "minQuantity": 100,
      "maxQuantity": 199,
      "pricePerUnit": 60
    },
    {
      "minQuantity": 200,
      "maxQuantity": null,
      "pricePerUnit": 50
    }
  ]
}
```

#### Test 7: Get Pricing Tiers for Specific Variant
```bash
curl -X GET "http://localhost:9000/store/stickers/pricing-tiers?variantId=variant_01JVXFAJY3W3JSBH3HJPEHYRYZ"
```

### 3. Calculate Cart Pricing
**Endpoint:** `POST /store/carts/{cartId}/stickers/update-pricing`

**Purpose:** Calculate pricing for mixed cart items

#### Test 8: Mixed Cart Calculation
```bash
curl -X POST http://localhost:9000/store/carts/cart_123/stickers/update-pricing \
  -H "Content-Type: application/json" \
  -d '{
    "cartItems": [
      {
        "variantId": "variant_01JVXFAJY3W3JSBH3HJPEHYRYZ",
        "quantity": 15
      },
      {
        "variantId": "var_normal_product",
        "quantity": 2
      }
    ]
  }'
```

**Expected Response:**
```json
{
  "cartId": "cart_123",
  "stickerPricing": {
    "stickerItems": [
      {
        "variantId": "variant_01JVXFAJY3W3JSBH3HJPEHYRYZ",
        "quantity": 15,
        "unitPrice": 90,
        "totalPrice": 1350,
        "appliedTier": {
          "minQuantity": 10,
          "maxQuantity": 24,
          "pricePerUnit": 90
        }
      }
    ],
    "totalStickerPrice": 1350,
    "totalSavings": 150
  }
}
```

## Pricing Tier Breakdown

| Quantity Range | Price per Unit | Example Total (for max qty) |
|----------------|----------------|------------------------------|
| 1-9            | $1.00 (100¢)   | 9 × $1.00 = $9.00           |
| 10-24          | $0.90 (90¢)    | 24 × $0.90 = $21.60         |
| 25-49          | $0.80 (80¢)    | 49 × $0.80 = $39.20         |
| 50-99          | $0.70 (70¢)    | 99 × $0.70 = $69.30         |
| 100-199        | $0.60 (60¢)    | 199 × $0.60 = $119.40       |
| 200+           | $0.50 (50¢)    | 250 × $0.50 = $125.00       |

## Testing Checklist

- [ ] Test 1: Single sticker pricing (base price)
- [ ] Test 2: Bulk discount for 10 stickers
- [ ] Test 3: Maximum discount for 200+ stickers
- [ ] Test 4: Error handling for invalid quantity
- [ ] Test 5: Error handling for non-sticker variant
- [ ] Test 6: Get all pricing tiers
- [ ] Test 7: Get pricing tiers for specific variant
- [ ] Test 8: Mixed cart calculation

## Notes

1. **Currency:** All prices are in cents (USD). $1.00 = 100 cents
2. **Savings Calculation:** Based on difference from base price (tier 1)
3. **Mixed Carts:** Only sticker variants are processed by the custom pricing logic
4. **Error Handling:** Invalid inputs return appropriate error messages
5. **Extensibility:** The pricing calculator can be easily modified to add new tiers or logic

## Next Steps

Once all tests pass successfully:
1. Verify the module is properly registered in Medusa
2. Test integration with actual Medusa cart functionality
3. Proceed with frontend implementation
4. Test end-to-end user flows

## Troubleshooting

If you encounter issues:
1. Check that the development server is running
2. Verify the sticker variant ID is correct
3. Ensure all TypeScript files are compiled without errors
4. Check the server logs for detailed error messages 