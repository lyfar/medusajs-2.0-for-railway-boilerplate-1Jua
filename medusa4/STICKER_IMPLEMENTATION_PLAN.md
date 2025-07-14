# Custom Sticker E-commerce Implementation Plan

## Project Overview
Build a custom sticker e-commerce website using Medusa.js v2.8.3 with progressive quantity-based pricing. The system will support mixed carts (normal products + custom stickers) with dynamic pricing calculations.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    MEDUSA BACKEND                           │
├─────────────────────────────────────────────────────────────┤
│  Custom Sticker Module                                      │
│  ├── Data Models (StickerConfig, PricingTier)              │
│  ├── Service (StickerPricingService)                       │
│  └── Business Logic                                        │
├─────────────────────────────────────────────────────────────┤
│  Custom Workflows                                          │
│  ├── calculateStickerPricingWorkflow                       │
│  ├── validateStickerCartWorkflow                           │
│  └── updateCartStickerPricingWorkflow                      │
├─────────────────────────────────────────────────────────────┤
│  Custom API Routes                                         │
│  ├── POST /store/stickers/calculate-pricing                │
│  ├── GET /store/stickers/pricing-tiers                     │
│  └── POST /store/carts/:id/stickers/update-pricing         │
├─────────────────────────────────────────────────────────────┤
│  Event Subscribers                                         │
│  ├── cart.item_added (sticker pricing recalculation)       │
│  ├── cart.item_updated (quantity changes)                  │
│  └── cart.item_removed (pricing updates)                   │
└─────────────────────────────────────────────────────────────┘
```

---

## Phase 1: Backend Implementation

### Step 1.1: Create Sticker Pricing Calculator Module

**File: `src/modules/sticker-pricing/pricing-calculator.ts`**

This is the core calculation file that will handle all pricing logic.

```typescript
export interface PricingTier {
  minQuantity: number;
  maxQuantity: number | null;
  pricePerUnit: number; // in cents
}

export interface StickerPricingConfig {
  variantId: string;
  basePrice: number; // in cents
  pricingTiers: PricingTier[];
  isActive: boolean;
}

export class StickerPricingCalculator {
  private readonly DEFAULT_STICKER_VARIANT_ID = process.env.STICKER_VARIANT_ID || "var_sticker_custom";
  
  private readonly DEFAULT_PRICING_TIERS: PricingTier[] = [
    { minQuantity: 1, maxQuantity: 9, pricePerUnit: 100 },    // $1.00 each
    { minQuantity: 10, maxQuantity: 24, pricePerUnit: 90 },   // $0.90 each
    { minQuantity: 25, maxQuantity: 49, pricePerUnit: 80 },   // $0.80 each
    { minQuantity: 50, maxQuantity: 99, pricePerUnit: 70 },   // $0.70 each
    { minQuantity: 100, maxQuantity: 199, pricePerUnit: 60 }, // $0.60 each
    { minQuantity: 200, maxQuantity: null, pricePerUnit: 50 } // $0.50 each (unlimited)
  ];

  /**
   * Calculate the total price for a given quantity of stickers
   * @param quantity - Number of stickers
   * @param variantId - Product variant ID (defaults to sticker variant)
   * @returns Object containing unit price, total price, and applied tier
   */
  calculatePricing(quantity: number, variantId?: string): {
    unitPrice: number;
    totalPrice: number;
    appliedTier: PricingTier;
    savings: number;
    originalPrice: number;
  } {
    if (quantity <= 0) {
      throw new Error("Quantity must be greater than 0");
    }

    // Check if this is a sticker variant
    if (variantId && !this.isStickerVariant(variantId)) {
      throw new Error("This calculator only handles sticker variants");
    }

    const appliedTier = this.findApplicableTier(quantity);
    const unitPrice = appliedTier.pricePerUnit;
    const totalPrice = quantity * unitPrice;
    const originalPrice = quantity * this.DEFAULT_PRICING_TIERS[0].pricePerUnit;
    const savings = originalPrice - totalPrice;

    return {
      unitPrice,
      totalPrice,
      appliedTier,
      savings,
      originalPrice
    };
  }

