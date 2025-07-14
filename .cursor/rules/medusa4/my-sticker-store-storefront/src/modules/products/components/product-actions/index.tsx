"use client"

import { addToCart, addStickerToCart } from "@lib/data/cart"
import { useIntersection } from "@lib/hooks/use-in-view"
import { HttpTypes } from "@medusajs/types"
import { Button } from "@medusajs/ui"
import Divider from "@modules/common/components/divider"
import OptionSelect from "@modules/products/components/product-actions/option-select"
import { isEqual } from "lodash"
import { useParams } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"
import ProductPrice from "../product-price"
import MobileActions from "./mobile-actions"
import { isStickerVariant } from "@lib/util/sticker-utils"
import { 
  StickerShape, 
  StickerDimensions, 
  StickerShapePricingResult, 
  calculateStickerShapePricing 
} from "@lib/data/stickers"
import { validateStickerQuantity, STICKER_MOQ } from "@lib/validations/sticker-quantity"
import StickerShapeSelector from "../sticker-pricing/shape-selector"
import SizeInput from "../sticker-pricing/size-input"
import StickerQuantitySelector from "../sticker-pricing/quantity-selector"
import StickerShapePricingDisplay from "../sticker-pricing/shape-pricing-display"
import DesignUpload from "../sticker-pricing/design-upload"

type ProductActionsProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  disabled?: boolean
  onDesignUpload?: (file: File, shape: StickerShape) => void
  onShapeChange?: (shape: StickerShape) => void
  onDimensionsChange?: (dimensions: StickerDimensions) => void
  hideUpload?: boolean
}

const optionsAsKeymap = (
  variantOptions: HttpTypes.StoreProductVariant["options"]
) => {
  return variantOptions?.reduce((acc: Record<string, string>, varopt: any) => {
    acc[varopt.option_id] = varopt.value
    return acc
  }, {})
}

