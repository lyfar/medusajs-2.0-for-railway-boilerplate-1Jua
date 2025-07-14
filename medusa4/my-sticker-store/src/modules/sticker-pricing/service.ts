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