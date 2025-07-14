import React from "react"
import type { OrderDetailsWidgetProps } from "@medusajs/admin"
import { Container, Heading, Text } from "@medusajs/ui"

const OrderStickerDesigns = ({ order }: OrderDetailsWidgetProps) => {
  // Find items with sticker designs
  const itemsWithDesigns = order.items?.filter(
    (item) => item.metadata?.design_url || item.metadata?.file_key
  ) || []

  // Check if there's a custom user image in order metadata
  const hasUserImage = order.metadata?.user_image_url || order.metadata?.user_image_key

  return (
    <Container className="divide-y p-0">
      <div className="px-6 py-4">
        <Heading level="h2">Custom Images</Heading>
      </div>
      {itemsWithDesigns.length === 0 && !hasUserImage ? (
        <div className="px-6 py-4">
          <Text>No custom images or sticker designs found for this order.</Text>
        </div>
      ) : (
        <>
          {/* Display user image if available */}
          {hasUserImage && (
            <div className="px-6 py-4">
              <div className="flex items-start gap-x-4">
                <div className="flex-shrink-0">
                  <img
                    src={order.metadata.user_image_url || 
                      `https://pub-4ea6ad9a9dc2413d9be2b77febd7ec0e.r2.dev/${order.metadata.user_image_key}`}
                    alt="User custom image"
                    className="h-24 w-24 rounded-lg object-cover"
                  />
                </div>
                <div className="flex-1">
                  <Text size="base" weight="plus" className="text-ui-fg-base">
                    Customer Custom Image
                  </Text>
                  <a
                    href={order.metadata.user_image_url || 
                      `https://pub-4ea6ad9a9dc2413d9be2b77febd7ec0e.r2.dev/${order.metadata.user_image_key}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline mt-2 inline-block"
                  >
                    Download Full Size Image →
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Display sticker designs */}
          {itemsWithDesigns.map((item) => {
            const designUrl = item.metadata.design_url || 
              `https://pub-4ea6ad9a9dc2413d9be2b77febd7ec0e.r2.dev/${item.metadata.file_key}`
            
            return (
              <div key={item.id} className="px-6 py-4">
                <div className="flex items-start gap-x-4">
                  <div className="flex-shrink-0">
                    <img
                      src={designUrl}
                      alt="Sticker design"
                      className="h-24 w-24 rounded-lg object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <Text size="base" weight="plus" className="text-ui-fg-base">
                      {item.title}
                    </Text>
                    <Text size="small" className="text-ui-fg-subtle">
                      Quantity: {item.quantity}
                    </Text>
                    <a
                      href={designUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline mt-2 inline-block"
                    >
                      Download Full Size Design →
                    </a>
                  </div>
                </div>
              </div>
            )
          })}
        </>
      )}
    </Container>
  )
}

export const config = {
  zone: "order.details.after",
}

export default OrderStickerDesigns 