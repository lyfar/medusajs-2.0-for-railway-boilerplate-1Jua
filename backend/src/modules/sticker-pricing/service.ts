import { MedusaService } from "@medusajs/framework/utils"
import { StickerConfig, StickerPricingTier } from "./models/sticker-config"
import { StickerPricingCalculator } from "./pricing-calculator"

class StickerPricingService extends MedusaService({
  StickerConfig,
  StickerPricingTier,
}) {
  private calculator = new StickerPricingCalculator()

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
    
    // Fall back to default calculator
    return this.calculator.calculatePricing(quantity, variantId)
  }

  async calculateCartPricing(cartItems: Array<{variantId: string, quantity: number}>) {
    return this.calculator.calculateCartPricing(cartItems)
  }

  async getPricingTiers(variantId?: string) {
    if (variantId) {
      const config = await this.findStickerConfig(variantId)
      if (config) {
        return this.listStickerPricingTiers({ configId: config.id })
      }
    }
    
    return this.calculator.getPricingTiers()
  }

  async isStickerVariant(variantId: string): Promise<boolean> {
    try {
      const config = await this.findStickerConfig(variantId)
      return !!config?.isActive
    } catch {
      return this.calculator.isStickerVariant(variantId)
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
}

export default StickerPricingService 