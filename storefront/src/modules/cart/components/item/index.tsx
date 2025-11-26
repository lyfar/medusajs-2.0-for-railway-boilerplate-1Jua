"use client"

import { Text, clx } from "@medusajs/ui"
import { updateLineItem } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import DeleteButton from "@modules/common/components/delete-button"
import LineItemPrice from "@modules/common/components/line-item-price"
import LineItemUnitPrice from "@modules/common/components/line-item-unit-price"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Spinner from "@modules/common/icons/spinner"
import Thumbnail from "@modules/products/components/thumbnail"
import { useMemo, useState } from "react"
import type { CSSProperties } from "react"
import { isStickerLineItem } from "@lib/util/sticker-utils"
import Lightbox from "@modules/common/components/lightbox"
import { Minus, Plus, Scaling, Layers, Scissors, Scan, AlertCircle, Hash } from "lucide-react"
import Image from "next/image"

type ItemProps = {
  item: HttpTypes.StoreCartLineItem
  type?: "full" | "preview"
  currencyCode: string
  isLast?: boolean
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

const Item = ({ item, type = "full", currencyCode, isLast = false }: ItemProps) => {
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)

  const isSticker = isStickerLineItem(item)
  
  const changeQuantity = async (quantity: number) => {
    if (quantity < 1) return
    setError(null)
    setUpdating(true)

    await updateLineItem({
      lineId: item.id,
      quantity,
    })
      .catch((err) => {
        setError(err.message)
      })
      .finally(() => {
        setUpdating(false)
      })
  }

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
  
  const formatSizeDisplay = () => {
    const dimensions = stickerDimensions
    if (!dimensions) return null
    
    if (dimensions.diameter) {
      return `${dimensions.diameter} cm`
    } else if (dimensions.width && dimensions.height) {
      return `${dimensions.width} x ${dimensions.height} cm`
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

  const renderThumbnail = (isSmall = false) => {
    if (designUrl && isSticker) {
      return (
        <div 
          className={clx(
            "relative group-hover:scale-105 transition-transform duration-500 ease-out cursor-pointer",
            !isSmall && "w-full h-full flex items-center justify-center"
          )}
          onClick={() => setIsLightboxOpen(true)}
        >
          <div 
            className="relative shadow-2xl shadow-black/50"
            style={{
              width: isSmall ? '100%' : undefined,
              maxWidth: isSmall ? undefined : '80%',
              maxHeight: isSmall ? undefined : '80%',
              aspectRatio: stickerAspectRatio,
              borderRadius: stickerPreviewRadius,
            }}
          >
            <Image
              src={designUrl}
              alt="Custom sticker design"
              width={300}
              height={300}
              className="w-full h-full object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]"
              style={{ borderRadius: stickerPreviewRadius }}
            />
            {/* Shine effect */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none rounded-[inherit]" />
          </div>
        </div>
      )
    }

    return (
      <LocalizedClientLink href={`/products/${item.product_handle}`} className="w-full h-full block">
        <div className="w-full h-full overflow-hidden">
          <Thumbnail
            thumbnail={item.thumbnail}
            images={item.variant?.product?.images}
            size="square"
            className="w-full h-full object-cover"
          />
        </div>
      </LocalizedClientLink>
    )
  }

  // Mini Cart Item (Preview Mode)
  if (type === "preview") {
    return (
      <div className="group relative flex gap-4 p-3 hover:bg-white/5 transition-colors rounded-xl -mx-3">
        <div
          className="w-20 h-20 shrink-0 rounded-lg border border-zinc-800 overflow-hidden flex items-center justify-center"
          style={isSticker && designUrl ? checkerboardStyle : undefined}
        >
          {renderThumbnail(true)}
        </div>
        
        <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
          <div className="flex justify-between items-start gap-2">
            <Text className="text-zinc-100 font-medium truncate text-sm">
              {item.product_title}
            </Text>
            <LineItemPrice item={item} style="tight" currencyCode={currencyCode} />
          </div>

          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <span className="bg-zinc-800/50 px-1.5 py-0.5 rounded text-zinc-400 font-medium">
              {item.quantity} units
            </span>
            {formatSizeDisplay() && (
              <span>{formatSizeDisplay()}</span>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Full Cart Item (Focus Card)
  return (
    <div 
      className="group relative flex flex-col sm:flex-row gap-6 p-6 bg-zinc-900/50 border border-zinc-800 rounded-2xl hover:border-zinc-700/80 transition-all duration-500 hover:bg-zinc-900/80 mb-4 overflow-hidden" 
      data-testid="product-row"
    >
      {/* Background Glow */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-64 h-64 bg-indigo-500/5 blur-[100px] pointer-events-none" />
      
      {/* Visual Section */}
      <div
        className="relative shrink-0 w-full sm:w-64 aspect-square rounded-xl overflow-hidden border border-zinc-800/50 group-hover:border-zinc-700 transition-colors flex items-center justify-center p-6"
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
              {item.product_title}
            </h3>
            {!isSticker && (
              <p className="text-sm text-zinc-500">{item.variant?.title}</p>
            )}
            <div className="flex items-center gap-2 text-sm text-zinc-400 mt-2">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                Ready to print
              </span>
            </div>
          </div>
          
          <div className="text-right flex flex-col items-end">
            <div className="text-xl font-semibold text-white tracking-tight">
              <LineItemPrice item={item} style="tight" currencyCode={currencyCode} />
            </div>
            <div className="text-xs text-zinc-500 mt-1">
              <LineItemUnitPrice item={item} style="tight" /> / unit
            </div>
          </div>
        </div>

        {/* Tech Specs Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 my-6 py-5 border-y border-zinc-800/50 relative">
          {/* Sticker Quantity displayed as a spec item if it's a sticker */}
          {isSticker && (
            <SpecItem icon={Hash} label="Quantity" value={`${item.quantity} units`} />
          )}
          <SpecItem icon={Scaling} label="Size" value={formatSizeDisplay()} />
          <SpecItem icon={Layers} label="Material" value={formatToken(stickerMaterial)} />
          <SpecItem icon={Scissors} label="Cut" value={formatToken(stickerFormat)} />
          <SpecItem icon={Scan} label="Finish" value={formatToken(stickerPeeling)} />
        </div>

        {/* Controls */}
        <div className="mt-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Quantity Stepper - Only show for non-stickers */}
            {!isSticker ? (
              <>
                <div className="flex items-center bg-zinc-950 border border-zinc-800 rounded-lg p-1">
                  <button 
                    onClick={() => changeQuantity(item.quantity - 1)}
                    disabled={updating || item.quantity <= 1}
                    className="w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 rounded transition-colors disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-zinc-400"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <div className="w-10 text-center font-medium text-white tabular-nums">
                    {updating ? <Spinner className="w-4 h-4 mx-auto animate-spin" /> : item.quantity}
                  </div>
                  <button 
                    onClick={() => changeQuantity(item.quantity + 1)}
                    disabled={updating}
                    className="w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 rounded transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <span className="text-xs text-zinc-500 font-medium uppercase tracking-wider">
                  Quantity
                </span>
              </>
            ) : (
              /* Just a spacer or different label for stickers if needed, but specs grid covers it */
              <div className="text-sm text-zinc-500">
                {/* Placeholder if we want something here, otherwise empty is fine as per request */}
              </div>
            )}
          </div>

          <DeleteButton id={item.id} className="text-zinc-500 hover:text-red-400 transition-colors flex items-center gap-2 text-sm group/delete">
            <span className="group-hover/delete:underline decoration-red-400/50">Remove Item</span>
          </DeleteButton>
        </div>
      </div>

      {error && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-2 rounded-full flex items-center gap-2 text-sm backdrop-blur-md">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* Lightbox */}
      {designUrl && (
        <Lightbox
          src={designUrl}
          alt="Full sticker design"
          isOpen={isLightboxOpen}
          onClose={() => setIsLightboxOpen(false)}
        />
      )}
    </div>
  )
}

export default Item