  /**
   * Check if a variant ID is a sticker variant
   */
  isStickerVariant(variantId: string): boolean {
    return variantId === this.DEFAULT_STICKER_VARIANT_ID;
  }

  /**
   * Get all pricing tiers
   */
  getPricingTiers(): PricingTier[] {
    return [...this.DEFAULT_PRICING_TIERS];
  }

  /**
   * Find the applicable pricing tier for a given quantity
   */
  private findApplicableTier(quantity: number): PricingTier {
    return this.DEFAULT_PRICING_TIERS.find(tier => 
      quantity >= tier.minQuantity && 
      (tier.maxQuantity === null || quantity <= tier.maxQuantity)
    ) || this.DEFAULT_PRICING_TIERS[0];
  }

  /**
   * Calculate price breakdown for multiple items in cart
   */
  calculateCartPricing(cartItems: Array<{variantId: string, quantity: number}>): {
    stickerItems: Array<{
      variantId: string;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
      appliedTier: PricingTier;
    }>;
    totalStickerPrice: number;
    totalSavings: number;
  } {
    const stickerItems = cartItems
      .filter(item => this.isStickerVariant(item.variantId))
      .map(item => {
        const pricing = this.calculatePricing(item.quantity, item.variantId);
        return {
          variantId: item.variantId,
          quantity: item.quantity,
          unitPrice: pricing.unitPrice,
          totalPrice: pricing.totalPrice,
          appliedTier: pricing.appliedTier
        };
      });

    const totalStickerPrice = stickerItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const totalOriginalPrice = stickerItems.reduce((sum, item) => 
      sum + (item.quantity * this.DEFAULT_PRICING_TIERS[0].pricePerUnit), 0
    );
    const totalSavings = totalOriginalPrice - totalStickerPrice;

    return {
      stickerItems,
      totalStickerPrice,
      totalSavings
    };
  }
}
```

### Step 1.2: Create Sticker Pricing Data Models

**File: `src/modules/sticker-pricing/models/sticker-config.ts`**

```typescript
import { model } from "@medusajs/framework/utils"

export const StickerConfig = model.define("sticker_config", {
  id: model.id().primaryKey(),
  variantId: model.text().unique(),
  basePrice: model.number(), // in cents
  isActive: model.boolean().default(true),
  metadata: model.json().nullable(),
  createdAt: model.dateTime().default("now"),
  updatedAt: model.dateTime().default("now")
})

export const StickerPricingTier = model.define("sticker_pricing_tier", {
  id: model.id().primaryKey(),
  configId: model.text().searchable(),
  minQuantity: model.number(),
  maxQuantity: model.number().nullable(),
  pricePerUnit: model.number(), // in cents
  isActive: model.boolean().default(true),
  createdAt: model.dateTime().default("now"),
  updatedAt: model.dateTime().default("now")
})

// Define relationship
StickerConfig.hasMany(StickerPricingTier, {
  foreignKey: "configId"
})
```

### Step 1.3: Create Sticker Pricing Service

**File: `src/modules/sticker-pricing/service.ts`**

```typescript
import { MedusaService } from "@medusajs/framework/utils"
import { StickerConfig, StickerPricingTier } from "./models/sticker-config"
import { StickerPricingCalculator } from "./pricing-calculator"

