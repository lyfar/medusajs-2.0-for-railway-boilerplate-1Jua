import { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { addToCartWorkflow } from "@medusajs/medusa/core-flows"
import StickerPricingService from "../../../../../modules/sticker-pricing/service"
import { STICKER_PRICING_MODULE } from "../../../../../modules/sticker-pricing"

export const POST = async (
  req: MedusaRequest<{
    variant_id: string
    quantity: number
    metadata?: Record<string, unknown>
  }>, 
  res: MedusaResponse
) => {
  // This endpoint is deprecated - redirect to new dynamic pricing endpoint
  console.log('⚠️ OLD ENDPOINT CALLED: /sticker-items - redirecting to dynamic pricing')
  
  return res.status(410).json({
    error: "ENDPOINT_DEPRECATED",
    message: "This endpoint is deprecated. Use /stickers/add-dynamic-pricing instead for shape-based pricing.",
    deprecated_endpoint: "/sticker-items",
    correct_endpoint: "/stickers/add-dynamic-pricing"
  })
} 