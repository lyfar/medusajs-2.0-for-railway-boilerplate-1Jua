import { createWorkflow, transform, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { useQueryGraphStep } from "@medusajs/medusa/core-flows"
import { addToCartWorkflow } from "@medusajs/medusa/core-flows"

type AddStickerToCartWorkflowInput = {
  cart_id: string
  item: {
    variant_id: string
    quantity: number
    metadata?: {
      pricing?: {
        totalPrice: number
      }
      [key: string]: unknown
    }
  }
}

export const addStickerToCartWorkflow = createWorkflow(
  "add-sticker-to-cart",
  ({ cart_id, item }: AddStickerToCartWorkflowInput) => {
    // This step is required for the addToCartWorkflow to have the necessary context.
    const { data: carts } = useQueryGraphStep({
      entity: "cart",
      filters: { id: cart_id },
      fields: ["id"],
    })

    // Prepare line item with custom price from metadata
    const itemsToAdd = transform({ item }, (data) => {
      const { quantity, metadata } = data.item
      const totalPrice = metadata?.pricing?.totalPrice

      if (typeof totalPrice !== "number" || quantity <= 0) {
        // If no price is passed, or quantity is invalid,
        // let the core workflow handle default pricing.
        return [data.item]
      }

      // Calculate unit price from the total
      const unitPrice = totalPrice / quantity

      return [
        {
          ...data.item,
          unit_price: unitPrice,
          metadata: {
            ...data.item.metadata,
            has_custom_price: true, // Tell Medusa to use our price
          },
        },
      ]
    })

    // Add to cart with custom pricing
    const cartResult = addToCartWorkflow.runAsStep({
      input: {
        items: itemsToAdd,
        cart_id: cart_id,
      },
    })

    return new WorkflowResponse(cartResult)
  }
) 