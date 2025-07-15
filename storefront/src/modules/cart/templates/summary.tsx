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
    <div className="flex flex-col gap-y-4 bg-gray-800 dark:bg-black p-6 text-white">
      <Heading level="h2" className="text-[2rem] leading-[2.75rem]">
        Summary
      </Heading>
      <div className="text-black">
        <DiscountCode cart={cart} />
      </div>
      <Divider />
      <CartTotals totals={cart} />
      <LocalizedClientLink
        href={"/checkout?step=" + step}
        data-testid="checkout-button"
      >
        <Button className="w-full h-10">Go to checkout</Button>
      </LocalizedClientLink>
    </div>
  )
}

export default Summary