class StickerPricingService extends MedusaService({
  StickerConfig,
  StickerPricingTier,
}) {
  private calculator = new StickerPricingCalculator()

  async calculatePricing(variantId: string, quantity: number) {
    // First check if this variant has custom configuration
    const config = await this.retrieveStickerConfig(variantId)
    
    if (config) {
      // Use database configuration
      return this.calculateFromConfig(config, quantity)
    }
    
    // Fall back to default calculator
    return this.calculator.calculatePricing(quantity, variantId)
  }

  async calculateCartPricing(cartItems: Array<{variantId: string, quantity: number}>) {
    return this.calculator.calculateCartPricing(cartItems)
  }

  async getPricingTiers(variantId?: string) {
    if (variantId) {
      const config = await this.retrieveStickerConfig(variantId)
      if (config) {
        return this.listStickerPricingTiers({ configId: config.id })
      }
    }
    
    return this.calculator.getPricingTiers()
  }

  async isStickerVariant(variantId: string): Promise<boolean> {
    try {
      const config = await this.retrieveStickerConfig(variantId)
      return !!config?.isActive
    } catch {
      return this.calculator.isStickerVariant(variantId)
    }
  }

  private async retrieveStickerConfig(variantId: string) {
    try {
      const [config] = await this.listStickerConfigs({
        variantId,
        isActive: true
      })
      return config
    } catch {
      return null
    }
  }

  private async calculateFromConfig(config: any, quantity: number) {
    const tiers = await this.listStickerPricingTiers({
      configId: config.id,
      isActive: true
    })

    const applicableTier = tiers.find(tier => 
      quantity >= tier.minQuantity && 
      (tier.maxQuantity === null || quantity <= tier.maxQuantity)
    ) || tiers[0]

    if (!applicableTier) {
      throw new Error("No applicable pricing tier found")
    }

    const unitPrice = applicableTier.pricePerUnit
    const totalPrice = quantity * unitPrice
    const originalPrice = quantity * config.basePrice
    const savings = originalPrice - totalPrice

    return {
      unitPrice,
      totalPrice,
      appliedTier: applicableTier,
      savings,
      originalPrice
    }
  }
}

export default StickerPricingService
```

### Step 1.4: Export Sticker Pricing Module

**File: `src/modules/sticker-pricing/index.ts`**

```typescript
import { Module } from "@medusajs/framework/utils"
import StickerPricingService from "./service"

export const STICKER_PRICING_MODULE = "stickerPricing"

export default Module(STICKER_PRICING_MODULE, {
  service: StickerPricingService,
})

export * from "./pricing-calculator"
export * from "./models/sticker-config"
```

### Step 1.5: Create Sticker Pricing Workflows

**File: `src/workflows/sticker-pricing/calculate-sticker-pricing.ts`**

```typescript
import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { STICKER_PRICING_MODULE } from "../../modules/sticker-pricing"
import StickerPricingService from "../../modules/sticker-pricing/service"

export type CalculateStickerPricingStepInput = {
  variantId: string
  quantity: number
}

export const calculateStickerPricingStep = createStep(
  "calculate-sticker-pricing-step",
  async (input: CalculateStickerPricingStepInput, { container }) => {
    const stickerPricingService: StickerPricingService = container.resolve(
      STICKER_PRICING_MODULE
    )

    const result = await stickerPricingService.calculatePricing(
      input.variantId, 
      input.quantity
    )

    return new StepResponse(result)
  }
)

export type CalculateCartStickerPricingStepInput = {
  cartItems: Array<{variantId: string, quantity: number}>
}

export const calculateCartStickerPricingStep = createStep(
  "calculate-cart-sticker-pricing-step",
  async (input: CalculateCartStickerPricingStepInput, { container }) => {
    const stickerPricingService: StickerPricingService = container.resolve(
      STICKER_PRICING_MODULE
    )

    const result = await stickerPricingService.calculateCartPricing(input.cartItems)

    return new StepResponse(result)
  }
)

export const calculateStickerPricingWorkflow = createWorkflow(
  "calculate-sticker-pricing",
  (input: CalculateStickerPricingStepInput) => {
    const pricing = calculateStickerPricingStep(input)
    return new WorkflowResponse(pricing)
  }
)

