import { listCartShippingMethods } from "@lib/data/fulfillment"
import { listCartPaymentMethods } from "@lib/data/payment"
import { getCustomer } from "@lib/data/customer"
import Addresses from "@modules/checkout/components/addresses"
import Payment from "@modules/checkout/components/payment"
import Review from "@modules/checkout/components/review"
import Shipping from "@modules/checkout/components/shipping"
import Divider from "@modules/common/components/divider"
import { HttpTypes } from "@medusajs/types"

const CheckoutForm = async ({
  cart: cartProp,
}: {
  cart: HttpTypes.StoreCart | null
}) => {
  const cart = cartProp
  if (!cart) {
    return null
  }
  const customer = await getCustomer()
  const shippingMethods = await listCartShippingMethods(cart.id)
  const paymentMethods = await listCartPaymentMethods(cart.region?.id ?? "")

  if (!shippingMethods || !paymentMethods) {
    return null
  }

  return (
    <div className="flex flex-col bg-gray-800 dark:bg-black px-8 py-10">
      <Addresses cart={cart} customer={customer} />
      <Divider className="my-8" />
      <Shipping cart={cart} availableShippingMethods={shippingMethods} />
      <Divider className="my-8" />
      <Payment cart={cart} availablePaymentMethods={paymentMethods} />
      <Divider className="my-8" />
      <Review cart={cart} />
    </div>
  )
}

export default CheckoutForm
