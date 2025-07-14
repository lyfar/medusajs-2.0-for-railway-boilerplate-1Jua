import { getPricesForVariant } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"
import { clx } from "@medusajs/ui"
import { convertToLocale } from "@lib/util/money"

type LineItemUnitPriceProps = {
  item: HttpTypes.StoreCartLineItem | HttpTypes.StoreOrderLineItem
  style?: "default" | "tight"
  currencyCode?: string
}

const LineItemUnitPrice = ({
  item,
  style = "default",
  currencyCode
}: LineItemUnitPriceProps) => {
  // For cart/order items, use the actual unit_price from the item
  const hasItemPrice = 'unit_price' in item && item.unit_price !== null
  
  if (hasItemPrice) {
    const currency_code = currencyCode || 'EUR'
    
    return (
      <div
        className={clx("flex flex-col text-left", {
          "gap-y-2": style === "default",
        })}
      >
        <span
          className={clx("text-ui-fg-base", {
            "txt-compact-small": style === "tight",
          })}
          data-testid="product-unit-price"
        >
          {convertToLocale({
            amount: item.unit_price,
            currency_code,
          })}
        </span>
      </div>
    )
  }
  
  // Fallback to variant pricing
  const { currency_code, calculated_price_number, original_price_number } =
    getPricesForVariant(item.variant) ?? {}

  const hasReducedPrice = calculated_price_number && original_price_number && 
    calculated_price_number < original_price_number && style === "default"

  return (
    <div
      className={clx("flex flex-col text-left", {
        "gap-y-2": style === "default",
      })}
    >
      {hasReducedPrice && (
        <>
          <span
            className="line-through text-ui-fg-muted"
            data-testid="product-original-price"
          >
            {convertToLocale({
              amount: original_price_number,
              currency_code,
            })}
          </span>
          <span
            className={clx("text-ui-fg-interactive", {
              "txt-compact-small": style === "tight",
            })}
          >
            {convertToLocale({
              amount: calculated_price_number,
              currency_code,
            })}
          </span>
        </>
      )}

      {!hasReducedPrice && (
        <span
          className={clx("text-ui-fg-base", {
            "txt-compact-small": style === "tight",
          })}
          data-testid="product-unit-price"
        >
          {convertToLocale({
            amount: calculated_price_number,
            currency_code,
          })}
        </span>
      )}
    </div>
  )
}

export default LineItemUnitPrice
