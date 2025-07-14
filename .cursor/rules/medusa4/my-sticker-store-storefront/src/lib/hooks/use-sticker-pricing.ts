"use client"

import { useState, useEffect, useCallback } from "react"
import { 
  calculateStickerPricing, 
  getStickerPricingTiers,
  StickerPricingResult,
  StickerPricingTier,
} from "@lib/data/stickers"
import { isStickerVariant } from "@lib/util/sticker-utils"

interface UseStickerPricingProps {
  variantId?: string
  quantity: number
  enabled?: boolean
}

interface UseStickerPricingReturn {
  pricing: StickerPricingResult | null
  tiers: StickerPricingTier[]
  loading: boolean
  error: string | null
  isSticker: boolean
  refetch: () => void
}

export const useStickerPricing = ({
  variantId,
  quantity,
  enabled = true,
}: UseStickerPricingProps): UseStickerPricingReturn => {
  const [pricing, setPricing] = useState<StickerPricingResult | null>(null)
  const [tiers, setTiers] = useState<StickerPricingTier[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isSticker = variantId ? isStickerVariant(variantId) : false

  const fetchPricing = useCallback(async () => {
    if (!variantId || !enabled || !isSticker || quantity <= 0) {
      setPricing(null)
      return
    }

    setLoading(true)
    setError(null)

    try {
      console.log('Fetching sticker pricing for:', { variantId, quantity })
      const result = await calculateStickerPricing({
        variantId,
        quantity,
      })

      console.log('Sticker pricing result:', result)

      if (result) {
        setPricing(result)
      } else {
        setError("API returned null - check backend server and API key")
      }
    } catch (err) {
      console.error('Sticker pricing error:', err)
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }, [variantId, quantity, enabled, isSticker])

  const fetchTiers = useCallback(async () => {
    if (!enabled || !isSticker) {
      setTiers([])
      return
    }

    try {
      const result = await getStickerPricingTiers(variantId)
      setTiers(result)
    } catch (err) {
      console.error("Failed to fetch pricing tiers:", err)
    }
  }, [variantId, enabled, isSticker])

  useEffect(() => {
    fetchPricing()
  }, [fetchPricing])

  useEffect(() => {
    fetchTiers()
  }, [fetchTiers])

  return {
    pricing,
    tiers,
    loading,
    error,
    isSticker,
    refetch: fetchPricing,
  }
} 