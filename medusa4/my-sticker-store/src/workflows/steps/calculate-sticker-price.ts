import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import StickerPricingService from "../../modules/sticker-pricing/service"
import { STICKER_PRICING_MODULE } from "../../modules/sticker-pricing"

export type CalculateStickerPriceStepInput = {
  variantId: string
  quantity: number
}

export const calculateStickerPriceStep = createStep(
  "calculate-sticker-price",
  async ({ variantId, quantity }: CalculateStickerPriceStepInput, { container }) => {
    const stickerPricingService: StickerPricingService = container.resolve(STICKER_PRICING_MODULE)
    
    const result = await stickerPricingService.calculatePricing({
      variantId,
      quantity
    })

    // Return price in euros (Medusa's expected format)
    return new StepResponse(result.totalPrice)
  }
) 