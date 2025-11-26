"use client"

import { Button } from "@medusajs/ui"
import { useMemo } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"
import { Calendar, Package, ChevronRight } from "lucide-react"
import Thumbnail from "@modules/products/components/thumbnail"

type OrderCardProps = {
  order: HttpTypes.StoreOrder
}

const OrderCard = ({ order }: OrderCardProps) => {
  const numberOfLines = useMemo(() => {
    return order.items?.reduce((acc, item) => acc + item.quantity, 0) ?? 0
  }, [order])

  const numberOfProducts = order.items?.length ?? 0

  // Helper to fix R2 URLs
  const normalizeCloudflareUrl = (url: string) => {
    if (!url) return null
    if (url.includes('r2.devpk_')) {
      const filename = url.split('/').pop()
      const baseUrl = 'https://stickers.lyfar.com/'
      return baseUrl + filename
    }
    return url
  }

  return (
    <div className="group relative bg-zinc-900/30 hover:bg-zinc-900/50 border border-zinc-800/50 hover:border-zinc-700/50 backdrop-blur-sm rounded-2xl overflow-hidden transition-all duration-300" data-testid="order-card">
      {/* Header */}
      <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/50">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <span className="text-lg font-semibold text-white">Order #{order.display_id}</span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Processing
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs text-zinc-500">
            <span className="flex items-center gap-1.5">
              <Calendar size={14} />
              {new Date(order.created_at).toLocaleDateString(undefined, { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </span>
            <span className="w-1 h-1 rounded-full bg-zinc-800" />
            <span className="flex items-center gap-1.5">
              <Package size={14} />
              {numberOfLines} items
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-4">
          <div className="text-right">
            <p className="text-sm font-medium text-white">
              {convertToLocale({
                amount: order.total,
                currency_code: order.currency_code,
              })}
            </p>
            <p className="text-xs text-zinc-500">Total paid</p>
          </div>
          <LocalizedClientLink href={`/account/orders/details/${order.id}`}>
            <Button variant="secondary" className="bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10 hover:text-white">
              Details
            </Button>
          </LocalizedClientLink>
        </div>
      </div>

      {/* Thumbnails Grid */}
      <div className="p-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
          {order.items?.slice(0, 4).map((item) => {
            const metadata: any = item.metadata || {}
            const rawDesignUrl = metadata.design_url || (metadata.file_key ? `https://stickers.lyfar.com/${metadata.file_key}` : null)
            const designUrl = rawDesignUrl ? normalizeCloudflareUrl(rawDesignUrl) : null

            return (
              <div key={item.id} className="group/item space-y-2">
                <div className="aspect-square rounded-xl bg-zinc-950/50 border border-zinc-800 overflow-hidden flex items-center justify-center relative">
                  {designUrl ? (
                    <img 
                      src={designUrl} 
                      alt={item.title} 
                      className="w-[80%] h-[80%] object-contain drop-shadow-lg transition-transform duration-300 group-hover/item:scale-110" 
                    />
                  ) : (
                    <Thumbnail thumbnail={item.thumbnail} size="full" className="opacity-80" />
                  )}
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs font-medium text-zinc-300 truncate">{item.title}</p>
                  <p className="text-[10px] text-zinc-500">{item.quantity} units</p>
                </div>
              </div>
            )
          })}
          
          {numberOfProducts > 4 && (
            <LocalizedClientLink href={`/account/orders/details/${order.id}`} className="group/more">
              <div className="aspect-square rounded-xl bg-zinc-800/20 border border-zinc-800 border-dashed flex flex-col items-center justify-center gap-2 hover:bg-zinc-800/40 hover:border-zinc-700 transition-all cursor-pointer h-full">
                <span className="text-sm font-medium text-zinc-400 group-hover/more:text-white">+{numberOfProducts - 4}</span>
                <span className="text-xs text-zinc-600 group-hover/more:text-zinc-500">more</span>
              </div>
            </LocalizedClientLink>
          )}
        </div>
      </div>
    </div>
  )
}

export default OrderCard
