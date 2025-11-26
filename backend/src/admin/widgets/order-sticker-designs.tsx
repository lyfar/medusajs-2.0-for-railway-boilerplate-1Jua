import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Table, Button, Text } from "@medusajs/ui"
import { ArrowDownTray, Eye } from "@medusajs/icons"

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

  const formatToken = (value?: string) => {
    if (!value) return null
    return value
      .toString()
      .split(/[\s_-]+/)
      .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
      .join(" ")
  }

  return (
    <Container className="p-0 overflow-hidden">
      <div className="px-8 py-6 border-b border-ui-border-base flex items-center justify-between">
        <Heading level="h1" className="flex items-center gap-2">
          Custom Stickers
          <span className="text-ui-fg-muted font-normal text-sm ml-2">
            ({stickerItems.length} designs)
          </span>
        </Heading>
      </div>

      <Table>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Design & Product</Table.HeaderCell>
            <Table.HeaderCell>Specifications</Table.HeaderCell>
            <Table.HeaderCell>Files</Table.HeaderCell>
            <Table.HeaderCell className="text-right">Quantity</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {stickerItems.map((item, index) => {
            const metadata = item.metadata || {}
            const designUrl = metadata.design_url || 
              (metadata.file_key ? `https://stickers.lyfar.com/${metadata.file_key}` : null)
            
            const material = formatToken(metadata.material)
            const format = formatToken(metadata.format)
            
            const size = metadata.dimensions?.diameter 
              ? `⌀ ${metadata.dimensions.diameter}"` 
              : (metadata.dimensions?.width && metadata.dimensions?.height)
                ? `${metadata.dimensions.width}" × ${metadata.dimensions.height}"`
                : null

            return (
              <Table.Row key={item.id || index}>
                <Table.Cell className="max-w-[300px]">
                  <div className="flex gap-4 items-center py-2">
                    <div
                      className="relative w-16 h-16 rounded-lg overflow-hidden border border-ui-border-base shrink-0 flex items-center justify-center"
                      style={{
                        backgroundColor: "#e5e7eb",
                        backgroundImage:
                          "linear-gradient(45deg, #d1d5db 25%, transparent 25%), linear-gradient(-45deg, #d1d5db 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #d1d5db 75%), linear-gradient(-45deg, transparent 75%, #d1d5db 75%)",
                        backgroundSize: "12px 12px",
                        backgroundPosition: "0 0, 0 6px, 6px -6px, -6px 0",
                      }}
                    >
                      {designUrl ? (
                         <img
                           src={designUrl}
                           alt="Thumbnail"
                           className="w-full h-full object-contain"
                         />
                      ) : (
                        <span className="text-2xl">🏷️</span>
                      )}
                    </div>
                    <div className="flex flex-col gap-1">
                      <Text className="font-medium text-ui-fg-base truncate" title={item.title}>
                        {item.title}
                      </Text>
                      <Text className="text-xs text-ui-fg-muted">
                        {item.variant?.sku || 'Custom SKU'}
                      </Text>
                    </div>
                  </div>
                </Table.Cell>

                <Table.Cell>
                  <div className="flex flex-col gap-1 text-xs">
                    {size && (
                      <div className="flex items-center gap-2">
                        <span className="text-ui-fg-muted w-16">Size:</span>
                        <span className="font-medium text-ui-fg-base">{size}</span>
                      </div>
                    )}
                    {material && (
                      <div className="flex items-center gap-2">
                        <span className="text-ui-fg-muted w-16">Material:</span>
                        <span className="font-medium text-ui-fg-base">{material}</span>
                      </div>
                    )}
                    {format && (
                      <div className="flex items-center gap-2">
                        <span className="text-ui-fg-muted w-16">Cut:</span>
                        <span className="font-medium text-ui-fg-base">{format}</span>
                      </div>
                    )}
                  </div>
                </Table.Cell>

                <Table.Cell>
                  {designUrl && (
                    <div className="flex items-center gap-2">
                      <a href={designUrl} target="_blank" rel="noopener noreferrer">
                        <Button variant="secondary" size="small">
                          <Eye className="text-ui-fg-subtle" />
                        </Button>
                      </a>
                      <a href={designUrl} download={`sticker-${item.id}.png`}>
                        <Button variant="secondary" size="small">
                          <ArrowDownTray className="text-ui-fg-subtle" />
                          Print File
                        </Button>
                      </a>
                    </div>
                  )}
                </Table.Cell>

                <Table.Cell className="text-right">
                  <Text className="font-medium text-ui-fg-base">
                    {item.quantity.toLocaleString()} units
                  </Text>
                </Table.Cell>
              </Table.Row>
            )
          })}
        </Table.Body>
      </Table>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "order.details.before",
})

export default OrderStickerDesigns