export const calculateCartStickerPricingWorkflow = createWorkflow(
  "calculate-cart-sticker-pricing",
  (input: CalculateCartStickerPricingStepInput) => {
    const cartPricing = calculateCartStickerPricingStep(input)
    return new WorkflowResponse(cartPricing)
  }
)
```

### Step 1.6: Create API Routes for Sticker Pricing

**File: `src/api/store/stickers/calculate-pricing/route.ts`**

```typescript
import {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { calculateStickerPricingWorkflow } from "../../../../workflows/sticker-pricing/calculate-sticker-pricing"

type PostCalculatePricingRequest = {
  variantId: string
  quantity: number
}

export const POST = async (
  req: MedusaRequest<PostCalculatePricingRequest>,
  res: MedusaResponse
) => {
  const { variantId, quantity } = req.validatedBody

  const { result } = await calculateStickerPricingWorkflow(req.scope)
    .run({
      input: { variantId, quantity }
    })

  res.json({
    pricing: result
  })
}
```

**File: `src/api/store/stickers/calculate-pricing/validators.ts`**

```typescript
import { z } from "zod"

export const PostCalculatePricingRequest = z.object({
  variantId: z.string().min(1, "Variant ID is required"),
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
})
```

**File: `src/api/store/stickers/pricing-tiers/route.ts`**

```typescript
import {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { STICKER_PRICING_MODULE } from "../../../modules/sticker-pricing"
import StickerPricingService from "../../../modules/sticker-pricing/service"

export const GET = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  const stickerPricingService: StickerPricingService = req.scope.resolve(
    STICKER_PRICING_MODULE
  )

  const variantId = req.query.variantId as string
  const tiers = await stickerPricingService.getPricingTiers(variantId)

  res.json({
    pricingTiers: tiers
  })
}
```

**File: `src/api/store/carts/[id]/stickers/update-pricing/route.ts`**

```typescript
import {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { calculateCartStickerPricingWorkflow } from "../../../../../workflows/sticker-pricing/calculate-sticker-pricing"

type PostUpdateCartPricingRequest = {
  cartItems: Array<{variantId: string, quantity: number}>
}

export const POST = async (
  req: MedusaRequest<PostUpdateCartPricingRequest>,
  res: MedusaResponse
) => {
  const { cartItems } = req.validatedBody
  const cartId = req.params.id

  const { result } = await calculateCartStickerPricingWorkflow(req.scope)
    .run({
      input: { cartItems }
    })

  res.json({
    cartId,
    stickerPricing: result
  })
}
```

### Step 1.7: Add Middleware Validation

**File: `src/api/middlewares.ts`**

```typescript
import { 
  defineMiddlewares,
  validateAndTransformBody,
} from "@medusajs/framework/http"
import { PostCalculatePricingRequest } from "./store/stickers/calculate-pricing/validators"
import { z } from "zod"

const PostUpdateCartPricingRequest = z.object({
  cartItems: z.array(z.object({
    variantId: z.string(),
    quantity: z.number().int().min(1)
  }))
})

export default defineMiddlewares({
  routes: [
    {
      matcher: "/store/stickers/calculate-pricing",
      method: "POST",
      middlewares: [
        validateAndTransformBody(PostCalculatePricingRequest),
      ],
    },
    {
      matcher: "/store/carts/:id/stickers/update-pricing",
      method: "POST", 
      middlewares: [
        validateAndTransformBody(PostUpdateCartPricingRequest),
      ],
    },
  ],
})
```

### Step 1.8: Update Medusa Configuration

**File: `medusa-config.ts`**

```typescript
import { loadEnv, defineConfig } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    }
  },
  modules: [
    {
      resolve: "./src/modules/sticker-pricing",
    },
  ],
})
```

### Step 1.9: Environment Configuration

**File: `.env`** (add these variables)

```bash
# Sticker Configuration
STICKER_VARIANT_ID=var_sticker_custom
```

---

## Phase 2: Backend Testing with Curl Commands

### Step 2.1: Generate and Run Migrations

```bash
# Generate migrations for the sticker pricing module
npx medusa db:generate stickerPricing

# Run migrations
npx medusa db:migrate

# Start the development server
npm run dev
```

### Step 2.2: Backend Testing Commands

**Test 1: Calculate Single Sticker Pricing**

```bash
curl -X POST http://localhost:9000/store/stickers/calculate-pricing \
  -H "Content-Type: application/json" \
  -d '{
    "variantId": "var_sticker_custom",
    "quantity": 1
  }'
```

Expected Response:
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

**Test 2: Calculate Bulk Sticker Pricing (10 stickers)**

```bash
curl -X POST http://localhost:9000/store/stickers/calculate-pricing \
  -H "Content-Type: application/json" \
  -d '{
    "variantId": "var_sticker_custom",
    "quantity": 10
  }'
```

Expected Response:
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

**Test 3: Get Pricing Tiers**

```bash
curl -X GET "http://localhost:9000/store/stickers/pricing-tiers?variantId=var_sticker_custom" \
  -H "Content-Type: application/json"
