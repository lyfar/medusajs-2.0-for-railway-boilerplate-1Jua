import { defineWidgetConfig } from "@medusajs/admin-sdk"
import type { AdminOrder } from "@medusajs/types"

interface StickerMetadata {
  dynamic_shape_pricing?: boolean
  shape?: string
  dimensions?: {
    width?: number
    height?: number
    diameter?: number
  }
  area?: number
}

const STICKER_VARIANT_ID = "variant_01JVXFAJY3W3JSBH3HJPEHYRYZ"

const formatStickerDetails = (metadata: Record<string, unknown>) => {
  const stickerMeta = metadata as StickerMetadata
  
  if (!stickerMeta?.shape || !stickerMeta?.dimensions) {
    return "Custom Configuration"
  }

  const { shape, dimensions, area } = stickerMeta
  
  // Format dimensions based on shape
  let dimensionText = ""
  if (shape === 'circle') {
    dimensionText = `${dimensions.diameter}cm diameter`
  } else {
    dimensionText = `${dimensions.width}×${dimensions.height}cm`
  }
  
  // Capitalize shape name
  const shapeText = shape.charAt(0).toUpperCase() + shape.slice(1)
  
  return `${shapeText} • ${dimensionText} • ${area?.toFixed(1)} cm²`
}

const StickerInfoWidget = ({ data }: { data: AdminOrder }) => {
  // Find all sticker items in the order
  const stickerItems = data.items?.filter(item => 
    item.variant_id === STICKER_VARIANT_ID && 
    item.metadata?.dynamic_shape_pricing
  ) || []

  if (stickerItems.length === 0) {
    return null
  }

  return (
    <div className="bg-ui-bg-base border border-ui-border-base rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">🎯</span>
        <h3 className="text-ui-fg-base text-base font-medium">
          Custom Sticker Details
        </h3>
      </div>
      
      <div className="space-y-3">
        {stickerItems.map((item) => (
          <div 
            key={item.id}
            className="bg-ui-bg-subtle border border-ui-border-base rounded-md p-3"
          >
            <div className="text-ui-fg-base text-sm font-medium mb-2">
              {item.product_title}
            </div>
            
            <div className="text-ui-fg-subtle text-xs mb-2">
              {item.metadata ? formatStickerDetails(item.metadata) : "Custom Configuration"}
            </div>
            
            <div className="text-ui-fg-muted text-xs">
              <span className="font-medium">Quantity:</span> {item.quantity.toLocaleString()} units
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-3 p-3 bg-ui-tag-orange-bg border border-ui-tag-orange-border rounded-md">
        <div className="flex items-start gap-2">
          <span className="text-ui-tag-orange-text text-xs">💡</span>
          <div className="text-ui-tag-orange-text text-xs">
            <span className="font-medium">Note:</span> These stickers use dynamic shape-based pricing with custom dimensions.
            The "Default option value" text in the order summary doesn't reflect these specifications.
          </div>
        </div>
      </div>
    </div>
  )
}

// Widget configuration - display on the right side above Customer section
export const config = defineWidgetConfig({
  zone: "order.details.side.before",
})

export default StickerInfoWidget 