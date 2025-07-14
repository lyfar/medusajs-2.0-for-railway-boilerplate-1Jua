"use client"

import { Button, Heading } from "@medusajs/ui"

import CartTotals from "@modules/common/components/cart-totals"
import Divider from "@modules/common/components/divider"
import { HttpTypes } from "@medusajs/types"
import DiscountCode from "@modules/checkout/components/discount-code"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type SummaryProps = {
  cart: HttpTypes.StoreCart
}

function getCheckoutStep(cart: HttpTypes.StoreCart) {
  if (!cart?.shipping_address?.address_1 || !cart.email) {
    return "address"
  } else if (cart?.shipping_methods?.length === 0) {
    return "delivery"
  } else {
    return "payment"
  }
}

const Summary = ({ cart }: SummaryProps) => {
  const step = getCheckoutStep(cart)

  const totals = {
    total: cart.total,
    subtotal: cart.subtotal,
    tax_total: cart.tax_total,
    shipping_total: cart.shipping_total,
    discount_total: cart.discount_total,
    gift_card_total: cart.gift_card_total,
    currency_code: cart.currency_code,
    shipping_subtotal: cart.shipping_subtotal,
  }

  // Cast cart type for DiscountCode component compatibility
  const cartForDiscount = cart as HttpTypes.StoreCart & {
    promotions: HttpTypes.StorePromotion[]
  }

  return (
    <div className="flex flex-col gap-y-4">
      <Heading level="h2" className="text-[2rem] leading-[2.75rem]">
        Summary
      </Heading>
      <DiscountCode cart={cartForDiscount} />
      <Divider />
      <CartTotals totals={totals} />
      <LocalizedClientLink href={"/checkout?step=" + step} data-testid="checkout-button">
        <Button className="w-full h-10">Go to checkout</Button>
      </LocalizedClientLink>
    </div>
  )
}

export default Summary
