"use client"

import { Button } from "@medusajs/ui"
import { isEqual } from "lodash"
import { useParams } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"

import { useIntersection } from "@lib/hooks/use-in-view"
import Divider from "@modules/common/components/divider"
import OptionSelect from "@modules/products/components/product-actions/option-select"

import MobileActions from "./mobile-actions"
import ProductPrice from "../product-price"
import { addToCart, addStickerToCart } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import { isStickerProduct, STICKER_MOQ } from "@lib/util/sticker-utils"
import { useStickerPricing } from "@lib/hooks/use-sticker-pricing"
import StickerPricingDisplay from "../sticker-pricing"
import StickerQuantitySelector from "../sticker-pricing/quantity-selector"
import FileUpload from "../file-upload"

type ProductActionsProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  disabled?: boolean
}

const optionsAsKeymap = (variantOptions: any) => {
  return variantOptions?.reduce((acc: Record<string, string | undefined>, varopt: any) => {
    if (varopt.option && varopt.value !== null && varopt.value !== undefined) {
      acc[varopt.option.title] = varopt.value
    }
    return acc
  }, {})
}

export default function ProductActions({
  product,
  region,
  disabled,
}: ProductActionsProps) {
  const [options, setOptions] = useState<Record<string, string | undefined>>({})
  const [isAdding, setIsAdding] = useState(false)
  const [stickerQuantity, setStickerQuantity] = useState<number>(STICKER_MOQ)
  const [uploadedFileKey, setUploadedFileKey] = useState<string | null>(null)
  const [uploadedPublicUrl, setUploadedPublicUrl] = useState<string | null>(null)
  const countryCode = useParams().countryCode as string

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
  const isSticker = isStickerProduct(product)

  // Use sticker pricing hook for stickers
  const {
    pricing: stickerPricing,
    loading: pricingLoading,
    error: pricingError,
  } = useStickerPricing({
    variantId: selectedVariant?.id,
    quantity: stickerQuantity,
    enabled: isSticker,
  })

  // update the options when a variant is selected
  const setOptionValue = (title: string, value: string) => {
    setOptions((prev) => ({
      ...prev,
      [title]: value,
    }))
  }

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

    try {
      if (isSticker) {
        await addStickerToCart({
          variantId: selectedVariant.id,
          quantity: stickerQuantity,
          countryCode,
          metadata: {
            file_key: uploadedFileKey,
            design_url: uploadedPublicUrl,
          },
        })
      } else {
        await addToCart({
          variantId: selectedVariant.id,
          quantity: 1,
          countryCode,
        })
      }
    } catch (error) {
      console.error("Error adding to cart:", error)
    }

    setIsAdding(false)
  }

  const handleFileUploadComplete = (fileKey: string, publicUrl: string) => {
    setUploadedFileKey(fileKey)
    setUploadedPublicUrl(publicUrl)
  }

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
                      current={options[option.title ?? ""]}
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

        {/* Conditional content based on sticker vs regular product */}
        {isSticker ? (
          <div className="space-y-4">
            {/* Sticker Design Upload */}
            <FileUpload onUploadComplete={handleFileUploadComplete} disabled={!!disabled || isAdding} />

            {/* Sticker Quantity Selector */}
            <StickerQuantitySelector
              quantity={stickerQuantity}
              onQuantityChange={setStickerQuantity}
              disabled={!!disabled || isAdding}
            />

            {/* Sticker Pricing Display */}
            {pricingError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <div className="text-sm text-red-600">
                  ⚠ {pricingError}
                </div>
              </div>
            )}

            {stickerPricing && !pricingError && (
              <StickerPricingDisplay
                pricing={stickerPricing}
                loading={pricingLoading}
              />
            )}

            {pricingLoading && (
              <div className="text-sm text-ui-fg-subtle">
                Calculating pricing...
              </div>
            )}
          </div>
        ) : (
          <ProductPrice product={product} variant={selectedVariant} />
        )}

        <Button
          onClick={handleAddToCart}
          disabled={
            !inStock ||
            !selectedVariant ||
            !!disabled ||
            isAdding ||
            (isSticker && (
              pricingLoading ||
              !!pricingError ||
              !stickerPricing ||
              !uploadedFileKey
            ))
          }
          variant="primary"
          className="w-full h-10"
          isLoading={isAdding}
          data-testid="add-product-button"
        >
          {!selectedVariant
            ? "Select variant"
            : !inStock
            ? "Out of stock"
            : isSticker
            ? stickerPricing
              ? `Add ${stickerQuantity.toLocaleString()} sticker${stickerQuantity > 1 ? 's' : ''} to cart - €${stickerPricing.totalPrice.toFixed(2)}`
              : "Configure your stickers"
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
