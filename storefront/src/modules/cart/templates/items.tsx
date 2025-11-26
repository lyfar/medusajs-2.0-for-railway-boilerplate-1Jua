import { HttpTypes } from "@medusajs/types"
import { Heading } from "@medusajs/ui"

import Item from "@modules/cart/components/item"
import SkeletonLineItem from "@modules/skeletons/components/skeleton-line-item"

type ItemsTemplateProps = {
  items?: HttpTypes.StoreCartLineItem[]
  cart?: HttpTypes.StoreCart
}

const ItemsTemplate = ({ items, cart }: ItemsTemplateProps) => {
  const currencyCode = cart?.currency_code || "EUR"
  return (
    <div className="w-full">
      <div className="flex items-center justify-between pb-6 border-b border-white/5 mb-6">
        <Heading className="text-2xl font-medium text-white tracking-tight">Cart ({items?.length || 0})</Heading>
      </div>
      
      <div className="flex flex-col gap-4">
        {items && cart
          ? items
              .sort((a, b) => {
                return (a.created_at ?? 0) > (b.created_at ?? 0) ? -1 : 1
              })
              .map((item, index) => (
                <Item 
                  key={item.id}
                  item={item} 
                  currencyCode={currencyCode} 
                  type="full" 
                  isLast={index === items.length - 1}
                />
              ))
          : Array.from(Array(3).keys()).map((i) => (
              <SkeletonLineItem key={i} />
            ))}
      </div>
    </div>
  )
}

export default ItemsTemplate
