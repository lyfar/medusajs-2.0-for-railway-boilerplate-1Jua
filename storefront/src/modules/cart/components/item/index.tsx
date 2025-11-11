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
import { useMemo, useState } from "react"
import { isStickerLineItem } from "@lib/util/sticker-utils"
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

  const isSticker = isStickerLineItem(item)
  
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
  const stickerDimensions = item.metadata?.dimensions as { width?: number; height?: number; diameter?: number } | undefined
  const stickerShape = typeof item.metadata?.shape === "string" ? (item.metadata.shape as string) : null
  
  // Format size display from dimensions
  const formatSizeDisplay = () => {
    const dimensions = stickerDimensions
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

  const stickerAspectRatio = useMemo(() => {
    if (!stickerDimensions) return 1
    if (stickerDimensions.diameter) return 1
    const { width, height } = stickerDimensions
    if (!width || !height) return 1
    const ratio = width / height
    if (!Number.isFinite(ratio) || ratio <= 0) {
      return 1
    }
    return Math.min(Math.max(ratio, 0.35), 3.5)
  }, [
    stickerDimensions?.width,
    stickerDimensions?.height,
    stickerDimensions?.diameter,
  ])

  const stickerPreviewRadius = useMemo(() => {
    if (!stickerShape) return "0.75rem"
    const normalized = stickerShape.toLowerCase()
    if (normalized === "circle") return "999px"
    if (normalized === "diecut") return "1rem"
    if (normalized === "square") return "0.65rem"
    return "0.75rem"
  }, [stickerShape])

  const renderDesignThumbnail = (variant: "preview" | "desktop" | "mobile") => {
    const baseWidth =
      variant === "preview" ? 64 : variant === "mobile" ? 80 : 88

    if (designUrl && isSticker) {
      return (
        <button
          type="button"
          onClick={() => setIsLightboxOpen(true)}
          className="relative block flex-shrink-0 overflow-hidden border border-ui-border-subtle bg-ui-bg-subtle focus:outline-none focus-visible:ring-2 focus-visible:ring-ui-ring"
          style={{
            width: baseWidth,
            aspectRatio: stickerAspectRatio,
            borderRadius: stickerPreviewRadius,
          }}
        >
          <img
            src={designUrl}
            alt="Custom sticker design"
            className="absolute inset-0 h-full w-full bg-neutral-950 object-contain"
          />
          <span className="sr-only">Preview full sticker design</span>
        </button>
      )
    }

    return (
      <LocalizedClientLink href={`/products/${item.product_handle}`}>
        <div
          className="relative flex-shrink-0 overflow-hidden rounded-md border border-ui-border-subtle bg-ui-bg-subtle"
          style={{ width: baseWidth, height: baseWidth }}
        >
          <Thumbnail
            thumbnail={item.thumbnail}
            images={item.variant?.product?.images}
            size="square"
            className="rounded-none"
          />
        </div>
      </LocalizedClientLink>
    )
  }

  if (type === "preview") {
    return (
      <div className="flex items-center gap-x-4 py-3">
        <div className="flex-shrink-0">{renderDesignThumbnail("preview")}</div>
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
      <div className="hidden small:grid small:grid-cols-[minmax(0,1.6fr)_auto_auto_auto_auto] small:items-center small:gap-6 small:py-2">
        {/* Product Image and Details */}
        <div className="flex items-center gap-4 min-w-0">
          {renderDesignThumbnail("desktop")}
          <div className="flex flex-col gap-2 min-w-0">
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
                    <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-md border border-border">
                      {item.metadata.shape}
                    </span>
                  )}
                  {formatSizeDisplay() && (
                    <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-md border border-border">
                      {formatSizeDisplay()}
                    </span>
                  )}
                  {designUrl && (
                    <span className="px-2 py-1 bg-primary text-primary-foreground text-xs rounded-md border border-primary">
                      Custom Design
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quantity */}
        <div className="flex flex-col items-center justify-center gap-1">
          <span className="text-ui-fg-muted dark:text-gray-400 text-sm font-medium">
            Qty
          </span>
          <div className="flex items-center justify-center gap-2 min-h-[2.5rem]">
            {isSticker ? (
              <div className="px-3 py-2 bg-ui-bg-subtle border border-ui-border-subtle rounded-md text-ui-fg-muted text-sm font-medium min-w-[72px] text-center">
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
        <div className="flex flex-col items-center justify-center gap-1">
          <span className="text-ui-fg-muted dark:text-gray-400 text-sm font-medium">
            Unit
          </span>
          <div className="flex items-center justify-center">
            <LineItemUnitPrice item={item} style="tight" />
          </div>
        </div>

        {/* Total Price */}
        <div className="flex flex-col items-center justify-center gap-1">
          <span className="text-ui-fg-muted dark:text-gray-400 text-sm font-medium">
            Total
          </span>
          <div className="text-lg font-semibold text-ui-fg-base dark:text-white whitespace-nowrap">
            <LineItemPrice item={item} style="tight" currencyCode={currencyCode} />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end">
          <DeleteButton id={item.id} data-testid="product-delete-button" />
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="small:hidden space-y-4">
        {/* Product Info */}
        <div className="flex gap-4">
          {renderDesignThumbnail("mobile")}
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
                    <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-md border border-border">
                      {item.metadata.shape}
                    </span>
                  )}
                  {formatSizeDisplay() && (
                    <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-md border border-border">
                      {formatSizeDisplay()}
                    </span>
                  )}
                  {designUrl && (
                    <span className="px-2 py-1 bg-primary text-primary-foreground text-xs rounded-md border border-primary">
                      Custom Design
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


        {/* Quantity and Actions */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-sm text-ui-fg-muted dark:text-gray-400">
              Quantity
            </span>
            {isSticker ? (
              <div className="px-3 py-2 bg-ui-bg-subtle border border-ui-border-subtle rounded-md text-ui-fg-muted text-sm font-medium min-w-[72px] text-center">
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
