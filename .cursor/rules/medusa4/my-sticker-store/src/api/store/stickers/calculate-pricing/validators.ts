import { z } from "zod"

export const PostCalculatePricingRequest = z.object({
  variantId: z.string().min(1, "Variant ID is required"),
  quantity: z.union([z.number(), z.string().transform(Number)]).pipe(
    z.number().int().min(1, "Quantity must be at least 1")
  ),
}) 