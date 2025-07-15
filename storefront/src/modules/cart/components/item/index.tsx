"use client"

import { Text } from "@medusajs/ui"
import { updateLineItem } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import CartItemSelect from "@modules/cart/components/cart-item-select"
import ErrorMessage from "@modules/checkout/components/error-message"
import DeleteButton from "@modules/common/components/delete-button"
import LineItemOptions from "@modules/common/components/line-item-options"
import LineItemPrice from "@modules/common/components/line-item-price"
import LineItemUnitPrice from "@modules/common/components/line-item-unit-price"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Spinner from "@modules/common/icons/spinner"
import Thumbnail from "@modules/products/components/thumbnail"
import { useState } from "react"
import { isStickerVariant } from "@lib/util/sticker-utils"
import Lightbox from "@modules/common/components/lightbox"

type ItemProps = {
  item: HttpTypes.StoreCartLineItem
  type?: "full" | "preview"
  currencyCode: string
  isLast?: boolean
}

const Item = ({ item, type = "full", currencyCode, isLast = false }: ItemProps) => {
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)
  const [imageError, setImageError] = useState(false)

  const isSticker = item.variant_id ? isStickerVariant(item.variant_id) : false
  
  const changeQuantity = async (quantity: number) => {
    setError(null)
    setUpdating(true)

    await updateLineItem({
      lineId: item.id,
      quantity,
    })
      .catch((err) => {
        setError(err.message)
      })
      .finally(() => {
        setUpdating(false)
      })
  }

  const rawDesignUrl = (item.metadata?.design_url as string) || null
  
  // Fix malformed Cloudflare R2 URLs
  const normalizeCloudflareUrl = (url: string) => {
    // Check if URL has the malformed pattern: r2.devpk_
    if (url.includes('r2.devpk_')) {
      // Extract the filename from the end of the URL
      const filename = url.split('/').pop()
      // Replace the malformed part with correct structure
      const baseUrl = url.split('r2.devpk_')[0] + 'r2.dev/'
      return baseUrl + filename
    }
    return url
  }
  
  const designUrl = rawDesignUrl ? normalizeCloudflareUrl(rawDesignUrl) : null
  
  // Debug: log the URLs to see the fix
  if (rawDesignUrl) {
    console.log('Raw Design URL:', rawDesignUrl)
    console.log('Fixed Design URL:', designUrl)
  }
  
  // Format size display from dimensions
  const formatSizeDisplay = () => {
    const dimensions = item.metadata?.dimensions as { width?: number; height?: number; diameter?: number } | undefined
    if (!dimensions) return null
    
    if (dimensions.diameter) {
      return `${dimensions.diameter} cm`
    } else if (dimensions.width && dimensions.height) {
      return `${dimensions.width} x ${dimensions.height} cm`
    }
    return null
  }

  // TODO: Update this to grab the actual max inventory
  const maxQtyFromInventory = 10
  const maxQuantity = item.variant?.manage_inventory ? 10 : maxQtyFromInventory

  // For regular products, use 1-10 range
  const getRegularQuantityOptions = () => {
    return Array.from(
      {
        length: Math.min(maxQuantity, 10),
      },
      (_, i) => (
        <option value={i + 1} key={i}>
          {i + 1}
        </option>
      )
    )
  }

  if (type === "preview") {
    return (
      <div className="flex items-center gap-x-4 py-3">
        <div className="w-16 h-16 flex-shrink-0">
          <LocalizedClientLink href={`/products/${item.product_handle}`}>
            <Thumbnail
              thumbnail={item.thumbnail}
              images={item.variant?.product?.images}
              size="square"
            />
          </LocalizedClientLink>
        </div>
        <div className="flex-1 min-w-0">
          <Text className="text-ui-fg-base font-medium truncate">
            {item.product_title}
          </Text>
          <div className="flex items-center gap-x-2 text-sm text-ui-fg-muted">
            <span>{item.quantity.toLocaleString()}x</span>
            <LineItemUnitPrice item={item} style="tight" />
          </div>
        </div>
        <div className="text-right">
          <LineItemPrice item={item} style="tight" currencyCode={currencyCode} />
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 py-6" data-testid="product-row">
      {/* Desktop Layout */}
      <div className="hidden small:flex small:items-center small:gap-6 small:py-2">
        {/* Product Image and Details */}
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="w-20 h-20 flex-shrink-0">
            <LocalizedClientLink href={`/products/${item.product_handle}`}>
              <Thumbnail
                thumbnail={item.thumbnail}
                images={item.variant?.product?.images}
                size="square"
                className="rounded-md"
              />
            </LocalizedClientLink>
          </div>
          <div className="flex flex-col gap-2 min-w-0 flex-1">
            <Text className="text-ui-fg-base dark:text-white font-semibold text-base">
              {item.product_title}
            </Text>
            
            {!isSticker && (
              <Text className="text-sm text-ui-fg-muted dark:text-gray-400">
                {item.variant?.title}
              </Text>
            )}
            
            {isSticker && (
              <div className="space-y-2">
                {/* Sticker properties */}
                <div className="flex flex-wrap gap-2">
                  {typeof item.metadata?.shape === "string" && (
                    <span className="px-2 py-1 bg-gray-700 dark:bg-gray-900 text-white text-xs rounded-md border border-gray-600">
                      {item.metadata.shape}
                    </span>
                  )}
                  {formatSizeDisplay() && (
                    <span className="px-2 py-1 bg-gray-700 dark:bg-gray-900 text-white text-xs rounded-md border border-gray-600">
                      {formatSizeDisplay()}
                    </span>
                  )}
                </div>
                
                {/* Design preview */}
                {designUrl && (
                  <div className="flex items-center gap-x-3 p-2 bg-gray-700 dark:bg-gray-900 rounded-md border border-gray-600">
                    {!imageError ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={designUrl}
                        alt="Sticker design preview"
                        className="w-12 h-12 object-cover border border-gray-500 rounded-md bg-white flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => setIsLightboxOpen(true)}
                        onError={() => {
                          console.error('Failed to load design image:', designUrl)
                          setImageError(true)
                        }}
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-600 border border-gray-500 rounded-md flex items-center justify-center flex-shrink-0">
                        <span className="text-xs text-gray-400">No image</span>
                      </div>
                    )}
                    <div className="flex flex-col justify-center min-w-0">
                      <span className="text-xs text-white font-medium">Custom Design</span>
                      {!imageError ? (
                        <button
                          onClick={() => setIsLightboxOpen(true)}
                          className="text-xs text-blue-400 hover:text-blue-300 hover:underline text-left"
                        >
                          View full design
                        </button>
                      ) : (
                        <span className="text-xs text-red-400">Image failed to load</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Quantity */}
        <div className="flex flex-col items-center justify-center gap-2 flex-shrink-0">
          <span className="text-ui-fg-muted dark:text-gray-400 text-sm font-medium">Qty</span>
          <div className="flex items-center justify-center gap-2">
            {isSticker ? (
              <div className="px-3 py-2 bg-gray-700 dark:bg-gray-900 border border-gray-600 rounded-md text-white text-sm font-medium min-w-[60px] text-center">
                {item.quantity.toLocaleString()}
              </div>
            ) : (
              <CartItemSelect
                value={item.quantity}
                onChange={(value) => changeQuantity(parseInt(value.target.value))}
                className="w-20 h-10 px-2"
                data-testid="product-select-button"
              >
                {getRegularQuantityOptions()}
              </CartItemSelect>
            )}
            {updating && <Spinner />}
          </div>
        </div>

        {/* Unit Price */}
        <div className="flex flex-col items-center justify-center gap-2 flex-shrink-0">
          <span className="text-ui-fg-muted dark:text-gray-400 text-sm font-medium">Unit Price</span>
          <div className="flex items-center justify-center">
            <LineItemUnitPrice item={item} style="tight" />
          </div>
        </div>

        {/* Total Price */}
        <div className="flex flex-col items-center justify-center gap-2 flex-shrink-0">
          <span className="text-ui-fg-muted dark:text-gray-400 text-sm font-medium">Total</span>
          <div className="text-lg font-semibold text-ui-fg-base dark:text-white">
            <LineItemPrice item={item} style="tight" currencyCode={currencyCode} />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-center flex-shrink-0">
          <DeleteButton id={item.id} data-testid="product-delete-button" />
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="small:hidden space-y-4">
        {/* Product Info */}
        <div className="flex gap-4">
          <div className="w-20 h-20 flex-shrink-0">
            <LocalizedClientLink href={`/products/${item.product_handle}`}>
              <Thumbnail
                thumbnail={item.thumbnail}
                images={item.variant?.product?.images}
                size="square"
                className="rounded-md"
              />
            </LocalizedClientLink>
          </div>
          <div className="flex-1 min-w-0">
            <Text className="text-ui-fg-base dark:text-white font-semibold text-base">
              {item.product_title}
            </Text>
            
            {!isSticker && (
              <Text className="text-sm text-ui-fg-muted dark:text-gray-400 mt-1">
                {item.variant?.title}
              </Text>
            )}
            
            {isSticker && (
              <div className="space-y-2 mt-2">
                {/* Sticker properties */}
                <div className="flex flex-wrap gap-2">
                  {typeof item.metadata?.shape === "string" && (
                    <span className="px-2 py-1 bg-gray-700 dark:bg-gray-900 text-white text-xs rounded-md border border-gray-600">
                      {item.metadata.shape}
                    </span>
                  )}
                  {formatSizeDisplay() && (
                    <span className="px-2 py-1 bg-gray-700 dark:bg-gray-900 text-white text-xs rounded-md border border-gray-600">
                      {formatSizeDisplay()}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Price info in header for mobile */}
            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-ui-fg-muted dark:text-gray-400">
                  {item.quantity.toLocaleString()}x
                </span>
                <LineItemUnitPrice item={item} style="tight" />
              </div>
              <div className="text-lg font-semibold text-ui-fg-base dark:text-white">
                <LineItemPrice item={item} style="tight" currencyCode={currencyCode} />
              </div>
            </div>
          </div>
        </div>

        {/* Sticker Design Preview (Mobile) */}
        {isSticker && designUrl && (
          <div className="flex items-center gap-x-3 p-3 bg-gray-700 dark:bg-gray-900 rounded-md border border-gray-600">
            {!imageError ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={designUrl}
                alt="Sticker design preview"
                className="w-16 h-16 object-cover border border-gray-500 rounded-md bg-white flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => setIsLightboxOpen(true)}
                onError={() => {
                  console.error('Failed to load design image:', designUrl)
                  setImageError(true)
                }}
              />
            ) : (
              <div className="w-16 h-16 bg-gray-600 border border-gray-500 rounded-md flex items-center justify-center flex-shrink-0">
                <span className="text-xs text-gray-400">No image</span>
              </div>
            )}
            <div className="flex flex-col justify-center min-w-0">
              <span className="text-sm text-white font-medium">Custom Design</span>
              {!imageError ? (
                <button
                  onClick={() => setIsLightboxOpen(true)}
                  className="text-sm text-blue-400 hover:text-blue-300 hover:underline text-left"
                >
                  View full design
                </button>
              ) : (
                <span className="text-sm text-red-400">Image failed to load</span>
              )}
            </div>
          </div>
        )}

        {/* Quantity and Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm text-ui-fg-muted dark:text-gray-400">Quantity:</span>
            {isSticker ? (
              <div className="px-3 py-2 bg-gray-700 dark:bg-gray-900 border border-gray-600 rounded-md text-white text-sm font-medium">
                {item.quantity.toLocaleString()}
              </div>
            ) : (
              <CartItemSelect
                value={item.quantity}
                onChange={(value) => changeQuantity(parseInt(value.target.value))}
                className="w-20 h-10 px-2"
                data-testid="product-select-button"
              >
                {getRegularQuantityOptions()}
              </CartItemSelect>
            )}
            {updating && <Spinner />}
          </div>
          
          <DeleteButton id={item.id} data-testid="product-delete-button" />
        </div>
      </div>
      
      {error && (
        <div className="mt-4">
          <ErrorMessage error={error} data-testid="product-error-message" />
        </div>
      )}

      {/* Lightbox for design preview */}
      {designUrl && (
        <Lightbox
          src={designUrl}
          alt="Full sticker design"
          isOpen={isLightboxOpen}
          onClose={() => setIsLightboxOpen(false)}
        />
      )}
    </div>
  )
}

export default Item
