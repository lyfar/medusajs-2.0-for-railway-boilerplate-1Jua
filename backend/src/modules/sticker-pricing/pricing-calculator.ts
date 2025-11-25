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
export type StickerMaterial = 
  | 'vinyl' 
  | 'egg_shell'
  | 'hologram_egg_shell'
  | 'transparent_egg_shell'
  | 'gold_silver_foil'
  | 'uv_gloss';

export interface ShapePricingParams {
  F_S: number;  // Fixed setup cost
  k_S: number;  // Variable cost multiplier based on area
  delta: number; // Scaling exponent for quantity discounts
}

export interface MaterialPricingParams {
  factor: number;
}

export interface StickerDimensions {
  width?: number;
  height?: number;
  diameter?: number;
}

export type StickerShapeOverrides = Partial<Record<StickerShape, ShapePricingParams>>;

export interface StickerPricingCalculatorOptions {
  moq?: number;
  pricingTiers?: PricingTier[];
  shapeParams?: StickerShapeOverrides;
  baseUnitPrice?: number;
  stickerVariantIds?: string[];
}

export class StickerPricingCalculator {
  private readonly DEFAULT_STICKER_VARIANT_ID =
    process.env.STICKER_VARIANT_ID || "variant_01K03CSEQN3W8F1CRXJFW7AZWV";

  // Baseline shape parameters
  private readonly BASE_SHAPE_PRICING_PARAMS: Record<StickerShape, ShapePricingParams> = {
    rectangle: { F_S: 100, k_S: 0.5, delta: 0.8 },
    square: { F_S: 100, k_S: 0.5, delta: 0.8 },
    circle: { F_S: 120, k_S: 0.6, delta: 0.8 },
    diecut: { F_S: 150, k_S: 1.9, delta: 0.55 },
  };

  // Baseline material parameters
  private readonly BASE_MATERIAL_PRICING_PARAMS: Record<StickerMaterial, MaterialPricingParams> = {
    vinyl: { factor: 1.0 },
    egg_shell: { factor: 1.0 },
    hologram_egg_shell: { factor: 1.3 },
    transparent_egg_shell: { factor: 1.3 },
    gold_silver_foil: { factor: 1.3 },
    uv_gloss: { factor: 1.3 },
  };

  // Default dimensions for each shape (in cm)
  private readonly DEFAULT_DIMENSIONS: Record<StickerShape, StickerDimensions> = {
    rectangle: { width: 10, height: 6 },
    square: { width: 8, height: 8 },
    circle: { diameter: 10 },
    diecut: { width: 10, height: 6 },
  };

  // Legacy pricing tiers (kept for backward compatibility)
  private readonly DEFAULT_PRICING_TIERS: PricingTier[] = [
    { minQuantity: 500, maxQuantity: 999, pricePerUnit: 0.5 },
    { minQuantity: 1000, maxQuantity: 1999, pricePerUnit: 0.45 },
    { minQuantity: 2000, maxQuantity: 4999, pricePerUnit: 0.4 },
    { minQuantity: 5000, maxQuantity: 9999, pricePerUnit: 0.35 },
    { minQuantity: 10000, maxQuantity: 19999, pricePerUnit: 0.3 },
    { minQuantity: 20000, maxQuantity: null, pricePerUnit: 0.25 },
  ];

  private readonly shapePricingParams: Record<StickerShape, ShapePricingParams>;
  private readonly pricingTiers: PricingTier[];
  private readonly moq: number;
  private readonly baselineUnitPrice: number;
  private readonly stickerVariantIds?: Set<string>;

  constructor(options: StickerPricingCalculatorOptions = {}) {
    this.moq = options.moq ?? STICKER_MOQ;
    this.pricingTiers =
      options.pricingTiers && options.pricingTiers.length
        ? options.pricingTiers.map((tier) => ({
            minQuantity: tier.minQuantity,
            maxQuantity: tier.maxQuantity ?? null,
            pricePerUnit: tier.pricePerUnit,
            // @ts-ignore - handling potential extra fields
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ...tier
          }))
        : [...this.DEFAULT_PRICING_TIERS];

    this.shapePricingParams = (Object.keys(this.BASE_SHAPE_PRICING_PARAMS) as StickerShape[]).reduce(
      (acc, shape) => {
        const baseParams = this.BASE_SHAPE_PRICING_PARAMS[shape];
        const override = options.shapeParams?.[shape];

        acc[shape] = override
          ? {
              F_S: override.F_S ?? baseParams.F_S,
              k_S: override.k_S ?? baseParams.k_S,
              delta: override.delta ?? baseParams.delta,
            }
          : { ...baseParams };

        return acc;
      },
      {} as Record<StickerShape, ShapePricingParams>
    );

    const baseline =
      options.baseUnitPrice ??
      this.pricingTiers[0]?.pricePerUnit ??
      this.DEFAULT_PRICING_TIERS[0].pricePerUnit;

    this.baselineUnitPrice = baseline;

    if (options.stickerVariantIds?.length) {
      this.stickerVariantIds = new Set(options.stickerVariantIds);
    }
  }