```

**Test 4: Calculate Cart Pricing (Mixed Items)**

```bash
curl -X POST http://localhost:9000/store/carts/cart_123/stickers/update-pricing \
  -H "Content-Type: application/json" \
  -d '{
    "cartItems": [
      {
        "variantId": "var_sticker_custom",
        "quantity": 25
      },
      {
        "variantId": "var_normal_product",
        "quantity": 2
      }
    ]
  }'
```

**Test 5: Error Handling - Invalid Quantity**

```bash
curl -X POST http://localhost:9000/store/stickers/calculate-pricing \
  -H "Content-Type: application/json" \
  -d '{
    "variantId": "var_sticker_custom",
    "quantity": 0
  }'
```

**Test 6: Error Handling - Non-sticker Variant**

```bash
curl -X POST http://localhost:9000/store/stickers/calculate-pricing \
  -H "Content-Type: application/json" \
  -d '{
    "variantId": "var_normal_product",
    "quantity": 5
  }'
```

### Step 2.3: Testing Checklist

- [ ] Single sticker pricing ($1.00)
- [ ] Bulk pricing tiers (10+ stickers get discount)
- [ ] Maximum quantity pricing (200+ stickers)
- [ ] Error handling for invalid quantities
- [ ] Error handling for non-sticker variants
- [ ] Cart calculation with mixed products
- [ ] Pricing tiers endpoint returns correct data
- [ ] All API routes return proper HTTP status codes
- [ ] Currency handling (prices in cents)

---

## Phase 3: Frontend Integration Plan

### Step 3.1: Create Frontend Sticker Pricing Hook

**File: `src/storefront/hooks/use-sticker-pricing.ts`**

```typescript
import { useState, useEffect } from 'react'
import { sdk } from '../lib/sdk'

export interface StickerPricingResult {
  unitPrice: number
  totalPrice: number
  appliedTier: any
  savings: number
  originalPrice: number
}

export const useStickerPricing = (variantId: string, quantity: number) => {
  const [pricing, setPricing] = useState<StickerPricingResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!variantId || quantity <= 0) return

    const calculatePricing = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await sdk.client.fetch('/store/stickers/calculate-pricing', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            variantId,
            quantity,
          }),
        })

        if (!response.ok) {
          throw new Error('Failed to calculate pricing')
        }

        const data = await response.json()
        setPricing(data.pricing)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    calculatePricing()
  }, [variantId, quantity])

  return { pricing, loading, error }
}
```

### Step 3.2: Create Sticker Pricing Display Component

**File: `src/storefront/components/sticker-pricing-display.tsx`**

```typescript
import React from 'react'
import { useStickerPricing } from '../hooks/use-sticker-pricing'

interface StickerPricingDisplayProps {
  variantId: string
  quantity: number
  className?: string
}

export const StickerPricingDisplay: React.FC<StickerPricingDisplayProps> = ({
  variantId,
  quantity,
  className = ''
}) => {
  const { pricing, loading, error } = useStickerPricing(variantId, quantity)

  if (loading) return <div className={className}>Calculating price...</div>
  if (error) return <div className={`${className} text-red-500`}>Error: {error}</div>
  if (!pricing) return null

  const unitPriceDisplay = (pricing.unitPrice / 100).toFixed(2)
  const totalPriceDisplay = (pricing.totalPrice / 100).toFixed(2)
  const savingsDisplay = (pricing.savings / 100).toFixed(2)

  return (
    <div className={`sticker-pricing ${className}`}>
      <div className="pricing-summary">
        <div className="unit-price">
          ${unitPriceDisplay} each
        </div>
        <div className="total-price text-lg font-bold">
          Total: ${totalPriceDisplay}
        </div>
        {pricing.savings > 0 && (
          <div className="savings text-green-600">
            You save: ${savingsDisplay}
          </div>
        )}
      </div>
      
      <div className="pricing-tier-info text-sm text-gray-600">
        Tier: {pricing.appliedTier.minQuantity}
        {pricing.appliedTier.maxQuantity ? `-${pricing.appliedTier.maxQuantity}` : '+'} 
        stickers at ${unitPriceDisplay} each
      </div>
    </div>
  )
}
```

### Step 3.3: Product Page Integration

**File: `src/storefront/components/product-page-sticker-integration.tsx`**

```typescript
import React, { useState, useEffect } from 'react'
import { StickerPricingDisplay } from './sticker-pricing-display'

