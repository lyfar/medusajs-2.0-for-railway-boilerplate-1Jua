import repeat from "@lib/util/repeat"
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
    <div className="bg-gray-800 dark:bg-black rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
        <Heading className="text-lg-semi text-white">Cart</Heading>
      </div>
      
      {/* Modern List Layout */}
      <div className="flex flex-col divide-y divide-gray-700">
        {items && cart
          ? items
              .sort((a, b) => {
                return (a.created_at ?? 0) > (b.created_at ?? 0) ? -1 : 1
              })
              .map((item, index) => (
                <div key={item.id} className={index === 0 ? "pt-2" : ""}>
                  <Item 
                    item={item} 
                    currencyCode={currencyCode} 
                    type="full" 
                    isLast={index === items.length - 1}
                  />
                </div>
              ))
          : Array.from(Array(3).keys()).map((i) => (
              <div key={i} className={i === 0 ? "pt-2" : ""}>
                <SkeletonLineItem />
              </div>
            ))}
      </div>
    </div>
  )
}

export default ItemsTemplate
