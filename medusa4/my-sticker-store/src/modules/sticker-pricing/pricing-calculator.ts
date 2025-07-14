import { STICKER_MOQ, validateStickerQuantity } from "./validation"

export interface PricingTier {
  minQuantity: number;
  maxQuantity: number | null;
  pricePerUnit: number; // in euros
}

export interface StickerPricingConfig {
  variantId: string;
  basePrice: number; // in euros
  pricingTiers: PricingTier[];
  isActive: boolean;
}

export type StickerShape = 'rectangle' | 'square' | 'circle' | 'diecut';

export interface ShapePricingParams {
  F_S: number;  // Fixed setup cost
  k_S: number;  // Variable cost multiplier based on area
  delta: number; // Scaling exponent for quantity discounts
}

export interface StickerDimensions {
  width?: number;
  height?: number;
  diameter?: number;
}

export class StickerPricingCalculator {
  private readonly DEFAULT_STICKER_VARIANT_ID = process.env.STICKER_VARIANT_ID || "variant_01JVXFAJY3W3JSBH3HJPEHYRYZ";
  
  // Shape-based pricing parameters
  private readonly SHAPE_PRICING_PARAMS: Record<StickerShape, ShapePricingParams> = {
    rectangle: { F_S: 100, k_S: 0.5, delta: 0.8 },
    square: { F_S: 100, k_S: 0.5, delta: 0.8 },
    circle: { F_S: 120, k_S: 0.6, delta: 0.8 },
    diecut: { F_S: 150, k_S: 0.7, delta: 0.8 }
  };

  // Default dimensions for each shape (in cm)
  private readonly DEFAULT_DIMENSIONS: Record<StickerShape, StickerDimensions> = {
    rectangle: { width: 10, height: 6 },
    square: { width: 8, height: 8 },
    circle: { diameter: 10 },
    diecut: { width: 10, height: 6 }
  };

  // Legacy pricing tiers (kept for backward compatibility)
  private readonly DEFAULT_PRICING_TIERS: PricingTier[] = [
    { minQuantity: 500, maxQuantity: 999, pricePerUnit: 0.50 },    // €0.50 each
    { minQuantity: 1000, maxQuantity: 1999, pricePerUnit: 0.45 },  // €0.45 each
    { minQuantity: 2000, maxQuantity: 4999, pricePerUnit: 0.40 },  // €0.40 each
    { minQuantity: 5000, maxQuantity: 9999, pricePerUnit: 0.35 },  // €0.35 each
    { minQuantity: 10000, maxQuantity: 19999, pricePerUnit: 0.30 }, // €0.30 each
    { minQuantity: 20000, maxQuantity: null, pricePerUnit: 0.25 }   // €0.25 each (unlimited)
  ];

  /**
   * Calculate area for a given shape and dimensions
   */
  private calculateArea(shape: StickerShape, dimensions: StickerDimensions): number {
    switch (shape) {
      case 'circle':
        const radius = (dimensions.diameter || this.DEFAULT_DIMENSIONS.circle.diameter!) / 2;
        return Math.PI * Math.pow(radius, 2);
      case 'rectangle':
      case 'square':
      case 'diecut':
        const width = dimensions.width || this.DEFAULT_DIMENSIONS[shape].width!;
        const height = dimensions.height || this.DEFAULT_DIMENSIONS[shape].height!;
        return width * height;
      default:
        throw new Error(`Unsupported shape: ${shape}`);
    }
  }

  /**
   * Calculate shape-based pricing for stickers
   */
  calculateShapePricing(
    quantity: number,
    shape: StickerShape = 'rectangle',
    dimensions?: StickerDimensions,
    variantId?: string
  ): {
    unitPrice: number;
    totalPrice: number;
    appliedParams: ShapePricingParams;
    basePrice: number;
    scalingFactor: number;
    area: number;
    shape: StickerShape;
    dimensions: StickerDimensions;
  } {
    // Use shared validation logic
    const validation = validateStickerQuantity(quantity);
    if (!validation.isValid) {
      throw new Error(validation.error || "Invalid quantity");
    }

    // Check if this is a sticker variant
    if (variantId && !this.isStickerVariant(variantId)) {
      throw new Error("This calculator only handles sticker variants");
    }

    // Use provided dimensions or defaults
    const finalDimensions = dimensions || this.DEFAULT_DIMENSIONS[shape];
    const area = this.calculateArea(shape, finalDimensions);
    const params = this.SHAPE_PRICING_PARAMS[shape];

    // Calculate base price: F_S + k_S * area
    const basePrice = params.F_S + (params.k_S * area);

    // Calculate scaling factor: (quantity / 500) ^ delta
    const scalingFactor = Math.pow(quantity / STICKER_MOQ, params.delta);

    // Calculate final prices
    const totalPrice = Math.round((basePrice * scalingFactor) * 100) / 100;
    // Keep unit price precise to avoid rounding inconsistencies with total price
    const unitPrice = totalPrice / quantity;

    return {
      unitPrice,
      totalPrice,
      appliedParams: params,
      basePrice,
      scalingFactor,
      area,
      shape,
      dimensions: finalDimensions
    };
  }

  /**
   * Calculate the total price for a given quantity of stickers (legacy method)
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
    // Use shared validation logic
    const validation = validateStickerQuantity(quantity);
    if (!validation.isValid) {
      throw new Error(validation.error || "Invalid quantity");
    }

    // Check if this is a sticker variant
    if (variantId && !this.isStickerVariant(variantId)) {
      throw new Error("This calculator only handles sticker variants");
    }

    const appliedTier = this.findApplicableTier(quantity);
    const unitPrice = appliedTier.pricePerUnit;
    const totalPrice = Math.round((unitPrice * quantity) * 100) / 100;
    const originalPrice = Math.round((this.DEFAULT_PRICING_TIERS[0].pricePerUnit * quantity) * 100) / 100;
    const savings = Math.round((originalPrice - totalPrice) * 100) / 100;

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
   * Get the minimum order quantity
   */
  getMOQ(): number {
    return STICKER_MOQ;
  }

  /**
   * Validate quantity against MOQ
   */
  validateQuantity(quantity: number): { isValid: boolean; error?: string } {
    return validateStickerQuantity(quantity);
  }

  /**
   * Get all pricing tiers (legacy)
   */
  getPricingTiers(): PricingTier[] {
    return [...this.DEFAULT_PRICING_TIERS];
  }

  /**
   * Get shape pricing parameters
   */
  getShapePricingParams(shape: StickerShape): ShapePricingParams {
    return { ...this.SHAPE_PRICING_PARAMS[shape] };
  }

  /**
   * Get all available shapes with their pricing parameters
   */
  getAllShapePricingParams(): Record<StickerShape, ShapePricingParams> {
    return { ...this.SHAPE_PRICING_PARAMS };
  }

  /**
   * Get default dimensions for a shape
   */
  getDefaultDimensions(shape: StickerShape): StickerDimensions {
    return { ...this.DEFAULT_DIMENSIONS[shape] };
  }

  /**
   * Find the applicable pricing tier for a given quantity (legacy)
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

    const totalStickerPrice = Math.round(stickerItems.reduce((sum, item) => sum + item.totalPrice, 0) * 100) / 100;
    const totalOriginalPrice = stickerItems.reduce((sum, item) => 
      sum + (item.quantity * this.DEFAULT_PRICING_TIERS[0].pricePerUnit), 0
    );
    const totalSavings = Math.round((totalOriginalPrice - totalStickerPrice) * 100) / 100;

    return {
      stickerItems,
      totalStickerPrice,
      totalSavings
    };
  }
} 