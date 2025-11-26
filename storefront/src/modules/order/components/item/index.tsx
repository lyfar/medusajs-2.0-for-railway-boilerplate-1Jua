"use client"

import { HttpTypes } from "@medusajs/types"
import { Text, clx } from "@medusajs/ui"
import { useMemo, useState } from "react"
import type { CSSProperties } from "react"

import LineItemPrice from "@modules/common/components/line-item-price"
import LineItemUnitPrice from "@modules/common/components/line-item-unit-price"
import Thumbnail from "@modules/products/components/thumbnail"
import Lightbox from "@modules/common/components/lightbox"
import { isStickerLineItem } from "@lib/util/sticker-utils"
import { Scaling, Layers, Scissors, Scan, Hash } from "lucide-react"
import Image from "next/image"

type ItemProps = {
  item: HttpTypes.StoreCartLineItem | HttpTypes.StoreOrderLineItem
}

const SpecItem = ({ icon: Icon, label, value }: { icon: any; label: string; value: string | null | number }) => {
  if (!value) return null
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1.5 text-zinc-500">
        <Icon className="w-3.5 h-3.5" />
        <span className="text-[10px] uppercase tracking-wider font-medium">{label}</span>
      </div>
      <span className="text-sm text-zinc-200 font-medium truncate">{value}</span>
    </div>
  )
}

const Item = ({ item }: ItemProps) => {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)
  const rawDesignUrl = (item.metadata?.design_url as string) || null
  
  // Fix malformed Cloudflare R2 URLs
  const normalizeCloudflareUrl = (url: string) => {
    if (url.includes('r2.devpk_')) {
      const filename = url.split('/').pop()
      const baseUrl = 'https://stickers.lyfar.com/'
      return baseUrl + filename
    }
    return url
  }
  
  const designUrl = rawDesignUrl ? normalizeCloudflareUrl(rawDesignUrl) : null
  const stickerDimensions = item.metadata?.dimensions as { width?: number; height?: number; diameter?: number } | undefined
  const stickerShape = typeof item.metadata?.shape === "string" ? (item.metadata.shape as string) : null
  const stickerMaterial = typeof item.metadata?.material === "string" ? (item.metadata.material as string) : null
  const stickerFormat = typeof item.metadata?.format === "string" ? (item.metadata.format as string) : null
  const stickerPeeling = typeof item.metadata?.peeling === "string" ? (item.metadata.peeling as string) : null
  const stickerOrientation = typeof item.metadata?.orientation === "string" ? (item.metadata.orientation as string) : null
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

  const formatToken = (value: string | null) => {
    if (!value) return null
    return value
      .split(/[\s_-]+/)
      .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
      .join(" ")
  }
  
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
  }, [stickerDimensions])

  const stickerPreviewRadius = useMemo(() => {
    if (!stickerShape) return "0.75rem"
    const normalized = stickerShape.toLowerCase()
    if (normalized === "circle") return "999px"
    if (normalized === "diecut") return "0.5rem"
    if (normalized === "square") return "0.25rem"
    return "0.5rem"
  }, [stickerShape])

  const checkerboardStyle: CSSProperties = {
    backgroundColor: "#111827",
    backgroundImage:
      "linear-gradient(45deg, #1f2937 25%, transparent 25%), linear-gradient(-45deg, #1f2937 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #1f2937 75%), linear-gradient(-45deg, transparent 75%, #1f2937 75%)",
    backgroundSize: "12px 12px",
    backgroundPosition: "0 0, 0 6px, 6px -6px, -6px 0",
  }

  const renderThumbnail = () => {
    if (designUrl && isSticker) {
      return (
        <div 
          className="relative cursor-pointer hover:scale-105 transition-transform duration-500 ease-out w-full h-full flex items-center justify-center"
          onClick={() => setIsLightboxOpen(true)}
        >
          <div 
            className="relative shadow-2xl shadow-black/50"
            style={{
              maxWidth: '80%',
              maxHeight: '80%',
              aspectRatio: stickerAspectRatio,
              borderRadius: stickerPreviewRadius,
            }}
          >
            <Image
              src={designUrl}
              alt="Custom sticker design"
              width={250}
              height={250}
              className="w-full h-full object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]"
              style={{ borderRadius: stickerPreviewRadius }}
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none rounded-[inherit]" />
          </div>
        </div>
      )
    }

    return (
      <div className="w-full h-full overflow-hidden">
        <Thumbnail
          thumbnail={item.thumbnail}
          images={item.variant?.product?.images}
          size="square"
          className="w-full h-full object-cover"
        />
      </div>
    )
  }

  return (
    <div 
      className="group relative flex flex-col sm:flex-row gap-6 p-6 bg-zinc-900/50 border border-zinc-800 rounded-2xl mb-4 overflow-hidden" 
      data-testid="product-row"
    >
      {/* Background Glow */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-64 h-64 bg-indigo-500/5 blur-[100px] pointer-events-none" />
      
      {/* Visual Section */}
      <div
        className="relative shrink-0 w-full sm:w-56 aspect-square rounded-xl overflow-hidden border border-zinc-800/50 flex items-center justify-center p-4"
        style={isSticker && designUrl ? { ...checkerboardStyle, isolation: "isolate" } : undefined}
      >
        {renderThumbnail()}
        
        {/* Hover overlay with zoom hint */}
        {isSticker && designUrl && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" onClick={() => setIsLightboxOpen(true)}>
            <div className="bg-black/50 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5">
              <Scan className="w-3.5 h-3.5" />
              Zoom
            </div>
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="flex-1 flex flex-col min-w-0 z-10">
        <div className="flex justify-between items-start gap-4">
          <div>
            <h3 className="text-xl font-medium text-white tracking-tight mb-1">
              {item.title}
            </h3>
            {!isSticker && (
              <p className="text-sm text-zinc-500">{item.variant?.title}</p>
            )}
            <div className="flex items-center gap-2 text-sm text-zinc-400 mt-2">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                Processed
              </span>
            </div>
          </div>
          
          <div className="text-right flex flex-col items-end">
            <div className="text-xl font-semibold text-white tracking-tight">
              <LineItemPrice item={item} style="tight" />
            </div>
            <div className="text-xs text-zinc-500 mt-1">
              <LineItemUnitPrice item={item} style="tight" /> / unit
            </div>
          </div>
        </div>

        {/* Tech Specs Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 my-6 py-5 border-y border-zinc-800/50 relative">
          <SpecItem icon={Hash} label="Quantity" value={`${item.quantity} units`} />
          <SpecItem icon={Scaling} label="Size" value={formatSizeDisplay()} />
          <SpecItem icon={Layers} label="Material" value={formatToken(stickerMaterial)} />
          <SpecItem icon={Scissors} label="Cut" value={formatToken(stickerFormat)} />
          <SpecItem icon={Scan} label="Finish" value={formatToken(stickerPeeling)} />
        </div>
        
        {/* Order Item Footer - could add status tracking here later */}
        <div className="mt-auto flex items-center justify-between text-xs text-zinc-500">
           <span>Product ID: {item.variant?.sku || item.variant?.id || 'N/A'}</span>
        </div>
      </div>

      {designUrl && (
        <Lightbox
          isOpen={isLightboxOpen}
          onClose={() => setIsLightboxOpen(false)}
          src={designUrl}
          alt="Custom sticker design"
        />
      )}
    </div>
  )
}

export default Item
