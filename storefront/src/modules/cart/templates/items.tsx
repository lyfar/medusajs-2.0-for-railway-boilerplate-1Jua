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
    <div className="bg-gray-800 dark:bg-black">
      <div className="flex items-center mb-6 px-6">
        <Heading className="text-xl-semi text-white">Cart</Heading>
      </div>
      
      {/* Modern List Layout */}
      <div className="flex flex-col">
        {/* Top border */}
        <div className="h-px bg-gray-600 dark:bg-gray-700 mb-0"></div>
        
        {items && cart
          ? items
              .sort((a, b) => {
                return (a.created_at ?? 0) > (b.created_at ?? 0) ? -1 : 1
              })
              .map((item, index) => (
                <div key={item.id}>
                  <Item 
                    item={item} 
                    currencyCode={currencyCode} 
                    type="full" 
                    isLast={index === items.length - 1}
                  />
                  {/* Separator after each item except the last */}
                  {index < items.length - 1 && (
                    <div className="h-px bg-gray-600 dark:bg-gray-700"></div>
                  )}
                </div>
              ))
          : Array.from(Array(3).keys()).map((i) => (
              <div key={i}>
                <SkeletonLineItem />
                {i < 2 && <div className="h-px bg-gray-600 dark:bg-gray-700"></div>}
              </div>
            ))}
        
        {/* Bottom border */}
        <div className="h-px bg-gray-600 dark:bg-gray-700 mt-0"></div>
      </div>
    </div>
  )
}

export default ItemsTemplate
