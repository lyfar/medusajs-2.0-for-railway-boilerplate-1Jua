"use client"

import { Heading, Text, clx } from "@medusajs/ui"
import { useFormStatus } from "react-dom"

import { placeOrder } from "@lib/data/cart"
import ErrorMessage from "@modules/checkout/components/error-message"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import PaymentButton from "@modules/checkout/components/payment-button"

import { useSearchParams } from "next/navigation"

const Review = ({ cart }: { cart: any }) => {
  const searchParams = useSearchParams()

  const isOpen = searchParams.get("step") === "review"

  const paidByGiftcard =
    cart?.gift_cards && cart?.gift_cards?.length > 0 && cart?.total === 0

  const previousStepsCompleted =
    cart.shipping_address &&
    cart.shipping_methods.length > 0 &&
    (cart.payment_collection || paidByGiftcard)

  // Only show the Review section when user clicks "Continue to review"
  if (!isOpen || !previousStepsCompleted) {
    return null
  }

  return (
    <div className="bg-gray-800 dark:bg-black text-white">
      <div className="flex flex-row items-center justify-between mb-6">
        <Heading
          level="h2"
          className="flex flex-row text-2xl font-semibold gap-x-2 items-baseline"
        >
          Review
        </Heading>
      </div>
      <div className="w-full bg-gray-800 dark:bg-black p-6 flex flex-col gap-y-6">
        <div className="flex flex-col gap-y-3">
          <Text className="text-small-regular text-ui-fg-subtle">
            By clicking the &quot;Complete Order&quot; button, you confirm
            that you have read and agree to our{" "}
            <LocalizedClientLink
              href="/content/terms-of-use"
              className="underline"
            >
              Terms of Use
            </LocalizedClientLink>
            ,{" "}
            <LocalizedClientLink
              href="/content/privacy-policy"
              className="underline"
            >
              Privacy Policy
            </LocalizedClientLink>
            , and{" "}
            <LocalizedClientLink
              href="/content/return-policy"
              className="underline"
            >
              Returns Policy
            </LocalizedClientLink>{" "}
            and acknowledge that you have read EggShell
            Store&apos;s policies.
          </Text>
        </div>
        <PaymentButton cart={cart} data-testid="submit-order-button" />
      </div>
    </div>
  )
}

export default Review
