"use server"

import { sdk } from "@lib/config"
import { getAuthHeaders, getCacheOptions } from "./cookies"

export type StickerShape = 'rectangle' | 'square' | 'circle' | 'diecut'

export interface StickerDimensions {
  width?: number
  height?: number
  diameter?: number
}

export interface ShapePricingParams {
  F_S: number  // Fixed setup cost
  k_S: number  // Variable cost multiplier based on area
  delta: number // Scaling exponent for quantity discounts
}

export interface StickerShapePricingResult {
  unitPrice: number
  totalPrice: number
  appliedParams: ShapePricingParams
  basePrice: number
  scalingFactor: number
  area: number
  shape: StickerShape
  dimensions: StickerDimensions
}

export interface StickerPricingResult {
  unitPrice: number
  totalPrice: number
  appliedTier: {
    minQuantity: number
    maxQuantity: number | null
    pricePerUnit: number
  }
  savings: number
  originalPrice: number
}

export interface StickerPricingTier {
  minQuantity: number
  maxQuantity: number | null
  pricePerUnit: number
}

export interface CartStickerPricing {
  stickerItems: Array<{
    variantId: string
    quantity: number
    unitPrice: number
    totalPrice: number
    appliedTier: StickerPricingTier
  }>
  totalStickerPrice: number
  totalSavings: number
}

export interface StickerShapeInfo {
  shape: StickerShape
  pricingParams: ShapePricingParams
  defaultDimensions: StickerDimensions
}

/**
 * Get headers with both auth and publishable key
 */
const getStickerHeaders = async (): Promise<Record<string, string>> => {
  const authHeaders = await getAuthHeaders()
  const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
  
  return {
    ...authHeaders,
    ...(publishableKey && { "x-publishable-api-key": publishableKey }),
  }
}

/**
 * Calculate shape-based pricing for stickers
 */
export const calculateStickerShapePricing = async ({
  variantId,
  quantity,
  shape,
  dimensions,
}: {
  variantId?: string
  quantity: number
  shape: StickerShape
  dimensions?: StickerDimensions
}): Promise<StickerShapePricingResult | null> => {
  try {
    const headers = {
      ...(await getStickerHeaders()),
      "Content-Type": "application/json",
    }

    const requestBody = {
      variantId,
      quantity,
      shape,
      dimensions,
    }

    const response = await sdk.client.fetch<{ pricing: StickerShapePricingResult }>(
      `/store/stickers/calculate-shape-pricing`,
      {
        method: "POST",
        headers,
        body: requestBody,
        cache: "no-store", // Always get fresh pricing
      }
    )

    return response.pricing
  } catch (error) {
    console.error("Failed to calculate sticker shape pricing:", error)
    return null
  }
}

/**
 * Get available sticker shapes with their pricing parameters
 */
export const getStickerShapeInfo = async (): Promise<{
  shapes: StickerShapeInfo[]
  moq: number
} | null> => {
  try {
    const headers = {
      ...(await getStickerHeaders()),
    }
    
    const response = await sdk.client.fetch<{
      shapes: StickerShapeInfo[]
      moq: number
    }>(
      `/store/stickers/calculate-shape-pricing`,
      {
        method: "GET",
        headers,
        ...(await getCacheOptions("sticker-shapes")),
      }
    )

    return response
  } catch (error) {
    console.error("Failed to get sticker shape info:", error)
    return null
  }
}

/**
 * Calculate pricing for a specific quantity of stickers (legacy)
 */
export const calculateStickerPricing = async ({
  variantId,
  quantity,
}: {
  variantId: string
  quantity: number
}): Promise<StickerPricingResult | null> => {
  try {
    const headers = {
      ...(await getStickerHeaders()),
      "Content-Type": "application/json",
    }

    const requestBody = {
      variantId,
      quantity,
    }

    const response = await sdk.client.fetch<{ pricing: StickerPricingResult }>(
      `/store/stickers/calculate-pricing`,
      {
        method: "POST",
        headers,
        body: requestBody,
        cache: "no-store", // Always get fresh pricing
      }
    )

    return response.pricing
  } catch (error) {
    console.error("Failed to calculate sticker pricing:", error)
    return null
  }
}

/**
 * Get all available pricing tiers (legacy)
 */
export const getStickerPricingTiers = async (
  variantId?: string
): Promise<StickerPricingTier[]> => {
  try {
    const headers = {
      ...(await getStickerHeaders()),
    }

    const query = variantId ? `?variantId=${variantId}` : ""
    
    const response = await sdk.client.fetch<{ pricingTiers: StickerPricingTier[] }>(
      `/store/stickers/pricing-tiers${query}`,
      {
        method: "GET",
        headers,
        ...(await getCacheOptions("sticker-tiers")),
      }
    )

    return response.pricingTiers
  } catch (error) {
    console.error("Failed to get sticker pricing tiers:", error)
    return []
  }
}

/**
 * Calculate pricing for cart items containing stickers
 */
export const calculateCartStickerPricing = async ({
  cartId,
  cartItems,
}: {
  cartId: string
  cartItems: Array<{ variantId: string; quantity: number }>
}): Promise<CartStickerPricing | null> => {
  try {
    const headers = {
      ...(await getStickerHeaders()),
      "Content-Type": "application/json",
    }

    const response = await sdk.client.fetch<{
      cartId: string
      stickerPricing: CartStickerPricing
    }>(`/store/carts/${cartId}/stickers/update-pricing`, {
      method: "POST",
      headers,
      body: {
        cartItems,
      }, // Let Medusa SDK handle JSON.stringify
      cache: "no-store", // Always get fresh cart pricing
    })

    return response.stickerPricing
  } catch (error) {
    console.error("Failed to calculate cart sticker pricing:", error)
    return null
  }
} 