interface ProductPageStickerIntegrationProps {
  product: any
  selectedVariant: any
  quantity: number
  onQuantityChange: (quantity: number) => void
}

export const ProductPageStickerIntegration: React.FC<ProductPageStickerIntegrationProps> = ({
  product,
  selectedVariant,
  quantity,
  onQuantityChange
}) => {
  const [isStickerProduct, setIsStickerProduct] = useState(false)

  useEffect(() => {
    // Check if this is a sticker product
    const checkStickerProduct = async () => {
      if (!selectedVariant?.id) return

      try {
        const response = await fetch('/store/stickers/calculate-pricing', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            variantId: selectedVariant.id,
            quantity: 1
          })
        })
        
        setIsStickerProduct(response.ok)
      } catch {
        setIsStickerProduct(false)
      }
    }

    checkStickerProduct()
  }, [selectedVariant?.id])

  if (!isStickerProduct || !selectedVariant) {
    // Render normal product pricing
    return (
      <div className="product-pricing">
        <div className="price">
          ${(selectedVariant.calculated_price?.calculated_amount / 100).toFixed(2)}
        </div>
        <div className="quantity-selector">
          <button onClick={() => onQuantityChange(Math.max(1, quantity - 1))}>
            -
          </button>
          <span>{quantity}</span>
          <button onClick={() => onQuantityChange(quantity + 1)}>
            +
          </button>
        </div>
      </div>
    )
  }

  // Render sticker product with custom pricing
  return (
    <div className="sticker-product-pricing">
      <StickerPricingDisplay 
        variantId={selectedVariant.id}
        quantity={quantity}
        className="mb-4"
      />
      
      <div className="quantity-selector mb-4">
        <label className="block text-sm font-medium mb-2">
          Quantity
        </label>
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
            className="px-3 py-1 border rounded"
          >
            -
          </button>
          <input
            type="number"
            value={quantity}
            onChange={(e) => onQuantityChange(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-20 px-3 py-1 border rounded text-center"
            min="1"
          />
          <button 
            onClick={() => onQuantityChange(quantity + 1)}
            className="px-3 py-1 border rounded"
          >
            +
          </button>
        </div>
      </div>

      <div className="bulk-pricing-info">
        <h4 className="font-medium mb-2">Bulk Pricing Available:</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>1-9 stickers: $1.00 each</li>
          <li>10-24 stickers: $0.90 each</li>
          <li>25-49 stickers: $0.80 each</li>
          <li>50-99 stickers: $0.70 each</li>
          <li>100-199 stickers: $0.60 each</li>
          <li>200+ stickers: $0.50 each</li>
        </ul>
      </div>
    </div>
  )
}
```

### Step 3.4: Cart Integration

**File: `src/storefront/components/cart-sticker-integration.tsx`**

```typescript
import React, { useState, useEffect } from 'react'

interface CartStickerIntegrationProps {
  cartItems: any[]
  onUpdateCart: (items: any[]) => void
}

export const CartStickerIntegration: React.FC<CartStickerIntegrationProps> = ({
  cartItems,
  onUpdateCart
}) => {
  const [stickerPricing, setStickerPricing] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const updateStickerPricing = async () => {
      const stickerItems = cartItems.filter(item => 
        item.variant_id === process.env.NEXT_PUBLIC_STICKER_VARIANT_ID
      )

      if (stickerItems.length === 0) {
        setStickerPricing(null)
        return
      }

      setLoading(true)

      try {
        const response = await fetch(`/store/carts/${cartItems[0]?.cart_id}/stickers/update-pricing`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cartItems: cartItems.map(item => ({
              variantId: item.variant_id,
              quantity: item.quantity
            }))
          })
        })

        if (response.ok) {
          const data = await response.json()
          setStickerPricing(data.stickerPricing)
        }
      } catch (error) {
        console.error('Failed to update sticker pricing:', error)
      } finally {
        setLoading(false)
      }
    }

    updateStickerPricing()
  }, [cartItems])

  const renderCartItem = (item: any) => {
    const isStickerItem = item.variant_id === process.env.NEXT_PUBLIC_STICKER_VARIANT_ID
    
    if (!isStickerItem) {
      // Render normal cart item
      return (
        <div key={item.id} className="cart-item">
          <div className="item-info">
            <h3>{item.title}</h3>
            <p>Quantity: {item.quantity}</p>
          </div>
          <div className="item-price">
            ${(item.unit_price / 100).toFixed(2)} each
          </div>
          <div className="item-total">
            ${(item.total / 100).toFixed(2)}
          </div>
        </div>
      )
    }

    // Render sticker cart item with custom pricing
    const stickerItem = stickerPricing?.stickerItems?.find(
      (si: any) => si.variantId === item.variant_id
    )

    return (
      <div key={item.id} className="cart-item sticker-item">
        <div className="item-info">
          <h3>{item.title} <span className="sticker-badge">Custom Sticker</span></h3>
          <p>Quantity: {item.quantity}</p>
          {stickerItem && (
            <p className="pricing-tier">
              Tier pricing: ${(stickerItem.unitPrice / 100).toFixed(2)} each
            </p>
          )}
        </div>
        <div className="item-price">
          {stickerItem ? (
            <>
              <span className="original-price line-through text-gray-500">
                ${(item.unit_price / 100).toFixed(2)}
              </span>
              <span className="discounted-price">
                ${(stickerItem.unitPrice / 100).toFixed(2)} each
              </span>
            </>
          ) : (
            `${(item.unit_price / 100).toFixed(2)} each`
          )}
        </div>
        <div className="item-total">
          ${stickerItem ? (stickerItem.totalPrice / 100).toFixed(2) : (item.total / 100).toFixed(2)}
        </div>
      </div>
    )
  }

  return (
    <div className="cart-items">
      {cartItems.map(renderCartItem)}
      
      {stickerPricing && stickerPricing.totalSavings > 0 && (
        <div className="sticker-savings-summary">
          <div className="savings-badge">
            Total Sticker Savings: ${(stickerPricing.totalSavings / 100).toFixed(2)}
          </div>
        </div>
      )}
      
      {loading && (
        <div className="loading-overlay">
          Updating sticker pricing...
        </div>
      )}
    </div>
  )
}
```

---

## Phase 4: Testing & Quality Assurance

### Step 4.1: Backend API Testing

Create test file: `tests/sticker-pricing.test.ts`

```typescript
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals'
import { StickerPricingCalculator } from '../src/modules/sticker-pricing/pricing-calculator'