  /**
   * Apply psychological pricing: round up to nearest 10, then subtract 1 for psychological effect
   * Examples: 23.45 -> 29, 67.89 -> 69, 156.34 -> 159
   * @param price - Original calculated price
   * @returns Psychological price ending in 9
   */
  private applyPsychologicalPricing(price: number): number {
    // Round up to nearest 10
    const roundedUp = Math.ceil(price / 10) * 10;
    
    // Apply psychological pricing (subtract 1 to end in 9)
    // Special case: if price would be 9 or less, keep it as is to avoid 0 or negative prices
    if (roundedUp <= 10) {
      return Math.max(roundedUp, price); // Don't go below original price for very low amounts
    }
    
    return roundedUp - 1;
  }

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
    variantId?: string,
    material: StickerMaterial = 'vinyl'
  ): {
    unitPrice: number;
    totalPrice: number;
    appliedParams: ShapePricingParams;
    basePrice: number;
    scalingFactor: number;
    area: number;
    shape: StickerShape;
    dimensions: StickerDimensions;
    material: StickerMaterial;
  } {
    // Use shared validation logic
    const validation = validateStickerQuantity(quantity, this.moq);
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
    const params = this.shapePricingParams[shape];
    const materialParams = this.BASE_MATERIAL_PRICING_PARAMS[material] || this.BASE_MATERIAL_PRICING_PARAMS.vinyl;

    // Calculate base price: (F_S + k_S * area) * materialFactor
    const shapeBasePrice = params.F_S + (params.k_S * area);
    const basePrice = shapeBasePrice * materialParams.factor;

    // Calculate scaling factor: (quantity / 500) ^ delta
    const scalingFactor = Math.pow(quantity / this.moq, params.delta);

    // Calculate final prices
    const totalPrice = this.applyPsychologicalPricing(basePrice * scalingFactor);
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
      dimensions: finalDimensions,
      material
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
    const validation = validateStickerQuantity(quantity, this.moq);
    if (!validation.isValid) {
      throw new Error(validation.error || "Invalid quantity");
    }

    // Check if this is a sticker variant
    if (variantId && !this.isStickerVariant(variantId)) {
      throw new Error("This calculator only handles sticker variants");
    }

    const appliedTier = this.findApplicableTier(quantity);
    const unitPrice = appliedTier.pricePerUnit;
    const totalPrice = this.applyPsychologicalPricing(unitPrice * quantity);
    const originalPrice = Math.round((this.baselineUnitPrice * quantity) * 100) / 100;
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
    if (this.stickerVariantIds) {
      return this.stickerVariantIds.has(variantId);
    }

    // Default behaviour falls back to environment variable-based id
    if (this.DEFAULT_STICKER_VARIANT_ID) {
      return variantId === this.DEFAULT_STICKER_VARIANT_ID;
    }

    return true;
  }

  /**
   * Get the minimum order quantity
   */
  getMOQ(): number {
    return this.moq;
  }

  /**
   * Validate quantity against MOQ
   */
  validateQuantity(quantity: number): { isValid: boolean; error?: string } {
    return validateStickerQuantity(quantity, this.moq);
  }

  /**
   * Get all pricing tiers (legacy)
   */
  getPricingTiers(): PricingTier[] {
    return [...this.pricingTiers];
  }

  /**
   * Get shape pricing parameters
   */
  getShapePricingParams(shape: StickerShape): ShapePricingParams {
    return { ...this.shapePricingParams[shape] };
  }

  /**
   * Get all available shapes with their pricing parameters
   */
  getAllShapePricingParams(): Record<StickerShape, ShapePricingParams> {
    return { ...this.shapePricingParams };
  }

  /**
   * Get all available materials with their pricing parameters
   */
  getAllMaterialPricingParams(): Record<StickerMaterial, MaterialPricingParams> {
    return { ...this.BASE_MATERIAL_PRICING_PARAMS };
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
    return this.pricingTiers.find(tier => 
      quantity >= tier.minQuantity && 
      (tier.maxQuantity === null || quantity <= tier.maxQuantity)
    ) || this.pricingTiers[0];
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

    const totalStickerPrice = this.applyPsychologicalPricing(
      stickerItems.reduce((sum, item) => sum + item.totalPrice, 0)
    );
    const totalOriginalPrice = stickerItems.reduce(
      (sum, item) => sum + (item.quantity * this.baselineUnitPrice),
      0
    );
    const totalSavings = Math.round((totalOriginalPrice - totalStickerPrice) * 100) / 100;

    return {
      stickerItems,
      totalStickerPrice,
      totalSavings
    };
  }
}
