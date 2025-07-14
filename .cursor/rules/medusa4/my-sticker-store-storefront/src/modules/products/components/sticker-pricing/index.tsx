"use client"

import { clx } from "@medusajs/ui"
import { StickerPricingResult } from "@lib/data/stickers"

interface StickerPricingDisplayProps {
  pricing: StickerPricingResult
  loading?: boolean
  className?: string
}

const formatPrice = (priceInEuros: number): string => {
  return `€${priceInEuros.toFixed(2)}`
}

export default function StickerPricingDisplay({
  pricing,
  loading = false,
  className,
}: StickerPricingDisplayProps) {
  if (loading) {
    return (
      <div className={clx("animate-pulse", className)}>
        <div className="h-6 bg-gray-200 rounded w-24 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-32"></div>
      </div>
    )
  }

  const unitPriceDisplay = formatPrice(pricing.unitPrice)
  const totalPriceDisplay = formatPrice(pricing.totalPrice)
  const savingsDisplay = formatPrice(pricing.savings)

  return (
    <div className={clx("sticker-pricing", className)}>
      <div className="flex flex-col text-ui-fg-base">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xl-semi text-ui-fg-interactive">
            {unitPriceDisplay} each
          </span>
          {pricing.savings > 0 && (
            <span className="text-sm text-ui-fg-subtle bg-ui-bg-subtle px-2 py-1 rounded">
              Bulk Discount!
            </span>
          )}
        </div>
        
        <div className="text-2xl-semi font-bold text-ui-fg-base">
          Total: {totalPriceDisplay}
        </div>

        {pricing.savings > 0 && (
          <div className="flex flex-col gap-1 mt-2">
            <div className="text-sm text-ui-fg-subtle">
              <span className="line-through">
                Regular: {formatPrice(pricing.originalPrice)}
              </span>
            </div>
            <div className="text-sm text-green-600 font-medium">
              You save: {savingsDisplay}
            </div>
          </div>
        )}

        <div className="mt-2 text-xs text-ui-fg-subtle">
          Tier: {pricing.appliedTier.minQuantity}
          {pricing.appliedTier.maxQuantity ? `-${pricing.appliedTier.maxQuantity}` : '+'} 
          {' '}stickers at {unitPriceDisplay} each
        </div>
      </div>
    </div>
  )
} 