export default function ProductActions({
  product,
  disabled,
  onDesignUpload,
  onShapeChange,
  onDimensionsChange,
  hideUpload = false,
}: ProductActionsProps) {
  const [options, setOptions] = useState<Record<string, string | undefined>>({})
  const [isAdding, setIsAdding] = useState(false)
  
  // Sticker-specific state for shape-based pricing
  const [stickerShape, setStickerShape] = useState<StickerShape>('rectangle')
  const [stickerDimensions, setStickerDimensions] = useState<StickerDimensions>({ width: 10, height: 6 })
  const [stickerQuantity, setStickerQuantity] = useState<number>(STICKER_MOQ)
  const [stickerPricing, setStickerPricing] = useState<StickerShapePricingResult | null>(null)
  const [pricingLoading, setPricingLoading] = useState<boolean>(false)
  const [pricingError, setPricingError] = useState<string | null>(null)
  
  // Design upload state
  const [uploadedDesign, setUploadedDesign] = useState<File | null>(null)
  const [hasUploadedDesign, setHasUploadedDesign] = useState(false)
  
  const countryCode = useParams().countryCode as string

  // Default dimensions for each shape
  const defaultDimensions: Record<StickerShape, StickerDimensions> = {
    rectangle: { width: 10, height: 6 },
    square: { width: 8, height: 8 },
    circle: { diameter: 10 },
    diecut: { width: 10, height: 6 }
  }

  // If there is only 1 variant, preselect the options
  useEffect(() => {
    if (product.variants?.length === 1) {
      const variantOptions = optionsAsKeymap(product.variants[0].options)
      setOptions(variantOptions ?? {})
    }
  }, [product.variants])

  const selectedVariant = useMemo(() => {
    if (!product.variants || product.variants.length === 0) {
      return
    }

    return product.variants.find((v) => {
      const variantOptions = optionsAsKeymap(v.options)
      return isEqual(variantOptions, options)
    })
  }, [product.variants, options])

  // Check if this is a sticker product
  const isSticker = selectedVariant ? isStickerVariant(selectedVariant.id) : false

  // Calculate sticker pricing whenever relevant values change
  useEffect(() => {
    if (!isSticker || !selectedVariant) {
      setStickerPricing(null)
      return
    }

    const calculatePricing = async () => {
      // Validate quantity first
      const validation = validateStickerQuantity(stickerQuantity)
      if (!validation.isValid) {
        setPricingError(validation.error || "Invalid quantity")
        setStickerPricing(null)
        return
      }

      // Check if we have valid dimensions
      if (stickerShape === 'circle' && !stickerDimensions.diameter) {
        setPricingError("Please enter a diameter for the circle")
        return
      }
      
      if (stickerShape !== 'circle' && (!stickerDimensions.width || !stickerDimensions.height)) {
        setPricingError("Please enter both width and height")
        return
      }

      setPricingLoading(true)
      setPricingError(null)

      try {
        const result = await calculateStickerShapePricing({
          variantId: selectedVariant.id,
          quantity: stickerQuantity,
          shape: stickerShape,
          dimensions: stickerDimensions,
        })

        if (result) {
          setStickerPricing(result)
        } else {
          setPricingError("Failed to calculate pricing. Please try again.")
        }
      } catch (err) {
        console.error("Pricing calculation error:", err)
        setPricingError("An error occurred while calculating pricing.")
      } finally {
        setPricingLoading(false)
      }
    }

    // Debounce the calculation to avoid too many API calls
    const timeoutId = setTimeout(calculatePricing, 300)
    return () => clearTimeout(timeoutId)
  }, [stickerShape, stickerDimensions, stickerQuantity, selectedVariant, isSticker])

  // update the options when a variant is selected
  const setOptionValue = (optionId: string, value: string) => {
    setOptions((prev) => ({
      ...prev,
      [optionId]: value,
    }))
  }

  //check if the selected options produce a valid variant
  const isValidVariant = useMemo(() => {
    return product.variants?.some((v) => {
      const variantOptions = optionsAsKeymap(v.options)
      return isEqual(variantOptions, options)
    })
  }, [product.variants, options])

  // check if the selected variant is in stock
  const inStock = useMemo(() => {
    // If we don't manage inventory, we can always add to cart
    if (selectedVariant && !selectedVariant.manage_inventory) {
      return true
    }

    // If we allow back orders on the variant, we can add to cart
    if (selectedVariant?.allow_backorder) {
      return true
    }

    // If there is inventory available, we can add to cart
    if (
      selectedVariant?.manage_inventory &&
      (selectedVariant?.inventory_quantity || 0) > 0
    ) {
      return true
    }

    // Otherwise, we can't add to cart
    return false
  }, [selectedVariant])

  const actionsRef = useRef<HTMLDivElement>(null)

  const inView = useIntersection(actionsRef, "0px")

  // add the selected variant to the cart
  const handleAddToCart = async () => {
    if (!selectedVariant?.id) return null

    setIsAdding(true)

    if (isSticker) {
      await addStickerToCart({
        variantId: selectedVariant.id,
        quantity: stickerQuantity,
        countryCode,
        shape: stickerShape,
        dimensions: stickerDimensions,
      })
    } else {
      await addToCart({
        variantId: selectedVariant.id,
        quantity: 1,
        countryCode,
      })
    }

    setIsAdding(false)
  }

  // Handle design upload
  const handleDesignUpload = (file: File, detectedShape: StickerShape) => {
    setUploadedDesign(file)
    setHasUploadedDesign(true)
    setStickerShape(detectedShape)
    setPricingError(null)
    
    // Call parent callback if provided
    if (onDesignUpload) {
      onDesignUpload(file, detectedShape)
    }
  }

  // Update dimensions when shape changes
  useEffect(() => {
    const newDimensions = defaultDimensions[stickerShape]
    setStickerDimensions(newDimensions)
    
    // Call parent callback if provided
    if (onDimensionsChange) {
      onDimensionsChange(newDimensions)
    }
  }, [stickerShape, onDimensionsChange])

  return (
    <>
      <div className="flex flex-col gap-y-2" ref={actionsRef}>
        <div>
          {(product.variants?.length ?? 0) > 1 && (
            <div className="flex flex-col gap-y-4">
              {(product.options || []).map((option) => {
                return (
                  <div key={option.id}>
                    <OptionSelect
                      option={option}
                      current={options[option.id]}
                      updateOption={setOptionValue}
                      title={option.title ?? ""}
                      data-testid="product-options"
                      disabled={!!disabled || isAdding}
                    />
                  </div>
                )
              })}
              <Divider />
            </div>
          )}
        </div>

        {/* Sticker-specific quantity selector and pricing */}
        {isSticker && selectedVariant && (
          <div className="space-y-4">
            {/* Design Upload - First Step (conditionally hidden) */}
            {!hideUpload && (
              <DesignUpload
                onDesignUpload={handleDesignUpload}
                onShapeDetected={(shape) => setStickerShape(shape)}
                disabled={!!disabled || isAdding}
                className="mb-6"
              />
            )}

            {/* Show configuration options */}
            {(hasUploadedDesign || hideUpload) && (
              <>
                {/* Shape Selection */}
                <StickerShapeSelector
                  selectedShape={stickerShape}
                  onShapeChange={(newShape) => {
                    setStickerShape(newShape)
                    setPricingError(null)
                    
                    // Call parent callback if provided
                    if (onShapeChange) {
                      onShapeChange(newShape)
                    }
                  }}
                  disabled={!!disabled || isAdding}
                />

                {/* Size Input */}
                <SizeInput
                  shape={stickerShape}
                  dimensions={stickerDimensions}
                  onDimensionsChange={(newDimensions) => {
                    setStickerDimensions(newDimensions)
                    setPricingError(null)
                    
                    // Call parent callback if provided
                    if (onDimensionsChange) {
                      onDimensionsChange(newDimensions)
                    }
                  }}
                  disabled={!!disabled || isAdding}
                />

                {/* Quantity Selection */}
                <StickerQuantitySelector
                  quantity={stickerQuantity}
                  onQuantityChange={(newQuantity) => {
                    setStickerQuantity(newQuantity)
                    setPricingError(null)
                  }}
                  tiers={[]} // We don't use legacy tiers for shape-based pricing
                  disabled={!!disabled || isAdding}
                />
              </>
            )}
            
            {/* Error Display */}
            {pricingError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <div className="text-sm text-red-600">
                  ⚠ {pricingError}
                </div>
              </div>
            )}

            {/* Pricing Display - Show even without design upload */}
            {stickerPricing && !pricingError && (
              <StickerShapePricingDisplay
                pricing={stickerPricing}
                loading={pricingLoading}
              />
            )}

            {/* Loading State */}
            {pricingLoading && (
              <div className="text-sm text-ui-fg-subtle">
                Calculating pricing...
              </div>
            )}
          </div>
        )}

        {/* Regular product pricing (only show for non-stickers) */}
        {!isSticker && (
          <ProductPrice product={product} variant={selectedVariant} />
        )}

        <Button
          onClick={handleAddToCart}
          disabled={
            !inStock ||
            !selectedVariant ||
            !!disabled ||
            isAdding ||
            !isValidVariant ||
            (isSticker && (!hideUpload && !hasUploadedDesign) || pricingLoading || !!pricingError || !stickerPricing)
          }
          variant="primary"
          className="w-full h-10"
          isLoading={isAdding}
          data-testid="add-product-button"
        >
          {!selectedVariant && !options
            ? "Select variant"
            : !inStock || !isValidVariant
            ? "Out of stock"
            : isSticker
            ? (!hideUpload && !hasUploadedDesign)
              ? stickerPricing 
                ? `Upload design to add ${stickerQuantity} sticker${stickerQuantity > 1 ? 's' : ''} to cart - €${stickerPricing.totalPrice.toFixed(2)}`
                : "Upload your design to continue"
              : stickerPricing 
                ? `Add ${stickerQuantity} sticker${stickerQuantity > 1 ? 's' : ''} to cart - €${stickerPricing.totalPrice.toFixed(2)}`
                : "Configure your sticker"
            : "Add to cart"}
        </Button>
        <MobileActions
          product={product}
          variant={selectedVariant}
          options={options}
          updateOptions={setOptionValue}
          inStock={inStock}
          handleAddToCart={handleAddToCart}
          isAdding={isAdding}
          show={!inView}
          optionsDisabled={!!disabled || isAdding}
        />
      </div>
    </>
  )
}
