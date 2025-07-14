import {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { calculateCartStickerPricingWorkflow } from "../../../../../../workflows/sticker-pricing/calculate-sticker-pricing"

type PostUpdateCartPricingRequest = {
  cartItems: Array<{variantId: string, quantity: number}>
}

export const POST = async (
  req: MedusaRequest<PostUpdateCartPricingRequest>,
  res: MedusaResponse
) => {
  const { cartItems } = req.validatedBody
  const cartId = req.params.id

  const { result } = await calculateCartStickerPricingWorkflow(req.scope)
    .run({
      input: { cartItems }
    })

  res.json({
    cartId,
    stickerPricing: result
  })
} 