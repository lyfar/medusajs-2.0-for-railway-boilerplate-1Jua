import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { addToCartWorkflow } from "@medusajs/medusa/core-flows"
import { StickerPricingCalculator, StickerShape, StickerDimensions } from "../../../../../../modules/sticker-pricing/pricing-calculator"

// Custom endpoint without automatic validation
export const POST = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  const cartId = req.params.id
  
  try {
    console.log('=== Dynamic Sticker Pricing API ===')
    
    // Parse request body manually (no automatic validation)
    const body = req.body as {
      variantId?: string
      quantity?: number
      shape?: StickerShape
      dimensions?: StickerDimensions
    }
    
    console.log('Request body:', body)
    
    if (!body) {
      return res.status(400).json({
        error: "MISSING_BODY",
        message: "Request body is required"
      })
    }

    const { variantId, quantity, shape, dimensions } = body

    // Validate required fields manually
    if (!variantId) {
      return res.status(400).json({
        error: "MISSING_VARIANT_ID",
        message: "variantId is required"
      })
    }

    if (!quantity || typeof quantity !== 'number') {
      return res.status(400).json({
        error: "INVALID_QUANTITY",
        message: "quantity must be a number"
      })
    }

    console.log('Parsed request:', {
      cartId,
      variantId,
      quantity,
      shape: shape || 'rectangle',
      dimensions: dimensions || { width: 10, height: 6 }
    })

    // Use provided shape and dimensions, with defaults
    const finalShape: StickerShape = shape || 'rectangle'
    const finalDimensions: StickerDimensions = dimensions || { width: 10, height: 6 }

    console.log('=== PRICING CALCULATION DEBUG ===')
    console.log('Final shape:', finalShape)
    console.log('Final dimensions:', finalDimensions)

    // Use the new shape-based pricing calculator directly
    console.log('Calculating dynamic shape-based pricing...')
    const calculator = new StickerPricingCalculator()
    
    const pricing = calculator.calculateShapePricing(
      quantity,
      finalShape,
      finalDimensions,
      variantId
    )

    console.log('=== DETAILED PRICING BREAKDOWN ===')
    console.log('Quantity:', quantity)
    console.log('Shape:', pricing.shape)
    console.log('Dimensions:', pricing.dimensions)
    console.log('Area:', pricing.area)
    console.log('Applied params:', pricing.appliedParams)
    console.log('Base price:', pricing.basePrice)
    console.log('Scaling factor:', pricing.scalingFactor)
    console.log('Unit price:', pricing.unitPrice)
    console.log('Total price:', pricing.totalPrice)
    console.log('=== END PRICING BREAKDOWN ===')

    // Verify the calculation manually
    const expectedBasePrice = pricing.appliedParams.F_S + (pricing.appliedParams.k_S * pricing.area)
    const expectedScalingFactor = Math.pow(quantity / 500, pricing.appliedParams.delta)
    const expectedTotalPrice = expectedBasePrice * expectedScalingFactor
    
    console.log('=== MANUAL VERIFICATION ===')
    console.log('Expected base price:', expectedBasePrice, 'vs actual:', pricing.basePrice)
    console.log('Expected scaling factor:', expectedScalingFactor, 'vs actual:', pricing.scalingFactor)
    console.log('Expected total price:', expectedTotalPrice, 'vs actual:', pricing.totalPrice)
    
    if (Math.abs(expectedTotalPrice - pricing.totalPrice) > 0.01) {
      console.error('⚠️ PRICING MISMATCH DETECTED!')
      console.error('Manual calculation:', expectedTotalPrice)
      console.error('Calculator result:', pricing.totalPrice)
    } else {
      console.log('✅ Pricing calculation verified correct')
    }

    // Generate metadata with shape and pricing information
    const itemMetadata = {
      custom_sticker_pricing: true,
      dynamic_shape_pricing: true,
      shape: finalShape,
      dimensions: finalDimensions,
      base_price: pricing.basePrice,
      scaling_factor: pricing.scalingFactor,
      area: pricing.area,
      applied_params: pricing.appliedParams,
    }

    // Use Medusa's internal addToCartWorkflow with custom unit_price
    console.log('Adding to cart with dynamic pricing:', {
      cart_id: cartId,
      variant_id: variantId,
      quantity,
      unit_price: pricing.unitPrice
    })

    // Double-check the unit price calculation to ensure precision
    // The total price from the calculator is authoritative - we adjust unit price if needed
    const preciseUnitPrice = pricing.totalPrice / quantity
    const roundedUnitPrice = Math.round(preciseUnitPrice * 100) / 100
    
    console.log('=== UNIT PRICE PRECISION CHECK ===')
    console.log('Precise unit price:', preciseUnitPrice)
    console.log('Rounded unit price:', roundedUnitPrice)
    console.log('Calculator unit price:', pricing.unitPrice)
    
    // Check if there's a significant difference in unit price calculation
    if (Math.abs(pricing.unitPrice - preciseUnitPrice) > 0.001) {
      console.log('⚠️ Unit price precision issue detected')
      console.log('Using precise unit price:', preciseUnitPrice)
      pricing.unitPrice = preciseUnitPrice
    }

    // Validate that the total price is reasonable
    if (pricing.totalPrice <= 0 || pricing.unitPrice <= 0) {
      throw new Error(`Invalid pricing calculated: unit=${pricing.unitPrice}, total=${pricing.totalPrice}`)
    }

    // Final verification: check what Medusa will actually charge
    const medusaTotal = Math.round((pricing.unitPrice * quantity) * 100) / 100
    console.log('=== MEDUSA PRICING VERIFICATION ===')
    console.log('Our calculated total:', pricing.totalPrice)
    console.log('Medusa will charge (unit * qty):', medusaTotal)
    console.log('Difference:', Math.abs(medusaTotal - pricing.totalPrice))
    
    // Only warn about large discrepancies, don't "fix" them incorrectly
    if (Math.abs(medusaTotal - pricing.totalPrice) > 0.50) {
      console.error('⚠️ LARGE PRICING DISCREPANCY DETECTED!')
      console.error('This may cause significant pricing issues in the cart')
      throw new Error(`Pricing discrepancy too large: calculated=${pricing.totalPrice}, medusa=${medusaTotal}`)
    } else if (Math.abs(medusaTotal - pricing.totalPrice) > 0.01) {
      console.log('ℹ️ Small rounding difference detected (acceptable)')
    } else {
      console.log('✅ Pricing calculation verified correct')
    }

    const workflowResult = await addToCartWorkflow(req.scope).run({
      input: {
        cart_id: cartId,
        items: [{
          variant_id: variantId,
          quantity,
          unit_price: pricing.unitPrice,
          metadata: itemMetadata
        }]
      }
    })

    console.log('Cart updated successfully with dynamic pricing')

    if (!workflowResult) {
      throw new Error('Workflow returned no result')
    }

    const cart = workflowResult.result || workflowResult
    
    if (!cart) {
      throw new Error(`Failed to add item to cart`)
    }

    res.status(200).json({ 
      cart,
      pricing: {
        unitPrice: pricing.unitPrice,
        totalPrice: pricing.totalPrice,
        shape: finalShape,
        dimensions: finalDimensions,
        area: pricing.area
      }
    })
    
  } catch (error) {
    console.error('=== ERROR in Dynamic Sticker Pricing ===')
    console.error('Error:', error.message)
    console.error('Stack:', error.stack)
    
    res.status(500).json({ 
      error: 'Failed to add sticker with dynamic pricing',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    })
  }
} 