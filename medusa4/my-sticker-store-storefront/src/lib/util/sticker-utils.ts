/**
 * Check if a variant is a sticker variant
 */
export const isStickerVariant = (variantId: string): boolean => {
  const STICKER_VARIANT_ID = "variant_01JVXFAJY3W3JSBH3HJPEHYRYZ"
  return variantId === STICKER_VARIANT_ID
} 