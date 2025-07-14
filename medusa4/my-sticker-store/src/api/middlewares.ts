import { 
  defineMiddlewares,
  validateAndTransformBody,
} from "@medusajs/framework/http"
import { PostCalculatePricingRequest } from "./store/stickers/calculate-pricing/validators"
import { z } from "zod"

const PostUpdateCartPricingRequest = z.object({
  cartItems: z.array(z.object({
    variantId: z.string(),
    quantity: z.union([z.number(), z.string().transform(Number)]).pipe(
      z.number().int().min(1)
    )
  }))
})

const PostAddStickerToPricingRequest = z.object({
  variantId: z.string(),
  quantity: z.union([z.number(), z.string().transform(Number)]).pipe(
    z.number().int().min(1)
  )
})

export default defineMiddlewares({
  routes: [
    {
      matcher: "/store/stickers/calculate-pricing",
      method: "POST",
      middlewares: [
        validateAndTransformBody(PostCalculatePricingRequest),
      ],
    },
    {
      matcher: "/store/carts/:id/stickers/update-pricing",
      method: "POST", 
      middlewares: [
        validateAndTransformBody(PostUpdateCartPricingRequest),
      ],
    },
    {
      matcher: "/store/carts/:id/stickers/add-with-pricing",
      method: "POST",
      middlewares: [
        validateAndTransformBody(PostAddStickerToPricingRequest),
      ],
    },
  ],
}) 