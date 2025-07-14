"use client"

import { useState, useEffect } from "react"
import { 
  StickerShape, 
  StickerDimensions, 
  StickerShapePricingResult, 
  calculateStickerShapePricing 
} from "@lib/data/stickers"
import { validateStickerQuantity, STICKER_MOQ } from "@lib/validations/sticker-quantity"
import StickerShapeSelector from "./shape-selector"
import SizeInput from "./size-input"
import StickerQuantitySelector from "./quantity-selector"
import StickerShapePricingDisplay from "./shape-pricing-display"

interface StickerCalculatorProps {
  variantId?: string
  className?: string
}

// Default dimensions for each shape
const defaultDimensions: Record<StickerShape, StickerDimensions> = {
  rectangle: { width: 10, height: 6 },
  square: { width: 8, height: 8 },
  circle: { diameter: 10 },
  diecut: { width: 10, height: 6 }
}

export default function StickerCalculator({
  variantId,
  className,
}: StickerCalculatorProps) {
  const [shape, setShape] = useState<StickerShape>('rectangle')
  const [dimensions, setDimensions] = useState<StickerDimensions>(defaultDimensions.rectangle)
  const [quantity, setQuantity] = useState<number>(STICKER_MOQ)
  const [pricing, setPricing] = useState<StickerShapePricingResult | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  // Update dimensions when shape changes
  useEffect(() => {
    setDimensions(defaultDimensions[shape])
  }, [shape])

  // Calculate pricing whenever relevant values change
  useEffect(() => {
    const calculatePricing = async () => {
      // Validate quantity first
      const validation = validateStickerQuantity(quantity)
      if (!validation.isValid) {
        setError(validation.error || "Invalid quantity")
        setPricing(null)
        return
      }

      // Check if we have valid dimensions
      if (shape === 'circle' && !dimensions.diameter) {
        setError("Please enter a diameter for the circle")
        return
      }
      
      if (shape !== 'circle' && (!dimensions.width || !dimensions.height)) {
        setError("Please enter both width and height")
        return
      }

      setLoading(true)
      setError(null)

      try {
        const result = await calculateStickerShapePricing({
          variantId,
          quantity,
          shape,
          dimensions,
        })

        if (result) {
          setPricing(result)
        } else {
          setError("Failed to calculate pricing. Please try again.")
        }
      } catch (err) {
        console.error("Pricing calculation error:", err)
        setError("An error occurred while calculating pricing.")
      } finally {
        setLoading(false)
      }
    }

    // Debounce the calculation to avoid too many API calls
    const timeoutId = setTimeout(calculatePricing, 300)
    return () => clearTimeout(timeoutId)
  }, [shape, dimensions, quantity, variantId])

  const handleShapeChange = (newShape: StickerShape) => {
    setShape(newShape)
    setError(null)
  }

  const handleDimensionsChange = (newDimensions: StickerDimensions) => {
    setDimensions(newDimensions)
    setError(null)
  }

  const handleQuantityChange = (newQuantity: number) => {
    setQuantity(newQuantity)
    setError(null)
  }

  return (
    <div className={className}>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Configuration Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Shape Selection */}
          <div>
            <StickerShapeSelector
              selectedShape={shape}
              onShapeChange={handleShapeChange}
              disabled={loading}
            />
          </div>

          {/* Size Input */}
          <div>
            <SizeInput
              shape={shape}
              dimensions={dimensions}
              onDimensionsChange={handleDimensionsChange}
              disabled={loading}
            />
          </div>

          {/* Quantity Selection */}
          <div>
            <StickerQuantitySelector
              quantity={quantity}
              onQuantityChange={handleQuantityChange}
              tiers={[]} // We don't use legacy tiers for shape-based pricing
              disabled={loading}
            />
          </div>
        </div>

        {/* Pricing Display Panel */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <div className="bg-ui-bg-subtle p-6 rounded-lg border border-ui-border-base">
              <h3 className="text-lg font-semibold mb-4 text-ui-fg-base">
                Pricing Estimate
              </h3>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <div className="text-sm text-red-600">
                    ⚠ {error}
                  </div>
                </div>
              )}

              {loading && (
                <div className="mb-4 text-sm text-ui-fg-subtle">
                  Calculating pricing...
                </div>
              )}

              {pricing && !loading && !error && (
                <StickerShapePricingDisplay
                  pricing={pricing}
                  loading={loading}
                />
              )}

              {!pricing && !loading && !error && (
                <div className="text-sm text-ui-fg-subtle">
                  Configure your sticker to see pricing
                </div>
              )}

              {/* Additional Info */}
              <div className="mt-6 pt-4 border-t border-ui-border-base">
                <div className="text-xs text-ui-fg-subtle space-y-1">
                  <div>• Prices include setup and material costs</div>
                  <div>• Bulk discounts apply automatically</div>
                  <div>• All prices in EUR (€)</div>
                  <div>• Minimum order: {STICKER_MOQ.toLocaleString()} pieces</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 