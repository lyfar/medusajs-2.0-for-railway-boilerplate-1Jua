import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { addStickerToCartWorkflow } from "../../../../../workflows/add-sticker-to-cart"

type AddStickerToCartRequest = {
  variant_id: string
  quantity: number
  metadata?: Record<string, unknown>
}

export async function POST(
  req: MedusaRequest<AddStickerToCartRequest>,
  res: MedusaResponse
) {
  try {
    const { variant_id, quantity, metadata } = req.body
    const { id: cart_id } = req.params

    if (!variant_id || !quantity) {
      return res.status(400).json({
        error: "Missing required fields: variant_id and quantity"
      })
    }

    if (typeof quantity !== 'number' || quantity <= 0) {
      return res.status(400).json({
        error: "Quantity must be a positive number"
      })
    }

    const { result } = await addStickerToCartWorkflow(req.scope).run({
      input: {
        cart_id,
        item: {
          variant_id,
          quantity,
          metadata: {
            ...metadata,
            is_sticker: true,
            sticker_quantity: quantity
          }
        }
      }
    })

    return res.json({
      cart: result,
      success: true
    })
  } catch (error) {
    console.error("Error adding sticker to cart:", error)
    return res.status(500).json({
      error: error.message || "Failed to add sticker to cart"
    })
  }
} 