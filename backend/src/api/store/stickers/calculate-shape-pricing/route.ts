import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { STICKER_PRICING_MODULE } from "../../../../modules/sticker-pricing"
import StickerPricingService from "../../../../modules/sticker-pricing/service"
import { StickerShape, StickerDimensions } from "../../../../modules/sticker-pricing/pricing-calculator"

type CalculateShapePricingRequest = {
  variantId?: string
  quantity: number
  shape: StickerShape
  dimensions?: StickerDimensions
}

export async function POST(
  req: MedusaRequest<CalculateShapePricingRequest>,
  res: MedusaResponse
) {
  try {
    const { variantId, quantity, shape, dimensions } = req.body

    if (!quantity || !shape) {
      return res.status(400).json({
        error: "Missing required fields: quantity and shape"
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

    // Use the calculator's shape pricing method
    const result = stickerPricingService['calculator'].calculateShapePricing(
      quantity,
      shape,
      dimensions,
      variantId
    )

    return res.json({
      pricing: result
    })
  } catch (error) {
    console.error("Error calculating shape-based sticker pricing:", error)
    return res.status(500).json({
      error: error.message || "Failed to calculate shape-based sticker pricing"
    })
  }
} 