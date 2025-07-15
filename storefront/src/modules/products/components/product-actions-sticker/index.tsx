"use client"

import { Button } from "@medusajs/ui"
import { useParams } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"

import { useIntersection } from "@lib/hooks/use-in-view"
import { addStickerToCart } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import { Calculator } from "../calculator"
import { Shape } from "../calculator/shape-selector"
import { useShapeStickerPricing } from "@lib/hooks/use-shape-sticker-pricing"

type ProductActionsStickerProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  disabled?: boolean
}

interface Dimensions {
  width?: number
  height?: number
  diameter?: number
}

export default function ProductActionsSticker({
  product,
  region,
  disabled,
}: ProductActionsStickerProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [shape, setShape] = useState<Shape>('rectangle')
  const [dimensions, setDimensions] = useState<Dimensions>({ width: 10, height: 6 })
  const [quantity, setQuantity] = useState(500)
  const [uploadedFileKey, setUploadedFileKey] = useState<string | null>(null)
  const [uploadedPublicUrl, setUploadedPublicUrl] = useState<string | null>(null)
  const countryCode = useParams().countryCode as string

  const { calculatePricing, lastPricing, isLoading: pricingLoading } = useShapeStickerPricing()

  // Get the first variant (for sticker products, we typically have just one)
  const selectedVariant = product.variants?.[0]

  // Calculate pricing when parameters change
  useEffect(() => {
    if (selectedVariant?.id) {
      calculatePricing(quantity, shape, dimensions, selectedVariant.id)
    }
  }, [selectedVariant?.id, quantity, shape, dimensions, calculatePricing])

  // check if the selected variant is in stock
  const inStock = useMemo(() => {
    if (selectedVariant && !selectedVariant.manage_inventory) {
      return true
    }
    if (selectedVariant?.allow_backorder) {
      return true
    }
    if (
      selectedVariant?.manage_inventory &&
      (selectedVariant?.inventory_quantity || 0) > 0
    ) {
      return true
    }
    return false
  }, [selectedVariant])

  const actionsRef = useRef<HTMLDivElement>(null)
  const inView = useIntersection(actionsRef, "0px")

  // Handle calculator state changes
  const handleCalculatorChange = (
    newShape: Shape,
    newDimensions: Dimensions,
    newQuantity: number,
    fileKey: string | null,
    publicUrl: string | null
  ) => {
    setShape(newShape)
    setDimensions(newDimensions)
    setQuantity(newQuantity)
    if (fileKey && publicUrl) {
      setUploadedFileKey(fileKey)
      setUploadedPublicUrl(publicUrl)
    }
  }

  // add the selected variant to the cart
  const handleAddToCart = async () => {
    if (!selectedVariant?.id || !lastPricing) return null

    setIsAdding(true)

    try {
      await addStickerToCart({
        variantId: selectedVariant.id,
        quantity: quantity,
        countryCode,
        metadata: {
          file_key: uploadedFileKey,
          design_url: uploadedPublicUrl,
          shape: shape,
          dimensions: dimensions,
          pricing: {
            unitPrice: lastPricing.unitPrice,
            totalPrice: lastPricing.totalPrice,
            basePrice: lastPricing.basePrice,
            scalingFactor: lastPricing.scalingFactor,
            area: lastPricing.area
          }
        },
      })
    } catch (error) {
      console.error("Error adding to cart:", error)
    }

    setIsAdding(false)
  }

  return (
    <div className="w-full" ref={actionsRef}>
      {/* Product Title - Removed for cleaner interface */}
      <div className="text-center mb-4">
        <p className="text-lg text-neutral-400">{product.description}</p>
      </div>

      {/* Sticker Calculator - Full height minus button */}
      <div className="flex-1 min-h-[calc(100vh-200px)]">
        <Calculator
          onStateChange={handleCalculatorChange}
          disabled={!!disabled || isAdding}
        />
      </div>

      {/* Add to Cart Button */}
      <div className="sticky bottom-0 bg-neutral-950/90 backdrop-blur-lg border-t border-neutral-800 p-6">
        <div className="max-w-[1600px] mx-auto">
          <Button
            onClick={handleAddToCart}
            disabled={
              !inStock ||
              !selectedVariant ||
              !!disabled ||
              isAdding ||
              pricingLoading ||
              !lastPricing ||
              !uploadedFileKey
            }
            variant="primary"
            className="w-full h-14 text-lg font-semibold bg-green-600 hover:bg-green-700 transition-colors"
            isLoading={isAdding}
            data-testid="add-product-button"
          >
            {!selectedVariant
              ? "Select variant"
              : !inStock
              ? "Out of stock"
              : !uploadedFileKey
              ? "Please upload your design"
              : lastPricing
              ? `Add ${quantity.toLocaleString()} sticker${quantity > 1 ? 's' : ''} to cart - $${lastPricing.totalPrice.toFixed(2)}`
              : "Configure your stickers"}
          </Button>
        </div>
      </div>
    </div>
  )
} 