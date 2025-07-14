import {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { StickerPricingCalculator, StickerShape, StickerDimensions } from "../../../../modules/sticker-pricing/pricing-calculator"
import { validateStickerQuantity } from "../../../../modules/sticker-pricing/validation"

type PostCalculateShapePricingRequest = {
  variantId?: string
  quantity: number
  shape: StickerShape
  dimensions?: StickerDimensions
}

export const POST = async (
  req: MedusaRequest<PostCalculateShapePricingRequest>,
  res: MedusaResponse
) => {
  try {
    // Use req.body instead of req.validatedBody for now
    const body = req.body || req.validatedBody
    
    if (!body) {
      return res.status(400).json({
        error: "MISSING_BODY",
        message: "Request body is required"
      })
    }

    const { variantId, quantity, shape, dimensions } = body

    // Validate required fields
    if (typeof quantity !== 'number') {
      return res.status(400).json({
        error: "INVALID_QUANTITY",
        message: "Quantity must be a number"
      })
    }

    if (!shape) {
      return res.status(400).json({
        error: "MISSING_SHAPE",
        message: "Shape is required"
      })
    }

    // Validate quantity against MOQ and other business rules
    const validation = validateStickerQuantity(quantity)
    if (!validation.isValid) {
      return res.status(400).json({
        error: "INVALID_QUANTITY",
        message: validation.error
      })
    }

    // Validate shape
    const validShapes: StickerShape[] = ['rectangle', 'square', 'circle', 'diecut']
    if (!validShapes.includes(shape)) {
      return res.status(400).json({
        error: "INVALID_SHAPE",
        message: `Shape must be one of: ${validShapes.join(', ')}`
      })
    }

    const calculator = new StickerPricingCalculator()
    
    const result = calculator.calculateShapePricing(
      quantity,
      shape,
      dimensions,
      variantId
    )

    res.json({
      pricing: result
    })
  } catch (error) {
    console.error("Shape pricing calculation error:", error)
    
    // Handle pricing calculator errors
    if (error instanceof Error) {
      if (error.message.includes("Minimum order quantity")) {
        return res.status(400).json({
          error: "MOQ_NOT_MET",
          message: error.message
        })
      }
      
      if (error.message.includes("Unsupported shape")) {
        return res.status(400).json({
          error: "UNSUPPORTED_SHAPE",
          message: error.message
        })
      }

      if (error.message.includes("Invalid quantity")) {
        return res.status(400).json({
          error: "INVALID_QUANTITY",
          message: error.message
        })
      }
    }

    // Return generic error for unexpected issues
    return res.status(500).json({
      error: "CALCULATION_ERROR",
      message: "Failed to calculate pricing"
    })
  }
}

export const GET = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  try {
    const calculator = new StickerPricingCalculator()
    
    // Return available shapes with their pricing parameters and default dimensions
    const shapePricingParams = calculator.getAllShapePricingParams()
    const shapes = Object.keys(shapePricingParams).map(shape => ({
      shape: shape as StickerShape,
      pricingParams: calculator.getShapePricingParams(shape as StickerShape),
      defaultDimensions: calculator.getDefaultDimensions(shape as StickerShape)
    }))

    res.json({
      shapes,
      moq: calculator.getMOQ()
    })
  } catch (error) {
    console.error("Shape info retrieval error:", error)
    return res.status(500).json({
      error: "RETRIEVAL_ERROR",
      message: "Failed to retrieve shape information"
    })
  }
} 