"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import {
  Heading,
  Text,
  clx,
  useToggleState,
} from "@medusajs/ui"

import { CheckCircleSolid } from "@medusajs/icons"
import { setAddresses } from "@lib/data/cart"
import compareAddresses from "@lib/util/compare-addresses"
import { HttpTypes } from "@medusajs/types"
import { useFormState } from "react-dom"

import Divider from "@modules/common/components/divider"
import Spinner from "@modules/common/icons/spinner"
import BillingAddress from "../billing_address"
import ErrorMessage from "../error-message"
import ShippingAddress from "../shipping-address"
import { SubmitButton } from "../submit-button"

const Addresses = ({
  cart,
  customer,
}: {
  cart: HttpTypes.StoreCart | null
  customer: HttpTypes.StoreCustomer | null
}) => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const isOpen = searchParams.get("step") === "address"

  const { state: sameAsBilling, toggle: toggleSameAsBilling } = useToggleState(
    cart?.shipping_address && cart?.billing_address
      ? compareAddresses(cart?.shipping_address, cart?.billing_address)
      : true
  )

  const handleEdit = () => {
    router.push(pathname + "?step=address")
  }

  const [message, formAction] = useFormState(setAddresses, null)

  return (
    <div className="bg-gray-800 dark:bg-black p-6 text-white">
      <div className="flex flex-row items-center justify-between mb-8">
        <Heading
          level="h2"
          className="flex flex-row text-2xl font-semibold gap-x-3 items-center"
        >
          Shipping Address
          {!isOpen && <CheckCircleSolid className="text-green-500" />}
        </Heading>
        {!isOpen && cart?.shipping_address && (
          <button
            onClick={handleEdit}
            className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
            data-testid="edit-address-button"
          >
            Edit
          </button>
        )}
      </div>
      {isOpen ? (
        <form action={formAction}>
          <div className="pb-8">
            <ShippingAddress
              customer={customer}
              checked={sameAsBilling}
              onChange={toggleSameAsBilling}
              cart={cart}
            />

            {!sameAsBilling && (
              <div className="mt-8 pt-8 border-t border-gray-700">
                <Heading
                  level="h2"
                  className="text-2xl font-semibold mb-6"
                >
                  Billing address
                </Heading>

                <BillingAddress cart={cart} />
              </div>
            )}
            <div className="mt-8 pt-6 border-t border-gray-700">
              <SubmitButton className="w-full py-3" data-testid="submit-address-button">
                Continue to delivery
              </SubmitButton>
              <ErrorMessage error={message} data-testid="address-error-message" />
            </div>
          </div>
        </form>
      ) : (
        <div>
          <div className="text-small-regular">
            {cart && cart.shipping_address ? (
              <div className="space-y-6">
                {/* Mobile: Stack vertically, Desktop: Grid layout */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                  <div
                    className="flex flex-col space-y-2"
                    data-testid="shipping-address-summary"
                  >
                    <Text className="txt-medium-plus text-gray-200 mb-2 font-semibold">
                      Shipping Address
                    </Text>
                    <Text className="txt-medium text-gray-300">
                      {cart.shipping_address.first_name}{" "}
                      {cart.shipping_address.last_name}
                    </Text>
                    <Text className="txt-medium text-gray-300">
                      {cart.shipping_address.address_1}
                      {cart.shipping_address.address_2 && (
                        <span>, {cart.shipping_address.address_2}</span>
                      )}
                    </Text>
                    <Text className="txt-medium text-gray-300">
                      {cart.shipping_address.postal_code} {cart.shipping_address.city}
                    </Text>
                    <Text className="txt-medium text-gray-300">
                      {cart.shipping_address.country_code?.toUpperCase()}
                    </Text>
                  </div>

                  <div
                    className="flex flex-col space-y-2"
                    data-testid="shipping-contact-summary"
                  >
                    <Text className="txt-medium-plus text-gray-200 mb-2 font-semibold">
                      Contact
                    </Text>
                    <Text className="txt-medium text-gray-300">
                      {cart.email}
                    </Text>
                    {cart.shipping_address.phone && (
                      <Text className="txt-medium text-gray-300">
                        {cart.shipping_address.phone}
                      </Text>
                    )}
                  </div>

                  <div
                    className="flex flex-col space-y-2"
                    data-testid="billing-address-summary"
                  >
                    <Text className="txt-medium-plus text-gray-200 mb-2 font-semibold">
                      Billing Address
                    </Text>

                    {sameAsBilling ? (
                      <Text className="txt-medium text-gray-300 italic">
                        Same as shipping address
                      </Text>
                    ) : (
                      <>
                        <Text className="txt-medium text-gray-300">
                          {cart.billing_address?.first_name}{" "}
                          {cart.billing_address?.last_name}
                        </Text>
                        <Text className="txt-medium text-gray-300">
                          {cart.billing_address?.address_1}
                          {cart.billing_address?.address_2 && (
                            <span>, {cart.billing_address.address_2}</span>
                          )}
                        </Text>
                        <Text className="txt-medium text-gray-300">
                          {cart.billing_address?.postal_code} {cart.billing_address?.city}
                        </Text>
                        <Text className="txt-medium text-gray-300">
                          {cart.billing_address?.country_code?.toUpperCase()}
                        </Text>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex justify-center py-8">
                <Spinner />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Addresses
