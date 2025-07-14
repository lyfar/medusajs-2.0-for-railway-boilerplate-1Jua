import { sdk } from "@lib/config"
// Remove the server-only cookies import
// import { getAuthHeaders } from "./cookies"

// Types for sticker pricing
export interface PricingTier {
  minQuantity: number;
  maxQuantity: number | null;
  pricePerUnit: number; // in euros
}

export interface StickerPricingResult {
  unitPrice: number;
  totalPrice: number;
  appliedTier: PricingTier;
  savings: number;
  originalPrice: number;
}

export interface StickerCartPricingResult {
  stickerItems: Array<{
    variantId: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    appliedTier: PricingTier;
  }>;
  totalStickerPrice: number;
  totalSavings: number;
}

// Remove the server-only header function
const getStickerHeaders = () => {
  return {
    "Content-Type": "application/json",
  }
}

/**
 * Calculate pricing for a specific quantity of stickers
 */
export const calculateStickerPricing = async ({
  variantId,
  quantity,
}: {
  variantId: string
  quantity: number
}): Promise<StickerPricingResult | null> => {
  try {
    const headers = getStickerHeaders()

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
 * Get pricing tiers for stickers
 */
export const getStickerPricingTiers = async (variantId?: string): Promise<PricingTier[]> => {
  try {
    const headers = getStickerHeaders()
    
    const url = variantId 
      ? `/store/stickers/pricing-tiers?variantId=${variantId}`
      : `/store/stickers/pricing-tiers`

    const response = await sdk.client.fetch<{ pricing_tiers: PricingTier[] }>(
      url,
      {
        method: "GET", 
        headers,
        cache: "no-store",
      }
    )

    return response.pricing_tiers
  } catch (error) {
    console.error("Failed to get pricing tiers:", error)
    return []
  }
}

/**
 * Calculate pricing for multiple cart items
 */
export const calculateCartStickerPricing = async (
  cartItems: Array<{variantId: string, quantity: number}>
): Promise<StickerCartPricingResult | null> => {
  try {
    const headers = getStickerHeaders()

    const response = await sdk.client.fetch<{ cart_pricing: StickerCartPricingResult }>(
      `/store/stickers/calculate-cart-pricing`,
      {
        method: "POST",
        headers,
        body: { cartItems },
        cache: "no-store",
      }
    )

    return response.cart_pricing
  } catch (error) {
    console.error("Failed to calculate cart sticker pricing:", error)
    return null
  }
} 