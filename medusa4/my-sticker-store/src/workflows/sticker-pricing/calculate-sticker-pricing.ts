import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { STICKER_PRICING_MODULE } from "../../modules/sticker-pricing"
import StickerPricingService from "../../modules/sticker-pricing/service"

export type CalculateStickerPricingStepInput = {
  variantId: string
  quantity: number
}

export const calculateStickerPricingStep = createStep(
  "calculate-sticker-pricing-step",
  async (input: CalculateStickerPricingStepInput, { container }) => {
    const stickerPricingService: StickerPricingService = container.resolve(
      STICKER_PRICING_MODULE
    )

    const result = await stickerPricingService.calculatePricing(
      input.variantId, 
      input.quantity
    )

    return new StepResponse(result)
  }
)

export type CalculateCartStickerPricingStepInput = {
  cartItems: Array<{variantId: string, quantity: number}>
}

export const calculateCartStickerPricingStep = createStep(
  "calculate-cart-sticker-pricing-step",
  async (input: CalculateCartStickerPricingStepInput, { container }) => {
    const stickerPricingService: StickerPricingService = container.resolve(
      STICKER_PRICING_MODULE
    )

    const result = await stickerPricingService.calculateCartPricing(input.cartItems)

    return new StepResponse(result)
  }
)

export const calculateStickerPricingWorkflow = createWorkflow(
  "calculate-sticker-pricing",
  (input: CalculateStickerPricingStepInput) => {
    const pricing = calculateStickerPricingStep(input)
    return new WorkflowResponse(pricing)
  }
)

export const calculateCartStickerPricingWorkflow = createWorkflow(
  "calculate-cart-sticker-pricing",
  (input: CalculateCartStickerPricingStepInput) => {
    const cartPricing = calculateCartStickerPricingStep(input)
    return new WorkflowResponse(cartPricing)
  }
) 