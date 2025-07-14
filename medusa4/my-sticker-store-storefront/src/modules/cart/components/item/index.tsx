"use client"

import { Table, Text, clx } from "@medusajs/ui"
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
import { convertToLocale } from "@lib/util/money"

type ItemProps = {
  item: HttpTypes.StoreCartLineItem
  type?: "full" | "preview"
  currencyCode: string
  stickerPricing?: {
    unitPrice: number
    totalPrice: number
    appliedTier: {
      minQuantity: number
      maxQuantity: number | null
      pricePerUnit: number
    }
    savings: number
    originalPrice: number
  }
}

const Item = ({ item, type = "full", currencyCode, stickerPricing }: ItemProps) => {
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isSticker = item.variant_id ? isStickerVariant(item.variant_id) : false
  
  // Extract sticker pricing from metadata if available
  const stickerMetadata = item.metadata
  const hasDynamicPricing = stickerMetadata?.dynamic_shape_pricing
  
  // Calculate sticker pricing from metadata for display
  let dynamicStickerPricing = null
  if (isSticker && hasDynamicPricing) {
    // Check if prices are already in euros or in cents
    // Try both formats and use the one that makes sense
    const rawUnitPrice = item.unit_price || 0
    const rawTotalPrice = item.total || 0
    
    // If unit_price is very large (like 394), it's probably in cents
    // If it's small (like 3.94), it's probably in euros
    let actualUnitPrice = rawUnitPrice
    let actualTotalPrice = rawTotalPrice
    
    // Heuristic: if unit price > 50 and seems like cents, convert
    if (rawUnitPrice > 50 && rawTotalPrice > rawUnitPrice * item.quantity * 0.8) {
      actualUnitPrice = rawUnitPrice / 100
      actualTotalPrice = rawTotalPrice / 100
    }
    
    // Use metadata for display information
    dynamicStickerPricing = {
      unitPrice: actualUnitPrice,
      totalPrice: actualTotalPrice,
      basePrice: stickerMetadata.base_price || 0,
      savings: 0, // We'll calculate savings based on standard pricing if needed
      originalPrice: actualTotalPrice // For now, no savings display
    }
  }
  
  // Use dynamic pricing if available, otherwise fall back to old stickerPricing prop
  const displayPricing = hasDynamicPricing ? dynamicStickerPricing : stickerPricing

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

  // TODO: Update this to grab the actual max inventory
  const maxQtyFromInventory = 10
  const maxQuantity = item.variant?.manage_inventory ? 10 : maxQtyFromInventory

  // For stickers, use different quantity options due to MOQ requirements
  const getStickerQuantityOptions = () => {
    const currentQty = item.quantity
    const baseOptions = [500, 1000, 2000, 5000, 10000]
    
    // Include current quantity if it's not in base options
    if (!baseOptions.includes(currentQty)) {
      baseOptions.push(currentQty)
      baseOptions.sort((a, b) => a - b)
    }
    
    return baseOptions.map(qty => (
      <option value={qty} key={qty}>
        {qty}
      </option>
    ))
  }

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

  // Format price for display (now consistent for both stickers and regular items in euros)
  const formatPrice = (priceInEuros: number) => {
    return convertToLocale({
      amount: priceInEuros,
      currency_code: currencyCode || 'EUR',
    })
  }

  return (
    <Table.Row className="w-full" data-testid="product-row">
      <Table.Cell className="!pl-0 p-4 w-24">
        <LocalizedClientLink
          href={`/products/${item.product_handle}`}
          className={clx("flex", {
            "w-16": type === "preview",
            "small:w-24 w-12": type === "full",
          })}
        >
          <Thumbnail
            thumbnail={item.thumbnail}
            images={item.variant?.product?.images}
            size="square"
          />
        </LocalizedClientLink>
      </Table.Cell>

      <Table.Cell className="text-left">
        <Text
          className="txt-medium-plus text-ui-fg-base"
          data-testid="product-title"
        >
          {item.product_title}
        </Text>
        <LineItemOptions 
          variant={item.variant} 
          metadata={item.metadata || undefined}
          data-testid="product-variant" 
        />
        {isSticker && displayPricing && displayPricing.savings > 0 && (
          <Text className="text-green-600 text-sm">
            Bulk discount applied: {formatPrice(displayPricing.savings)} saved!
          </Text>
        )}
      </Table.Cell>

      {type === "full" && (
        <Table.Cell>
          <div className="flex gap-2 items-center w-28">
            <DeleteButton id={item.id} data-testid="product-delete-button" />
            <CartItemSelect
              value={item.quantity}
              onChange={(value) => changeQuantity(parseInt(value.target.value))}
              className="w-14 h-10 p-4"
              data-testid="product-select-button"
            >
              {/* TODO: Update this with the v2 way of managing inventory */}
              {isSticker ? getStickerQuantityOptions() : getRegularQuantityOptions()}
            </CartItemSelect>
            {updating && <Spinner />}
          </div>
          <ErrorMessage error={error} data-testid="product-error-message" />
        </Table.Cell>
      )}

      {type === "full" && (
        <Table.Cell className="hidden small:table-cell">
          {isSticker && displayPricing ? (
            <div className="text-right">
              <Text className="text-ui-fg-base font-medium">
                {formatPrice(displayPricing.unitPrice)}
              </Text>
              {displayPricing.savings > 0 && (
                <Text className="text-ui-fg-muted line-through text-sm">
                  {formatPrice(displayPricing.originalPrice / item.quantity)}
                </Text>
              )}
            </div>
          ) : (
            <LineItemUnitPrice
              item={item}
              style="tight"
              currencyCode={currencyCode}
            />
          )}
        </Table.Cell>
      )}

      <Table.Cell className="!pr-0">
        <span
          className={clx("!pr-0", {
            "flex flex-col items-end h-full justify-center": type === "preview",
          })}
        >
          {type === "preview" && (
            <span className="flex gap-x-1 ">
              <Text className="text-ui-fg-muted">{item.quantity}x </Text>
              {isSticker && displayPricing ? (
                <Text className="text-ui-fg-base font-medium">
                  {formatPrice(displayPricing.unitPrice)}
                </Text>
              ) : (
                <LineItemUnitPrice
                  item={item}
                  style="tight"
                  currencyCode={currencyCode}
                />
              )}
            </span>
          )}
          {isSticker && displayPricing ? (
            <div className="text-right">
              <Text className="text-ui-fg-base font-medium">
                {formatPrice(displayPricing.totalPrice)}
              </Text>
              {displayPricing.savings > 0 && (
                <Text className="text-ui-fg-muted line-through text-sm">
                  {formatPrice(displayPricing.originalPrice)}
                </Text>
              )}
            </div>
          ) : (
            <LineItemPrice
              item={item}
              style="tight"
              currencyCode={currencyCode}
            />
          )}
        </span>
      </Table.Cell>
    </Table.Row>
  )
}

export default Item
