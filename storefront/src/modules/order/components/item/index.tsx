"use client"

import { HttpTypes } from "@medusajs/types"
import { Table, Text } from "@medusajs/ui"
import { useMemo, useState } from "react"

import LineItemOptions from "@modules/common/components/line-item-options"
import LineItemPrice from "@modules/common/components/line-item-price"
import LineItemUnitPrice from "@modules/common/components/line-item-unit-price"
import Thumbnail from "@modules/products/components/thumbnail"
import Lightbox from "@modules/common/components/lightbox"
import { isStickerLineItem } from "@lib/util/sticker-utils"

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
  const stickerDimensions = item.metadata?.dimensions as { width?: number; height?: number; diameter?: number } | undefined
  const stickerShape = typeof item.metadata?.shape === "string" ? (item.metadata.shape as string) : null
  const stickerMaterial = typeof item.metadata?.material === "string" ? (item.metadata.material as string) : null
  const orientation = typeof item.metadata?.orientation === "string" ? (item.metadata.orientation as string) : null
  const isSticker = isStickerLineItem(item as any)

  const formatSizeDisplay = () => {
    if (!stickerDimensions) return null
    if (stickerDimensions.diameter) {
      return `${stickerDimensions.diameter} cm`
    }
    if (stickerDimensions.width && stickerDimensions.height) {
      return `${stickerDimensions.width} × ${stickerDimensions.height} cm`
    }
    return null
  }

  const formattedShape = useMemo(() => {
    if (!stickerShape) return null
    return stickerShape
      .split(/[\s_-]+/)
      .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
      .join(" ")
  }, [stickerShape])

  const formattedMaterial = useMemo(() => {
    if (!stickerMaterial) return null
    return stickerMaterial
      .split(/[\s_-]+/)
      .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
      .join(" ")
  }, [stickerMaterial])

  const formattedOrientation = useMemo(() => {
    if (!orientation) return null
    return orientation.charAt(0).toUpperCase() + orientation.slice(1)
  }, [orientation])

  const stickerFacts = useMemo(() => {
    if (!isSticker) return []
    const details: { label: string; value: string }[] = []
    if (formattedShape) {
      details.push({ label: "Shape", value: formattedShape })
    }
    const size = formatSizeDisplay()
    if (size) {
      details.push({ label: "Size", value: size })
    }
    if (formattedMaterial) {
      details.push({ label: "Material", value: formattedMaterial })
    }
    if (formattedOrientation) {
      details.push({ label: "Orientation", value: formattedOrientation })
    }
    details.push({ label: "Quantity", value: item.quantity.toLocaleString() })
    return details
  }, [
    isSticker,
    formattedShape,
    formattedMaterial,
    formattedOrientation,
    item.quantity,
    stickerDimensions?.width,
    stickerDimensions?.height,
    stickerDimensions?.diameter,
  ])
  
  const stickerAspectRatio = useMemo(() => {
    if (!stickerDimensions) return 1
    if (stickerDimensions.diameter) return 1
    const { width, height } = stickerDimensions
    if (!width || !height) return 1
    const ratio = width / height
    if (!Number.isFinite(ratio) || ratio <= 0) {
      return 1
    }
    return Math.min(Math.max(ratio, 0.35), 3.5)
  }, [
    stickerDimensions?.width,
    stickerDimensions?.height,
    stickerDimensions?.diameter,
  ])

  const stickerPreviewRadius = useMemo(() => {
    if (!stickerShape) return "0.75rem"
    const normalized = stickerShape.toLowerCase()
    if (normalized === "circle") return "999px"
    if (normalized === "diecut") return "1rem"
    if (normalized === "square") return "0.65rem"
    return "0.75rem"
  }, [stickerShape])

  return (
    <>
      <Table.Row className="w-full" data-testid="product-row">
        <Table.Cell className="!pl-0 p-4 w-24">
          <div className="flex">
            {designUrl ? (
              <div className="relative group">
                <div
                  className="overflow-hidden bg-card cursor-pointer border border-ui-border-subtle"
                  style={{
                    width: 64,
                    aspectRatio: stickerAspectRatio,
                    borderRadius: stickerPreviewRadius,
                  }}
                  onClick={() => setIsLightboxOpen(true)}
                >
                  <img
                    src={designUrl}
                    alt="Custom sticker design"
                    className="w-full h-full object-contain bg-neutral-950"
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
              <div className="rounded-md overflow-hidden border border-ui-border-subtle bg-ui-bg-subtle">
                <Thumbnail thumbnail={item.thumbnail} size="square" />
              </div>
            )}
          </div>
        </Table.Cell>
  
        <Table.Cell className="text-left align-top">
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
            <div className="flex items-center gap-2 mt-2 text-[11px] uppercase tracking-wide text-ui-fg-muted">
              <span className="rounded-full border border-primary/60 bg-primary/10 px-2 py-0.5 text-primary">
                Custom design
              </span>
            </div>
          )}

          {stickerFacts.length > 0 && (
            <dl className="mt-3 grid gap-1 text-xs text-ui-fg-muted">
              {stickerFacts.map(({ label, value }) => (
                <div key={label} className="flex gap-2">
                  <dt className="font-medium text-ui-fg-subtle">{label}:</dt>
                  <dd className="text-ui-fg-base">{value}</dd>
                </div>
              ))}
            </dl>
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
