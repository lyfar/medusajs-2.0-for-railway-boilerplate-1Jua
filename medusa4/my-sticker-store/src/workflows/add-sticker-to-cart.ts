import { createWorkflow, transform, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { useQueryGraphStep } from "@medusajs/medusa/core-flows"
import { addToCartWorkflow } from "@medusajs/medusa/core-flows"
import { QueryContext } from "@medusajs/framework/utils"
import StickerPricingService from "../modules/sticker-pricing/service"
import { STICKER_PRICING_MODULE } from "../modules/sticker-pricing"

type AddStickerToCartWorkflowInput = {
  cart_id: string
  item: {
    variant_id: string
    quantity: number
    metadata?: Record<string, unknown>
  }
}

export const addStickerToCartWorkflow = createWorkflow(
  "add-sticker-to-cart",
  ({ cart_id, item }: AddStickerToCartWorkflowInput) => {
    // Get cart details
    const { data: carts } = useQueryGraphStep({
      entity: "cart",
      filters: { id: cart_id },
      fields: ["id", "currency_code"],
    })

    // Get variant details
    const { data: variants } = useQueryGraphStep({
      entity: "variant",
      fields: [
        "*",
        "calculated_price.*",
      ],
      filters: {
        id: item.variant_id,
      },
      options: {
        throwIfKeyNotFound: true,
      },
      context: {
        calculated_price: QueryContext({
          currency_code: carts[0].currency_code,
        }),
      },
    }).config({ name: "retrieve-variant" })

    // Calculate custom price
    const customPrice = transform({
      variantId: item.variant_id,
      quantity: item.quantity,
    }, async (data, { container }) => {
      const stickerPricingService: StickerPricingService = container.resolve(STICKER_PRICING_MODULE)
      
      const result = await stickerPricingService.calculatePricing({
        variantId: data.variantId,
        quantity: data.quantity
      })

      // Return price in euros (Medusa's expected format)
      return result.totalPrice
    })

    // Prepare line item with custom price
    const itemToAdd = transform({
      item,
      customPrice,
    }, (data) => {
      return [{
        ...data.item,
        unit_price: data.customPrice, // This is the key - custom unit price
      }]
    })

    // Add to cart with custom pricing
    addToCartWorkflow.runAsStep({
      input: {
        items: itemToAdd,
        cart_id,
      },
    })

    // Return updated cart
    const { data: updatedCarts } = useQueryGraphStep({
      entity: "cart",
      filters: { id: cart_id },
      fields: ["id", "items.*"],
    }).config({ name: "refetch-cart" })

    return new WorkflowResponse({
      cart: updatedCarts[0],
    })
  }
) 