"use client"

import { Heading } from "@medusajs/ui"
import { useEffect, useMemo } from "react"
import { useCart } from "medusa-react"
import { LineItem, Order } from "@medusajs/medusa"

import CartTotals from "@modules/common/components/cart-totals"
import Help from "@modules/order/components/help"
import Items from "@modules/order/components/items"
import OnboardingCta from "@modules/order/components/onboarding-cta"
import OrderDetails from "@modules/order/components/order-details"
import ShippingDetails from "@modules/order/components/shipping-details"
import PaymentDetails from "@modules/order/components/payment-details"

type OrderConfirmedTemplateProps = {
  order: Order
}

const OrderConfirmedTemplate: React.FC<OrderConfirmedTemplateProps> = ({
  order,
}) => {
  const { clearCart, cart } = useCart()

  const enrichedItems = useMemo(() => {
    // A function that enriches line items with product and variant information
    // from the order.
    const productIds = order.items.map((item) => item.variant.product_id)
    const products = order.products.filter((product) =>
      productIds.includes(product.id)
    )

    return order.items.map((item) => {
      const product = products.find(
        (p) => p.id === item.variant.product_id
      )
      const variant = product?.variants.find((v) => v.id === item.variant_id)

      return {
        ...item,
        variant: {
          ...variant,
          product,
        },
      }
    }) as LineItem[]
  }, [order.items, order.products])

  useEffect(() => {
    if (cart?.id) {
      clearCart()
    }
  }, [clearCart, cart?.id])

  return (
    <div className="py-6 min-h-[calc(100vh-64px)]">
      <div className="content-container flex flex-col justify-center items-center gap-y-10 max-w-4xl h-full w-full">
        <div className="flex flex-col gap-4 max-w-4xl w-full bg-white p-10">
          <Heading level="h1" className="text-3xl-regular">
            Thank you!
          </Heading>
          <p className="text-base-regular text-ui-fg-subtle">
            Your order was placed successfully.
          </p>
          <OrderDetails order={order} />
          <h2 className="text-xl-semi">Summary</h2>
          <Items items={enrichedItems} region={order.region} />
          <CartTotals data={order} />
          <ShippingDetails order={order} />
          <PaymentDetails order={order} />
          <Help />
        </div>

        <OnboardingCta order={order} />
      </div>
    </div>
  )
}

export default OrderConfirmedTemplate 