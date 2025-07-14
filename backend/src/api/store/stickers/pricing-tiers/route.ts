import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { STICKER_PRICING_MODULE } from "../../../../modules/sticker-pricing"
import StickerPricingService from "../../../../modules/sticker-pricing/service"

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  try {
    const { variantId } = req.query

    const stickerPricingService: StickerPricingService = req.scope.resolve(
      STICKER_PRICING_MODULE
    )

    const tiers = await stickerPricingService.getPricingTiers(variantId as string)

    return res.json({
      pricing_tiers: tiers
    })
  } catch (error) {
    console.error("Error getting pricing tiers:", error)
    return res.status(500).json({
      error: error.message || "Failed to get pricing tiers"
    })
  }
} 