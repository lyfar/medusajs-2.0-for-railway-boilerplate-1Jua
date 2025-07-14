import {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { calculateStickerPricingWorkflow } from "../../../../workflows/sticker-pricing/calculate-sticker-pricing"
import { validateStickerQuantity } from "../../../../modules/sticker-pricing/validation"

type PostCalculatePricingRequest = {
  variantId: string
  quantity: number
}

export const POST = async (
  req: MedusaRequest<PostCalculatePricingRequest>,
  res: MedusaResponse
) => {
  const { variantId, quantity } = req.validatedBody

  // Validate quantity against MOQ and other business rules
  const validation = validateStickerQuantity(quantity)
  if (!validation.isValid) {
    return res.status(400).json({
      error: "INVALID_QUANTITY",
      message: validation.error
    })
  }

  try {
    const { result } = await calculateStickerPricingWorkflow(req.scope)
      .run({
        input: { variantId, quantity }
      })

    res.json({
      pricing: result
    })
  } catch (error) {
    // Handle pricing calculator errors
    if (error instanceof Error && error.message.includes("Minimum order quantity")) {
      return res.status(400).json({
        error: "MOQ_NOT_MET",
        message: error.message
      })
    }

    // Re-throw other errors to be handled by Medusa's error handler
    throw error
  }
} 