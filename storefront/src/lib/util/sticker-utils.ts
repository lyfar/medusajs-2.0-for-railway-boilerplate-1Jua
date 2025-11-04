// Minimum Order Quantity for stickers
export const STICKER_MOQ = 500

const STICKER_PRODUCT_TYPE_VALUE = "sticker"

/**
 * Determine if a product should be treated as a sticker product.
 * Accepts any object with an optional `type.value` string or `metadata.is_sticker` flag.
 */
export function isStickerProduct(
  product:
    | { type?: { value?: string | null } | string | null; metadata?: Record<string, unknown> | null }
    | null
    | undefined
): boolean {
  if (!product) {
    return false
  }

  const metadata = product.metadata as Record<string, unknown> | null | undefined
  if (metadata && typeof metadata.is_sticker === "boolean") {
    return metadata.is_sticker
  }

  const typeValue =
    typeof product.type === "string"
      ? product.type
      : product.type?.value

  return typeof typeValue === "string" && typeValue.toLowerCase() === STICKER_PRODUCT_TYPE_VALUE
}

/**
 * Determine if a cart or order line item represents a sticker.
 * Falls back to product type when the metadata flag is missing.
 */
export function isStickerLineItem(
  item:
    | {
        metadata?: Record<string, unknown> | null
        variant?: { product?: { type?: { value?: string | null } | string | null; metadata?: Record<string, unknown> | null } | null }
      }
    | null
    | undefined
): boolean {
  if (!item) {
    return false
  }

  const metadata = item.metadata as Record<string, unknown> | null | undefined
  if (metadata && typeof metadata.is_sticker === "boolean") {
    return metadata.is_sticker
  }

  const variantProduct = item.variant?.product
  if (variantProduct) {
    return isStickerProduct(variantProduct)
  }

  return false
}

/**
 * Validate sticker quantity against business rules
 */
export function validateStickerQuantity(quantity: number): {
  isValid: boolean
  error?: string
} {
  if (!Number.isInteger(quantity) || quantity <= 0) {
    return {
      isValid: false,
      error: "Quantity must be a positive integer"
    }
  }

  if (quantity < STICKER_MOQ) {
    return {
      isValid: false,
      error: `Minimum order quantity is ${STICKER_MOQ.toLocaleString()} stickers`
    }
  }

  return { isValid: true }
}

/**
 * Get sticker quantity options for dropdown (MOQ-based increments)
 */
export function getStickerQuantityOptions(): Array<{ value: number; label: string }> {
  const options = []
  
  // Add increments of 500 for first few options
  for (let i = STICKER_MOQ; i < 2000; i += 500) {
    options.push({
      value: i,
      label: `${i.toLocaleString()} stickers`
    })
  }
  
  // Add larger increments
  const largerIncrements = [2000, 3000, 5000, 7500, 10000, 15000, 20000, 25000, 30000]
  largerIncrements.forEach(quantity => {
    options.push({
      value: quantity,
      label: `${quantity.toLocaleString()} stickers`
    })
  })
  
  return options
}

/**
 * Format price with euro symbol
 */
export function formatPrice(price: number): string {
  return `€${price.toFixed(2)}`
} 
