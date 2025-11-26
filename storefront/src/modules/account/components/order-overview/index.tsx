"use client"

import { Button } from "@medusajs/ui"
import OrderCard from "../order-card"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { HttpTypes } from "@medusajs/types"
import { PackageSearch } from "lucide-react"

const OrderOverview = ({ orders }: { orders: HttpTypes.StoreOrder[] }) => {
  if (orders?.length) {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800/50">
          <h2 className="text-xl font-medium text-white">Your Orders</h2>
          <span className="text-sm text-zinc-500">{orders.length} total</span>
        </div>
        
        <div className="grid gap-6">
          {orders.map((o) => (
            <OrderCard key={o.id} order={o} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="w-full flex flex-col items-center justify-center py-24 text-center space-y-4 bg-zinc-900/20 border border-zinc-800/50 rounded-2xl backdrop-blur-sm" data-testid="no-orders-container">
      <div className="w-20 h-20 rounded-full bg-zinc-800/50 flex items-center justify-center text-zinc-600">
        <PackageSearch size={32} />
      </div>
      <div className="space-y-1">
        <h2 className="text-lg font-medium text-white">No orders found</h2>
        <p className="text-sm text-zinc-500 max-w-xs mx-auto">
          You haven&apos;t placed any orders yet. Start creating your custom stickers today!
        </p>
      </div>
      <div className="mt-4">
        <LocalizedClientLink href="/store" passHref>
          <Button 
            size="large" 
            className="bg-white text-black hover:bg-zinc-200 font-medium px-8"
            data-testid="continue-shopping-button"
          >
            Start Creating
          </Button>
        </LocalizedClientLink>
      </div>
    </div>
  )
}

export default OrderOverview
