import { MedusaService } from "@medusajs/framework/utils"
import { StickerConfig, StickerPricingTier } from "./models/sticker-config"
import {
  PricingTier,
  StickerPricingCalculator,
  StickerPricingCalculatorOptions,
  StickerShape,
  ShapePricingParams,
} from "./pricing-calculator"
import type { Context } from "@medusajs/framework/types"

type PricingMetadata = {
  baseUnitPrice?: number
  moq?: number
  pricingTiers?: PricingTier[]
  shapeParams?: Partial<Record<StickerShape, ShapePricingParams>>
}

class StickerPricingService extends MedusaService({
  StickerConfig,
  StickerPricingTier,
}) {
  private readonly defaultCalculator: StickerPricingCalculator
  private variantServiceCache: any | null = null
  private variantServiceResolved = false

  constructor(...args: any[]) {
    // @ts-ignore - MedusaService expects the same arguments
    super(...args)

    const defaultVariantId =
      process.env.STICKER_VARIANT_ID || "variant_01K03CSEQN3W8F1CRXJFW7AZWV"

    this.defaultCalculator = new StickerPricingCalculator({
      stickerVariantIds: defaultVariantId ? [defaultVariantId] : undefined,
    })
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

  async calculatePricing(variantId: string, quantity: number) {
    // First check if this variant has custom configuration
    const config = await this.findStickerConfig(variantId)
    
    if (config) {
      // Use database configuration
      return this.calculateFromConfig(config, quantity)
    }

    const calculator = await this.getCalculatorForVariant(variantId)
    return calculator.calculatePricing(quantity, variantId)
  }

  async calculateCartPricing(cartItems: Array<{variantId: string, quantity: number}>) {
    const stickerItems: Array<{
      variantId: string
      quantity: number
      unitPrice: number
      totalPrice: number
      appliedTier: PricingTier
      originalPrice: number
    }> = []

    for (const item of cartItems) {
      const calculator = await this.getCalculatorForVariant(item.variantId)

      if (!calculator.isStickerVariant(item.variantId)) {
        continue
      }

      const pricing = calculator.calculatePricing(item.quantity, item.variantId)

      stickerItems.push({
        variantId: item.variantId,
        quantity: item.quantity,
        unitPrice: pricing.unitPrice,
        totalPrice: pricing.totalPrice,
        appliedTier: pricing.appliedTier,
        originalPrice: pricing.originalPrice,
      })
    }

    const totalPriceRaw = stickerItems.reduce((sum, item) => sum + item.totalPrice, 0)
    const totalStickerPrice = this.applyPsychologicalPricing(totalPriceRaw)
    const totalOriginalPrice = stickerItems.reduce(
      (sum, item) => sum + item.originalPrice,
      0
    )
    const totalSavings = Math.round((totalOriginalPrice - totalStickerPrice) * 100) / 100

    return {
      stickerItems: stickerItems.map(({ originalPrice, ...rest }) => rest),
      totalStickerPrice,
      totalSavings,
    }
  }

  async getPricingTiers(variantId?: string) {
    if (variantId) {
      const config = await this.findStickerConfig(variantId)
      if (config) {
        return this.listStickerPricingTiers({ configId: config.id })
      }

      const calculator = await this.getCalculatorForVariant(variantId)
      return calculator.getPricingTiers()
    }

    return this.defaultCalculator.getPricingTiers()
  }

  async isStickerVariant(variantId: string): Promise<boolean> {
    try {
      const config = await this.findStickerConfig(variantId)
      return !!config?.isActive
    } catch {
      const calculator = await this.getCalculatorForVariant(variantId)
      return calculator.isStickerVariant(variantId)
    }
  }

  private async findStickerConfig(variantId: string) {
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

    const originalUnitPrice = applicableTier.pricePerUnit
    const totalPrice = this.applyPsychologicalPricing(quantity * originalUnitPrice)
    const unitPrice = totalPrice / quantity // Recalculate unit price from psychological total
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

  private async getCalculatorForVariant(
    variantId: string
  ): Promise<StickerPricingCalculator> {
    const overrides = await this.getPricingOverridesForVariant(variantId)

    if (!overrides) {
      return this.defaultCalculator
    }

    return new StickerPricingCalculator(overrides)
  }

  async calculateShapePricing(
    quantity: number,
    shape: StickerShape,
    dimensions?: { width?: number; height?: number; diameter?: number },
    variantId?: string
  ) {
    const calculator = variantId
      ? await this.getCalculatorForVariant(variantId)
      : this.defaultCalculator

    return calculator.calculateShapePricing(quantity, shape, dimensions, variantId)
  }

  private async getPricingOverridesForVariant(
    variantId: string
  ): Promise<StickerPricingCalculatorOptions | null> {
    if (!variantId) {
      return null
    }

    const variantService = this.getProductVariantService()
    if (!variantService?.retrieve) {
      return null
    }

    try {
      const variant = await variantService.retrieve(variantId, {
        relations: ["product", "product.type"],
      } as { relations?: string[]; context?: Context })

      const metadata = variant?.product?.type?.metadata as Record<string, unknown> | null | undefined

      if (!metadata) {
        return null
      }

      return this.parsePricingMetadata(metadata)
    } catch (error) {
      // If the product module isn't available or variant retrieval fails,
      // fall back to default behaviour.
      return null
    }
  }

  private parsePricingMetadata(metadata: Record<string, unknown>): StickerPricingCalculatorOptions | null {
    const basePriceRaw = metadata["pricing:base_price_cents"]
    const minimumOrderQtyRaw = metadata["pricing:minimum_order_qty"]
    const tierTableRaw = metadata["pricing:tier_table"]
    const shapeParamsRaw = metadata["pricing:shape_params"]

    const overrides: StickerPricingCalculatorOptions = {}

    const parsedBasePrice = this.parseNumber(basePriceRaw)
    if (typeof parsedBasePrice === "number") {
      overrides.baseUnitPrice = parsedBasePrice / 100
    }

    const parsedMOQ = this.parseNumber(minimumOrderQtyRaw)
    if (typeof parsedMOQ === "number" && parsedMOQ > 0) {
      overrides.moq = parsedMOQ
    }

    const parsedTiers = this.parseTierTable(tierTableRaw)
    if (parsedTiers?.length) {
      overrides.pricingTiers = parsedTiers
    }

    const parsedShapeParams = this.parseShapeParams(shapeParamsRaw)
    if (parsedShapeParams) {
      overrides.shapeParams = parsedShapeParams
    }

    return Object.keys(overrides).length ? overrides : null
  }

  private parseNumber(value: unknown): number | undefined {
    if (typeof value === "number" && !Number.isNaN(value)) {
      return value
    }

    if (typeof value === "string" && value.trim()) {
      const parsed = Number(value)
      return Number.isNaN(parsed) ? undefined : parsed
    }

    return undefined
  }

  private parseTierTable(value: unknown): PricingTier[] | undefined {
    if (!value) {
      return undefined
    }

    let parsed: unknown

    if (typeof value === "string") {
      try {
        parsed = JSON.parse(value)
      } catch {
        return undefined
      }
    } else {
      parsed = value
    }

    if (!Array.isArray(parsed)) {
      return undefined
    }

    const tiers: PricingTier[] = []

    for (const entry of parsed) {
      if (
        typeof entry !== "object" ||
        entry === null ||
        typeof (entry as any).min !== "number" ||
        ((entry as any).max !== null && typeof (entry as any).max !== "number") ||
        typeof (entry as any).unit_price !== "number"
      ) {
        continue
      }

      tiers.push({
        minQuantity: (entry as any).min,
        maxQuantity: (entry as any).max ?? null,
        pricePerUnit: (entry as any).unit_price,
      })
    }

    return tiers.length ? tiers : undefined
  }

  private parseShapeParams(value: unknown): Partial<Record<StickerShape, ShapePricingParams>> | undefined {
    if (!value) {
      return undefined
    }

    let parsed: unknown

    if (typeof value === "string") {
      try {
        parsed = JSON.parse(value)
      } catch {
        return undefined
      }
    } else {
      parsed = value
    }

    if (typeof parsed !== "object" || parsed === null) {
      return undefined
    }

    const result: Partial<Record<StickerShape, ShapePricingParams>> = {}
    const shapes: StickerShape[] = ["rectangle", "square", "circle", "diecut"]

    for (const shape of shapes) {
      const params = (parsed as Record<string, any>)[shape]
      if (!params || typeof params !== "object") {
        continue
      }

      const F_S = this.parseNumber(params.F_S)
      const k_S = this.parseNumber(params.k_S)
      const delta = this.parseNumber(params.delta)

      const defaultShape = this.defaultCalculator.getShapePricingParams(shape)

      result[shape] = {
        F_S: F_S ?? defaultShape.F_S,
        k_S: k_S ?? defaultShape.k_S,
        delta: delta ?? defaultShape.delta,
      }
    }

    return Object.keys(result).length ? result : undefined
  }

  private getProductVariantService() {
    if (this.variantServiceResolved) {
      return this.variantServiceCache
    }

    this.variantServiceResolved = true

    try {
      const container = (this as any).__container__
      this.variantServiceCache = container?.productVariantService ?? null
    } catch {
      this.variantServiceCache = null
    }

    return this.variantServiceCache
  }
}

export default StickerPricingService 
