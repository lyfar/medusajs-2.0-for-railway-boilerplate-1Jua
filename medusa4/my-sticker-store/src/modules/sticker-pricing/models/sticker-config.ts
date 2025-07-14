import { model } from "@medusajs/framework/utils"

export const StickerConfig = model.define("sticker_config", {
  id: model.id().primaryKey(),
  variantId: model.text().unique(),
  basePrice: model.number(), // in cents
  isActive: model.boolean().default(true),
  metadata: model.json().nullable(),
  createdAt: model.dateTime(),
  updatedAt: model.dateTime()
})

export const StickerPricingTier = model.define("sticker_pricing_tier", {
  id: model.id().primaryKey(),
  configId: model.text().searchable(),
  minQuantity: model.number(),
  maxQuantity: model.number().nullable(),
  pricePerUnit: model.number(), // in cents
  isActive: model.boolean().default(true),
  createdAt: model.dateTime(),
  updatedAt: model.dateTime()
}) 