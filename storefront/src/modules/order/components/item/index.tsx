"use client"

import { HttpTypes } from "@medusajs/types"
import { Table, Text } from "@medusajs/ui"
import { useState } from "react"

import LineItemOptions from "@modules/common/components/line-item-options"
import LineItemPrice from "@modules/common/components/line-item-price"
import LineItemUnitPrice from "@modules/common/components/line-item-unit-price"
import Thumbnail from "@modules/products/components/thumbnail"
import Lightbox from "@modules/common/components/lightbox"

type ItemProps = {
  item: HttpTypes.StoreCartLineItem | HttpTypes.StoreOrderLineItem
}

const Item = ({ item }: ItemProps) => {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)
  const rawDesignUrl = (item.metadata?.design_url as string) || null
  
  // Fix malformed Cloudflare R2 URLs
  const normalizeCloudflareUrl = (url: string) => {
    // Check if URL has the malformed pattern: r2.devpk_
    if (url.includes('r2.devpk_')) {
      // Extract the filename from the end of the URL
      const filename = url.split('/').pop()
      // Replace the malformed part with correct structure
      const baseUrl = url.split('r2.devpk_')[0] + 'r2.dev/'
      return baseUrl + filename
    }
    return url
  }
  
  const designUrl = rawDesignUrl ? normalizeCloudflareUrl(rawDesignUrl) : null

  return (
    <>
      <Table.Row className="w-full" data-testid="product-row">
        <Table.Cell className="!pl-0 p-4 w-24">
          <div className="flex w-16">
            {designUrl ? (
              <div className="relative group">
                <div className="w-16 h-16 rounded-md overflow-hidden bg-card cursor-pointer" onClick={() => setIsLightboxOpen(true)}>
                  <img
                    src={designUrl}
                    alt="Custom sticker design"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <svg className="w-4 h-4 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <Thumbnail thumbnail={item.thumbnail} size="square" />
            )}
          </div>
        </Table.Cell>
  
        <Table.Cell className="text-left">
          <Text
            className="txt-medium-plus text-ui-fg-base"
            data-testid="product-name"
          >
            {item.title}
          </Text>
          {item.variant && (
            <LineItemOptions variant={item.variant} data-testid="product-variant" />
          )}
          {designUrl && (
            <div className="flex items-center gap-x-2 mt-2">
              <span className="px-2 py-1 bg-primary text-primary-foreground text-xs rounded-md border border-primary">
                Custom Design
              </span>
            </div>
          )}
        </Table.Cell>
  
        <Table.Cell className="!pr-0">
          <span className="!pr-0 flex flex-col items-end h-full justify-center">
            <span className="flex gap-x-1 ">
              <Text className="text-ui-fg-muted">
                <span data-testid="product-quantity">{item.quantity}</span>x{" "}
              </Text>
              <LineItemUnitPrice item={item} style="tight" />
            </span>
  
            <LineItemPrice item={item} style="tight" />
          </span>
        </Table.Cell>
      </Table.Row>
      {designUrl && (
        <Lightbox
          isOpen={isLightboxOpen}
          onClose={() => setIsLightboxOpen(false)}
          src={designUrl}
          alt="Custom sticker design"
        />
      )}
    </>
  )
}

export default Item
