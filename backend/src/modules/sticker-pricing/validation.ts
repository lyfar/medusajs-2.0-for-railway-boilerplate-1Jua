export const STICKER_MOQ = 500; // Minimum Order Quantity

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validate sticker quantity against business rules
 * @param quantity - The quantity to validate
 * @returns ValidationResult object
 */
export function validateStickerQuantity(
  quantity: number,
  moq: number = STICKER_MOQ
): ValidationResult {
  if (!Number.isInteger(quantity) || quantity <= 0) {
    return {
      isValid: false,
      error: "Quantity must be a positive integer"
    };
  }

  if (quantity < moq) {
    return {
      isValid: false,
      error: `Minimum order quantity is ${moq.toLocaleString()} stickers`
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
  cartItems: Array<{ variantId: string; quantity: number }>,
  moq: number = STICKER_MOQ
): ValidationResult {
  for (const item of cartItems) {
    const validation = validateStickerQuantity(item.quantity, moq);
    if (!validation.isValid) {
      return {
        isValid: false,
        error: `Invalid quantity for variant ${item.variantId}: ${validation.error}`
      };
    }
  }

  return { isValid: true };
} 