describe('Sticker Pricing Calculator', () => {
  let calculator: StickerPricingCalculator

  beforeAll(() => {
    calculator = new StickerPricingCalculator()
  })

  it('should calculate correct pricing for single sticker', () => {
    const result = calculator.calculatePricing(1, 'var_sticker_custom')
    expect(result.unitPrice).toBe(100) // $1.00 in cents
    expect(result.totalPrice).toBe(100)
    expect(result.savings).toBe(0)
  })

  it('should apply bulk discount for 10 stickers', () => {
    const result = calculator.calculatePricing(10, 'var_sticker_custom')
    expect(result.unitPrice).toBe(90) // $0.90 in cents
    expect(result.totalPrice).toBe(900)
    expect(result.savings).toBe(100) // $1.00 savings
  })

  it('should apply maximum discount for 200+ stickers', () => {
    const result = calculator.calculatePricing(250, 'var_sticker_custom')
    expect(result.unitPrice).toBe(50) // $0.50 in cents
    expect(result.totalPrice).toBe(12500)
    expect(result.savings).toBe(12500) // $125.00 savings
  })

  it('should throw error for invalid quantity', () => {
    expect(() => calculator.calculatePricing(0, 'var_sticker_custom')).toThrow()
    expect(() => calculator.calculatePricing(-1, 'var_sticker_custom')).toThrow()
  })

  it('should handle mixed cart with stickers and normal products', () => {
    const cartItems = [
      { variantId: 'var_sticker_custom', quantity: 15 },
      { variantId: 'var_normal_product', quantity: 2 }
    ]
    
    const result = calculator.calculateCartPricing(cartItems)
    expect(result.stickerItems).toHaveLength(1)
    expect(result.stickerItems[0].totalPrice).toBe(1350) // 15 * $0.90
  })
})
```

### Step 4.2: Integration Testing Commands

```bash
# Test cart flow
curl -X POST http://localhost:9000/store/carts \
  -H "Content-Type: application/json" \
  -d '{}'

