// Your sticker variant ID
const STICKER_VARIANT_ID = "variant_01K03CSEQN3W8F1CRXJFW7AZWV"

// Minimum Order Quantity for stickers
export const STICKER_MOQ = 500

/**
 * Check if a variant ID is a sticker variant
 */
export function isStickerVariant(variantId: string): boolean {
  return variantId === STICKER_VARIANT_ID
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