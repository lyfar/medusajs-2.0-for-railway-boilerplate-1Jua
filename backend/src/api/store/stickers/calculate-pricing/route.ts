import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { STICKER_PRICING_MODULE } from "../../../../modules/sticker-pricing"
import StickerPricingService from "../../../../modules/sticker-pricing/service"

type CalculatePricingRequest = {
  variantId: string
  quantity: number
}

export async function POST(
  req: MedusaRequest<CalculatePricingRequest>,
  res: MedusaResponse
) {
  try {
    const { variantId, quantity } = req.body

    if (!variantId || !quantity) {
      return res.status(400).json({
        error: "Missing required fields: variantId and quantity"
      })
    }

    if (typeof quantity !== 'number' || quantity <= 0) {
      return res.status(400).json({
        error: "Quantity must be a positive number"
      })
    }

    const stickerPricingService: StickerPricingService = req.scope.resolve(
      STICKER_PRICING_MODULE
    )

    const result = await stickerPricingService.calculatePricing(variantId, quantity)

    return res.json({
      pricing: result
    })
  } catch (error) {
    console.error("Error calculating sticker pricing:", error)
    return res.status(500).json({
      error: error.message || "Failed to calculate sticker pricing"
    })
  }
} 