# Add sticker item to cart
curl -X POST http://localhost:9000/store/carts/{cart_id}/items \
  -H "Content-Type: application/json" \
  -d '{
    "variant_id": "var_sticker_custom",
    "quantity": 15
  }'

# Update sticker pricing in cart
curl -X POST http://localhost:9000/store/carts/{cart_id}/stickers/update-pricing \
  -H "Content-Type: application/json" \
  -d '{
    "cartItems": [
      {
        "variantId": "var_sticker_custom",
        "quantity": 15
      }
    ]
  }'

# Complete checkout flow
curl -X POST http://localhost:9000/store/carts/{cart_id}/complete \
  -H "Content-Type: application/json"
```

---

## Phase 5: Deployment & Production Considerations

### Step 5.1: Environment Configuration

**Production Environment Variables:**

```bash
# .env.production
NODE_ENV=production
DATABASE_URL=your_production_database_url
STICKER_VARIANT_ID=var_sticker_custom

# Cors settings
STORE_CORS=https://your-storefront.com
ADMIN_CORS=https://your-admin.com
AUTH_CORS=https://your-storefront.com,https://your-admin.com

# Security
JWT_SECRET=your_secure_jwt_secret
COOKIE_SECRET=your_secure_cookie_secret
```

### Step 5.2: Performance Optimizations

1. **Database Indexes:**
```sql
CREATE INDEX idx_sticker_config_variant_id ON sticker_config(variant_id);
CREATE INDEX idx_sticker_pricing_tier_config_id ON sticker_pricing_tier(config_id);
```

2. **Caching Strategy:**
- Cache pricing tiers for frequently accessed variants
- Use Redis for session-based cart pricing cache
- Implement CDN caching for static pricing tier responses

3. **Rate Limiting:**
- Implement rate limiting on pricing calculation endpoints
- Add request validation and sanitization

### Step 5.3: Monitoring & Analytics

1. **Logging:**
- Log all pricing calculations for audit trail
- Monitor pricing endpoint performance
- Track cart abandonment rates with sticker products

2. **Metrics to Track:**
- Average sticker quantity per order
- Revenue impact of bulk pricing
- Conversion rates by pricing tier
- Cart modification patterns

---

## Development Guidelines for Cursor AI

### Code Quality Standards

1. **TypeScript Strict Mode:**
   - All files must use strict TypeScript
   - No `any` types unless absolutely necessary
   - Proper interface definitions for all data structures

2. **Error Handling:**
   - Comprehensive try-catch blocks
   - Meaningful error messages
   - Graceful fallbacks for pricing calculations

3. **Testing Requirements:**
   - Unit tests for pricing calculator
   - Integration tests for API endpoints
   - E2E tests for cart flow

4. **Documentation:**
   - JSDoc comments for all public methods
   - README updates for new features
   - API documentation for custom endpoints

### File Organization Rules

```
src/
├── modules/
│   └── sticker-pricing/
│       ├── models/
│       ├── pricing-calculator.ts  # Core logic file
│       ├── service.ts
│       └── index.ts
├── workflows/
│   └── sticker-pricing/
│       └── calculate-sticker-pricing.ts
├── api/
│   └── store/
│       ├── stickers/
│       └── carts/
└── tests/
    └── sticker-pricing.test.ts
```

### Implementation Priority

1. **Phase 1 (Critical):** Backend pricing calculator and API routes
2. **Phase 2 (High):** Frontend product page integration
3. **Phase 3 (Medium):** Cart integration and checkout flow
4. **Phase 4 (Low):** Admin interface and analytics

### Security Considerations

1. **Input Validation:**
   - Validate all quantity inputs (positive integers)
   - Sanitize variant IDs
   - Rate limit pricing calculation requests

2. **Price Manipulation Prevention:**
   - Server-side price validation
   - Audit logging for price changes
   - Secure cart state management

This implementation plan provides a complete, production-ready solution for custom sticker pricing in Medusa.js with progressive quantity discounts, mixed cart support, and comprehensive testing strategy. 