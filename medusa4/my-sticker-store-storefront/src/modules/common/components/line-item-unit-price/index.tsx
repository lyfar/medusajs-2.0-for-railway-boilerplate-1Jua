import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"
import { clx } from "@medusajs/ui"

type LineItemUnitPriceProps = {
  item: HttpTypes.StoreCartLineItem | HttpTypes.StoreOrderLineItem
  style?: "default" | "tight"
  currencyCode: string
}

const LineItemUnitPrice = ({
  item,
  style = "default",
  currencyCode,
}: LineItemUnitPriceProps) => {
  const { unit_price, quantity, total, original_total } = item
  const hasReducedPrice = total < original_total

  const displayUnitPrice = convertToLocale({
    amount: (unit_price || 0),
    currency_code: currencyCode,
  })

  let displayOriginalUnitPrice = ""
  if (hasReducedPrice) {
    const originalUnitPriceInCents = original_total / quantity
    displayOriginalUnitPrice = convertToLocale({
      amount: (originalUnitPriceInCents || 0),
      currency_code: currencyCode,
    })
  }

  const percentage_diff = hasReducedPrice ? Math.round(
    ((original_total - total) / original_total) * 100
  ) : 0

  return (
    <div className="flex flex-col text-ui-fg-muted justify-center h-full">
      {hasReducedPrice && (
        <>
          <p>
            {style === "default" && (
              <span className="text-ui-fg-muted">Original: </span>
            )}
            <span
              className="line-through"
              data-testid="product-unit-original-price"
            >
              {displayOriginalUnitPrice}
            </span>
          </p>
          {style === "default" && (
            <span className="text-ui-fg-interactive">-{percentage_diff}%</span>
          )}
        </>
      )}
      <span
        className={clx("text-base-regular", {
          "text-ui-fg-interactive": hasReducedPrice,
        })}
        data-testid="product-unit-price"
      >
        {displayUnitPrice}
      </span>
    </div>
  )
}

export default LineItemUnitPrice
