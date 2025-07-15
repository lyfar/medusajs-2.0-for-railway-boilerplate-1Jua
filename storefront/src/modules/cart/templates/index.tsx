import { getCustomer } from "@lib/data/customer"
import EmptyCartMessage from "@modules/cart/components/empty-cart-message"
import SignInPrompt from "@modules/cart/components/sign-in-prompt"
import ItemsTemplate from "@modules/cart/templates/items"
import Summary from "@modules/cart/templates/summary"
import Divider from "@modules/common/components/divider"
import { HttpTypes } from "@medusajs/types"

const CartTemplate = async ({
  cart: cartProp,
}: {
  cart: HttpTypes.StoreCart | null
}) => {
  const customer = await getCustomer()
  const cart = cartProp

  return (
    <div className="py-12 bg-gray-900 dark:bg-black text-white">
      <div className="content-container" data-testid="cart-container">
        {cart?.items?.length ? (
          <div className="grid grid-cols-1 small:grid-cols-[1fr_360px] gap-x-8">
            <div className="flex flex-col bg-gray-800 dark:bg-black p-6 gap-y-6">
              {!customer && (
                <>
                  <SignInPrompt />
                  <Divider />
                </>
              )}
              <ItemsTemplate items={cart?.items} cart={cart} />
            </div>
            <div className="relative">
              <div className="flex flex-col gap-y-8 sticky top-12">
                {cart && cart.region && (
                  <div className="bg-gray-800 dark:bg-black p-6">
                    <Summary cart={cart as any} />
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <EmptyCartMessage />
        )}
      </div>
    </div>
  )
}

export default CartTemplate
