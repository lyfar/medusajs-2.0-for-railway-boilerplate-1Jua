export const STICKER_MOQ = 500; // Minimum Order Quantity

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validate sticker quantity against business rules (frontend version)
 * @param quantity - The quantity to validate
 * @returns ValidationResult object
 */
export function validateStickerQuantity(quantity: number): ValidationResult {
  if (!Number.isInteger(quantity) || quantity <= 0) {
    return {
      isValid: false,
      error: "Quantity must be a positive integer"
    };
  }

  if (quantity < STICKER_MOQ) {
    return {
      isValid: false,
      error: `Minimum order quantity is ${STICKER_MOQ.toLocaleString()} stickers`
    };
  }

  return { isValid: true };
}

/**
 * Validate multiple cart items for sticker quantities
 * @param cartItems - Array of cart items with variantId and quantity
 * @returns ValidationResult object
 */
export function validateCartStickerQuantities(
  cartItems: Array<{ variantId: string; quantity: number }>
): ValidationResult {
  for (const item of cartItems) {
    const validation = validateStickerQuantity(item.quantity);
    if (!validation.isValid) {
      return {
        isValid: false,
        error: `Invalid quantity for variant ${item.variantId}: ${validation.error}`
      };
    }
  }

  return { isValid: true };
}

/**
 * Get preset quantities that meet MOQ requirements
 */
export function getPresetQuantities(): number[] {
  return [500, 1000, 2000, 5000];
}

/**
 * Check if a quantity is a preset value
 */
export function isPresetQuantity(quantity: number): boolean {
  return getPresetQuantities().includes(quantity);
} 