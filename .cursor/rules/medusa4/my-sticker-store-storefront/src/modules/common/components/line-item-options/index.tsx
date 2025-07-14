import { HttpTypes } from "@medusajs/types"
import { Text } from "@medusajs/ui"
import { isStickerVariant } from "@lib/util/sticker-utils"

type LineItemOptionsProps = {
  variant: HttpTypes.StoreProductVariant | undefined
  "data-testid"?: string
  "data-value"?: HttpTypes.StoreProductVariant
  metadata?: Record<string, any>
}

const LineItemOptions = ({
  variant,
  metadata,
  "data-testid": dataTestid,
  "data-value": dataValue,
}: LineItemOptionsProps) => {
  // Check if this is a sticker with dynamic shape pricing
  const isSticker = variant?.id ? isStickerVariant(variant.id) : false
  const hasStickerMetadata = metadata?.dynamic_shape_pricing && metadata?.shape && metadata?.dimensions

  if (isSticker && hasStickerMetadata) {
    const { shape, dimensions, area } = metadata
    
    // Format dimensions based on shape
    let dimensionText = ""
    if (shape === 'circle') {
      dimensionText = `${dimensions.diameter}cm diameter`
    } else {
      dimensionText = `${dimensions.width}×${dimensions.height}cm`
    }
    
    // Capitalize shape name
    const shapeText = shape.charAt(0).toUpperCase() + shape.slice(1)
    
    return (
      <Text
        data-testid={dataTestid}
        data-value={dataValue}
        className="inline-block txt-medium text-ui-fg-subtle w-full overflow-hidden text-ellipsis"
      >
        {shapeText} • {dimensionText} • {area?.toFixed(1)} cm²
      </Text>
    )
  }

  return (
    <Text
      data-testid={dataTestid}
      data-value={dataValue}
      className="inline-block txt-medium text-ui-fg-subtle w-full overflow-hidden text-ellipsis"
    >
      Variant: {variant?.title}
    </Text>
  )
}

export default LineItemOptions
