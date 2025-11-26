"use client"

import { Button, Heading } from "@medusajs/ui"
import CartTotals from "@modules/common/components/cart-totals"
import DiscountCode from "@modules/checkout/components/discount-code"
import Divider from "@modules/common/components/divider"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { HttpTypes } from "@medusajs/types"

function getCheckoutStep(cart: HttpTypes.StoreCart) {
  if (!cart?.shipping_address?.address_1 || !cart.email) {
    return "address"
  } else if (cart?.shipping_methods?.length === 0) {
    return "delivery"
  } else {
    return "payment"
  }
}

const Summary = ({
  cart,
}: {
  cart: HttpTypes.StoreCart & {
    promotions?: HttpTypes.StorePromotion[]
  }
}) => {
  const step = getCheckoutStep(cart)

  return (
    <div className="flex flex-col gap-y-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 text-white backdrop-blur-xl shadow-2xl ring-1 ring-white/5">
      <Heading level="h2" className="text-2xl font-medium text-white tracking-tight mb-2">
        Order Summary
      </Heading>
      
      <DiscountCode cart={cart} />
      
      <div className="h-px w-full bg-zinc-800 my-2" />
      
      <div className="text-zinc-300">
        <CartTotals totals={cart} />
      </div>
      
      <LocalizedClientLink
        href={"/checkout?step=" + step}
        data-testid="checkout-button"
        className="w-full"
      >
        <Button 
          className="w-full h-12 bg-white text-black hover:bg-zinc-200 transition-colors font-semibold text-base rounded-xl mt-4"
        >
          Proceed to Checkout
        </Button>
      </LocalizedClientLink>
    </div>
  )
}

export default Summary
