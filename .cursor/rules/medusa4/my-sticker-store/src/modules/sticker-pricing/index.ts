import { Module } from "@medusajs/framework/utils"
import StickerPricingService from "./service"

export const STICKER_PRICING_MODULE = "stickerPricing"

export default Module(STICKER_PRICING_MODULE, {
  service: StickerPricingService,
})

export * from "./pricing-calculator"
export * from "./models/sticker-config" 