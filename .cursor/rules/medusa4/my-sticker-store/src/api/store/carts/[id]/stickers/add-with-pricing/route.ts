import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { addToCartWorkflow } from "@medusajs/medusa/core-flows"
import { StickerPricingCalculator, StickerShape, StickerDimensions } from "../../../../../../modules/sticker-pricing/pricing-calculator"

export const POST = async (
  req: MedusaRequest<{
    variantId: string
    quantity: number
  }>,
  res: MedusaResponse
) => {
  // This endpoint is deprecated - redirect to new dynamic pricing endpoint
  console.log('⚠️ OLD ENDPOINT CALLED: /stickers/add-with-pricing - redirecting to dynamic pricing')
  
  return res.status(410).json({
    error: "ENDPOINT_DEPRECATED",
    message: "This endpoint is deprecated. Use /stickers/add-dynamic-pricing instead for shape-based pricing.",
    deprecated_endpoint: "/stickers/add-with-pricing",
    correct_endpoint: "/stickers/add-dynamic-pricing"
  })
} 