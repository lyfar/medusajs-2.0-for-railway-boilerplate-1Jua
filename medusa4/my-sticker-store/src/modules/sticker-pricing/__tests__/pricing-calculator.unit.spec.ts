import { describe, it, expect, beforeAll } from '@jest/globals'
import { StickerPricingCalculator } from '../pricing-calculator'

describe('Sticker Pricing Calculator', () => {
  let calculator: StickerPricingCalculator

  beforeAll(() => {
    calculator = new StickerPricingCalculator()
  })

  it('should calculate correct pricing for single sticker', () => {
    const result = calculator.calculatePricing(1, 'variant_01JVXFAJY3W3JSBH3HJPEHYRYZ')
    expect(result.unitPrice).toBe(100) // $1.00 in cents
    expect(result.totalPrice).toBe(100)
    expect(result.savings).toBe(0)
  })

  it('should apply bulk discount for 10 stickers', () => {
    const result = calculator.calculatePricing(10, 'variant_01JVXFAJY3W3JSBH3HJPEHYRYZ')
    expect(result.unitPrice).toBe(90) // $0.90 in cents
    expect(result.totalPrice).toBe(900)
    expect(result.savings).toBe(100) // $1.00 savings
  })

  it('should apply maximum discount for 200+ stickers', () => {
    const result = calculator.calculatePricing(250, 'variant_01JVXFAJY3W3JSBH3HJPEHYRYZ')
    expect(result.unitPrice).toBe(50) // $0.50 in cents
    expect(result.totalPrice).toBe(12500)
    expect(result.savings).toBe(12500) // $125.00 savings
  })

  it('should throw error for invalid quantity', () => {
    expect(() => calculator.calculatePricing(0, 'variant_01JVXFAJY3W3JSBH3HJPEHYRYZ')).toThrow()
    expect(() => calculator.calculatePricing(-1, 'variant_01JVXFAJY3W3JSBH3HJPEHYRYZ')).toThrow()
  })

  it('should handle mixed cart with stickers and normal products', () => {
    const cartItems = [
      { variantId: 'variant_01JVXFAJY3W3JSBH3HJPEHYRYZ', quantity: 15 },
      { variantId: 'var_normal_product', quantity: 2 }
    ]
    
    const result = calculator.calculateCartPricing(cartItems)
    expect(result.stickerItems).toHaveLength(1)
    expect(result.stickerItems[0].totalPrice).toBe(1350) // 15 * $0.90
  })

  it('should identify sticker variants correctly', () => {
    expect(calculator.isStickerVariant('variant_01JVXFAJY3W3JSBH3HJPEHYRYZ')).toBe(true)
    expect(calculator.isStickerVariant('var_normal_product')).toBe(false)
  })

  it('should return correct pricing tiers', () => {
    const tiers = calculator.getPricingTiers()
    expect(tiers).toHaveLength(6)
    expect(tiers[0]).toEqual({ minQuantity: 1, maxQuantity: 9, pricePerUnit: 100 })
    expect(tiers[5]).toEqual({ minQuantity: 200, maxQuantity: null, pricePerUnit: 50 })
  })
}) 