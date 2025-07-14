"use client"

import { clx } from "@medusajs/ui"
import { StickerShapePricingResult } from "@lib/data/stickers"

interface StickerShapePricingDisplayProps {
  pricing: StickerShapePricingResult
  loading?: boolean
  className?: string
}

const formatPrice = (priceInEuros: number): string => {
  return `€${priceInEuros.toFixed(2)}`
}

const formatArea = (area: number): string => {
  return `${area.toFixed(1)} cm²`
}

export default function StickerShapePricingDisplay({
  pricing,
  loading = false,
  className,
}: StickerShapePricingDisplayProps) {
  if (loading) {
    return (
      <div className={clx("animate-pulse", className)}>
        <div className="h-6 bg-gray-200 rounded w-24 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-32 mb-4"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  const unitPriceDisplay = formatPrice(pricing.unitPrice)
  const totalPriceDisplay = formatPrice(pricing.totalPrice)
  const basePriceDisplay = formatPrice(pricing.basePrice)
  const areaDisplay = formatArea(pricing.area)
  
  const isDiscounted = pricing.scalingFactor < 1
  const isPremium = pricing.scalingFactor > 1

  const getShapeDisplayName = (shape: string) => {
    switch (shape) {
      case 'rectangle': return 'Rectangle'
      case 'square': return 'Square'
      case 'circle': return 'Circle'
      case 'diecut': return 'Die Cut'
      default: return shape
    }
  }

  const getDimensionsDisplay = () => {
    if (pricing.shape === 'circle' && pricing.dimensions.diameter) {
      return `Ø${pricing.dimensions.diameter}cm`
    } else if (pricing.dimensions.width && pricing.dimensions.height) {
      return `${pricing.dimensions.width}×${pricing.dimensions.height}cm`
    }
    return ''
  }

  return (
    <div className={clx("sticker-shape-pricing", className)}>
      <div className="flex flex-col text-ui-fg-base">
        {/* Main Price Display */}
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xl-semi text-ui-fg-interactive">
            {unitPriceDisplay} each
          </span>
          {isDiscounted && (
            <span className="text-sm text-green-600 bg-green-50 px-2 py-1 rounded">
              Bulk Discount!
            </span>
          )}
          {isPremium && (
            <span className="text-sm text-orange-600 bg-orange-50 px-2 py-1 rounded">
              Premium Shape
            </span>
          )}
        </div>
        
        <div className="text-2xl-semi font-bold text-ui-fg-base mb-2">
          Total: {totalPriceDisplay}
        </div>

        {/* Shape and Size Info */}
        <div className="flex items-center gap-3 mb-3 text-sm text-ui-fg-subtle">
          <span className="font-medium">{getShapeDisplayName(pricing.shape)}</span>
          <span>•</span>
          <span>{getDimensionsDisplay()}</span>
          <span>•</span>
          <span>{areaDisplay}</span>
        </div>

        {/* Pricing Breakdown */}
        <div className="bg-ui-bg-subtle p-3 rounded-md space-y-2 mb-3">
          <h4 className="font-medium text-sm mb-2 text-ui-fg-base">Price Breakdown:</h4>
          
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-ui-fg-subtle">Setup cost (F_S):</span>
              <span className="font-medium">€{pricing.appliedParams.F_S}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-ui-fg-subtle">
                Material cost ({pricing.appliedParams.k_S}x × {areaDisplay}):
              </span>
              <span className="font-medium">
                €{(pricing.appliedParams.k_S * pricing.area).toFixed(2)}
              </span>
            </div>
            
            <div className="border-t border-ui-border-base pt-1 mt-1">
              <div className="flex justify-between">
                <span className="text-ui-fg-subtle">Base price (500 units):</span>
                <span className="font-medium">{basePriceDisplay}</span>
              </div>
            </div>
            
            <div className="flex justify-between">
              <span className="text-ui-fg-subtle">
                Quantity scaling ({pricing.scalingFactor.toFixed(3)}x):
              </span>
              <span className={clx("font-medium", {
                "text-green-600": isDiscounted,
                "text-orange-600": isPremium,
                "text-ui-fg-base": !isDiscounted && !isPremium
              })}>
                {isDiscounted && "−"}
                {isPremium && "+"}
                €{Math.abs(pricing.totalPrice - pricing.basePrice).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Formula Display */}
        <div className="text-xs text-ui-fg-subtle bg-ui-bg-base p-2 rounded border">
          <div className="font-medium mb-1">Formula:</div>
          <div className="font-mono">
            (€{pricing.appliedParams.F_S} + {pricing.appliedParams.k_S} × {pricing.area.toFixed(1)}cm²) × 
            (quantity/500)^{pricing.appliedParams.delta} = {totalPriceDisplay}
          </div>
        </div>

        {/* Scaling Info */}
        <div className="mt-3 text-xs text-ui-fg-subtle">
          {isDiscounted && (
            <div className="text-green-600">
              ✓ You're getting {((1 - pricing.scalingFactor) * 100).toFixed(1)}% bulk discount
            </div>
          )}
          {isPremium && (
            <div className="text-orange-600">
              ⚠ Premium shape adds {((pricing.scalingFactor - 1) * 100).toFixed(1)}% to base cost
            </div>
          )}
          {!isDiscounted && !isPremium && (
            <div>
              Standard pricing for this quantity and shape
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 