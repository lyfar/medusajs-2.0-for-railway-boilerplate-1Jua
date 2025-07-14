import {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { STICKER_PRICING_MODULE } from "../../../../modules/sticker-pricing"
import StickerPricingService from "../../../../modules/sticker-pricing/service"

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