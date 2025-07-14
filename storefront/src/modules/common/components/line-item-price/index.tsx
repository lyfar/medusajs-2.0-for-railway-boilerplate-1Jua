import { clx } from "@medusajs/ui"

import { getPercentageDiff } from "@lib/util/get-precentage-diff"
import { getPricesForVariant } from "@lib/util/get-product-price"
import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"

type LineItemPriceProps = {
  item: HttpTypes.StoreCartLineItem | HttpTypes.StoreOrderLineItem
  style?: "default" | "tight"
  currencyCode?: string
}

const LineItemPrice = ({ item, style = "default", currencyCode }: LineItemPriceProps) => {
  // For cart/order items, use the actual unit_price from the item
  const hasItemPrice = 'unit_price' in item && item.unit_price !== null
  
  if (hasItemPrice) {
    // Use the cart item's actual prices
    const currency_code = currencyCode || 'EUR'
    const totalPrice = item.unit_price * item.quantity
    
    return (
      <div className="flex flex-col gap-x-2 text-ui-fg-subtle items-end">
        <div className="text-left">
          <span
            className="text-base-regular"
            data-testid="product-price"
          >
            {convertToLocale({
              amount: totalPrice,
              currency_code,
            })}
          </span>
        </div>
      </div>
    )
  }
  
  // Fallback to variant pricing for non-cart contexts
  const { currency_code, calculated_price_number, original_price_number } =
    getPricesForVariant(item.variant) ?? {}

  const adjustmentsSum = (item.adjustments || []).reduce(
    (acc, adjustment) => adjustment.amount + acc,
    0
  )

  const originalPrice = original_price_number * item.quantity
  const currentPrice = calculated_price_number * item.quantity - adjustmentsSum
  const hasReducedPrice = currentPrice < originalPrice

  return (
    <div className="flex flex-col gap-x-2 text-ui-fg-subtle items-end">
      <div className="text-left">
        {hasReducedPrice && (
          <>
            <p>
              {style === "default" && (
                <span className="text-ui-fg-subtle">Original: </span>
              )}
              <span
                className="line-through text-ui-fg-muted"
                data-testid="product-original-price"
              >
                {convertToLocale({
                  amount: originalPrice,
                  currency_code,
                })}
              </span>
            </p>
            {style === "default" && (
              <span className="text-ui-fg-interactive">
                -{getPercentageDiff(originalPrice, currentPrice || 0)}%
              </span>
            )}
          </>
        )}
        <span
          className={clx("text-base-regular", {
            "text-ui-fg-interactive": hasReducedPrice,
          })}
          data-testid="product-price"
        >
          {convertToLocale({
            amount: currentPrice,
            currency_code,
          })}
        </span>
      </div>
    </div>
  )
}

export default LineItemPrice
