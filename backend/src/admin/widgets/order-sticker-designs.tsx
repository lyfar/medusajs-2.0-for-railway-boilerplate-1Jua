import { defineWidgetConfig } from "@medusajs/admin-sdk"

// Professional sticker design widget with Medusa admin styling
const OrderStickerDesigns = ({ data }) => {
  // Check if order has any sticker items
  const stickerItems = data.items?.filter(item => {
    const hasSticker = item.title?.toLowerCase().includes('sticker')
    const hasMetadata = item.metadata?.design_url || item.metadata?.file_key || item.metadata?.shape
    return hasSticker || hasMetadata
  }) || []
  
  // Don't render if no sticker items
  if (stickerItems.length === 0) {
    return null
  }

  return (
    <div className="bg-ui-bg-base border border-ui-border-base rounded-lg p-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">🏷️</span>
        <h3 className="text-ui-fg-base text-base font-medium">
          Custom Sticker Details
        </h3>
        <div className="ml-auto">
          <span className="bg-ui-tag-green-bg text-ui-tag-green-text border border-ui-tag-green-border px-2 py-1 rounded text-xs font-medium">
            {stickerItems.length} item{stickerItems.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
      
      {/* Sticker Items */}
      <div className="space-y-3">
        {stickerItems.map((item, index) => {
          const metadata = item.metadata || {}
          const designUrl = metadata.design_url || 
            (metadata.file_key ? `https://pub-4ea6ad9a9dc2413d9be2b77febd7ec0e.r2.dev/${metadata.file_key}` : null)
          
          return (
            <div 
              key={item.id || index}
              className="bg-ui-bg-subtle border border-ui-border-base rounded-md p-3"
            >
              {/* Design Image */}
              {designUrl && (
                <div className="mb-4 flex flex-col items-center">
                  <div className="relative group">
                    <img
                      src={designUrl}
                      alt="Custom sticker design"
                      className="w-32 h-32 object-cover rounded-lg border border-ui-border-base shadow-sm"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.style.display = 'none'
                      }}
                    />
                    {/* Download Button Overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center">
                      <a
                        href={designUrl}
                        download={`sticker-design-${item.id || index}.png`}
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-ui-bg-base hover:bg-ui-bg-base-hover border border-ui-border-base rounded-md px-3 py-2 text-xs font-medium text-ui-fg-base shadow-md flex items-center gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="7,10 12,15 17,10" />
                          <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                        Download
                      </a>
                    </div>
                  </div>
                  
                  {/* View Full Size Link */}
                  <a
                    href={designUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 text-xs text-ui-fg-interactive hover:text-ui-fg-interactive-hover flex items-center gap-1"
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15,3 21,3 21,9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                    View full size
                  </a>
                </div>
              )}
              
              {/* Product Title */}
              <div className="text-ui-fg-base text-sm font-medium mb-3">
                {item.title}
              </div>
              
              {/* Specifications Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-ui-fg-muted block">Quantity</span>
                  <span className="text-ui-fg-base font-medium">{item.quantity.toLocaleString()}</span>
                </div>
                
                <div>
                  <span className="text-ui-fg-muted block">Unit Price</span>
                  <span className="text-ui-fg-base font-medium">${((item.unit_price || 0) / 100).toFixed(2)}</span>
                </div>
                
                {metadata.shape && (
                  <div>
                    <span className="text-ui-fg-muted block">Shape</span>
                    <span className="text-ui-fg-base font-medium capitalize">{metadata.shape}</span>
                  </div>
                )}
                
                {(metadata.dimensions?.width || metadata.dimensions?.height || metadata.dimensions?.diameter) && (
                  <div>
                    <span className="text-ui-fg-muted block">Size</span>
                    <span className="text-ui-fg-base font-medium">
                      {metadata.dimensions.diameter ? 
                        `⌀ ${metadata.dimensions.diameter}"` :
                        `${metadata.dimensions.width || '?'}" × ${metadata.dimensions.height || '?'}"`
                      }
                    </span>
                  </div>
                )}
              </div>
              
              {/* Total Price Highlight */}
              <div className="mt-3 pt-3 border-t border-ui-border-base">
                <div className="flex justify-between items-center">
                  <span className="text-ui-fg-muted text-xs">Total</span>
                  <span className="text-ui-fg-base font-semibold">${((item.total || 0) / 100).toFixed(2)}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
      
      {/* Info Note */}
      <div className="mt-4 p-3 bg-ui-tag-blue-bg border border-ui-tag-blue-border rounded-md">
        <div className="flex items-start gap-2">
          <span className="text-ui-tag-blue-text text-xs">💡</span>
          <div className="text-ui-tag-blue-text text-xs">
            <span className="font-medium">Custom Design:</span> These stickers include personalized designs and specifications. 
            Full resolution files are stored for production.
          </div>
        </div>
      </div>
    </div>
  )
}

// Export with configuration
export const config = defineWidgetConfig({
  zone: "order.details.side.before",
})

export default OrderStickerDesigns 