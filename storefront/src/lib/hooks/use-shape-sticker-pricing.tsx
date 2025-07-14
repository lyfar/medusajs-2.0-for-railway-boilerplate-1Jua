import { useState, useCallback } from 'react';
import { Shape } from '@modules/products/components/calculator/shape-selector';

interface Dimensions {
  width?: number
  height?: number
  diameter?: number
}

interface PricingResult {
  unitPrice: number
  totalPrice: number
  appliedParams: {
    F_S: number
    k_S: number
    delta: number
  }
  basePrice: number
  scalingFactor: number
  area: number
  shape: Shape
  dimensions: Dimensions
}

interface UseShapeStickerPricingReturn {
  calculatePricing: (quantity: number, shape: Shape, dimensions?: Dimensions, variantId?: string) => Promise<PricingResult | null>
  isLoading: boolean
  error: string | null
  lastPricing: PricingResult | null
}

export function useShapeStickerPricing(): UseShapeStickerPricingReturn {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastPricing, setLastPricing] = useState<PricingResult | null>(null)

  const calculatePricing = useCallback(async (
    quantity: number,
    shape: Shape,
    dimensions?: Dimensions,
    variantId?: string
  ): Promise<PricingResult | null> => {
    setIsLoading(true)
    setError(null)

    try {
      const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000';
      const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY;

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (publishableKey) {
        headers['x-publishable-api-key'] = publishableKey;
      }

      const response = await fetch(`${backendUrl}/store/stickers/calculate-shape-pricing`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          quantity,
          shape,
          dimensions,
          variantId
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to calculate pricing')
      }

      const data = await response.json()
      setLastPricing(data.pricing)
      return data.pricing
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    calculatePricing,
    isLoading,
    error,
    lastPricing
  }
} 