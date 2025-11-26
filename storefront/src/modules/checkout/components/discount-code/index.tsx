"use client"

import { Badge, Heading, Input, Label, Text, Tooltip } from "@medusajs/ui"
import React from "react"
import { useFormState } from "react-dom"

import { applyPromotions, submitPromotionForm } from "@lib/data/cart"
import { convertToLocale } from "@lib/util/money"
import { InformationCircleSolid } from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"
import Trash from "@modules/common/icons/trash"
import ErrorMessage from "../error-message"
import { SubmitButton } from "../submit-button"
import { Tag, X } from "lucide-react"

type DiscountCodeProps = {
  cart: HttpTypes.StoreCart & {
    promotions: HttpTypes.StorePromotion[]
  }
}

const DiscountCode: React.FC<DiscountCodeProps> = ({ cart }) => {
  const [isOpen, setIsOpen] = React.useState(false)

  const { items = [], promotions = [] } = cart
  const removePromotionCode = async (code: string) => {
    const validPromotions = promotions.filter(
      (promotion) => promotion.code !== code
    )

    await applyPromotions(
      validPromotions.filter((p) => p.code === undefined).map((p) => p.code!)
    )
  }

  const addPromotionCode = async (formData: FormData) => {
    const code = formData.get("code")
    if (!code) {
      return
    }
    const input = document.getElementById("promotion-input") as HTMLInputElement
    const codes = promotions
      .filter((p) => p.code === undefined)
      .map((p) => p.code!)
    codes.push(code.toString())

    await applyPromotions(codes)

    if (input) {
      input.value = ""
    }
    setIsOpen(false)
  }

  const [message, formAction] = useFormState(submitPromotionForm, null)

  return (
    <div className="w-full flex flex-col">
      <div className="txt-medium">
        <form action={(a) => addPromotionCode(a)} className="w-full mb-3">
          {!isOpen && (
            <button
              onClick={() => setIsOpen(true)}
              type="button"
              className="flex items-center gap-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors w-full py-2"
              data-testid="add-discount-button"
            >
              <Tag className="w-4 h-4" />
              Have a promo code?
            </button>
          )}

          {isOpen && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
              <div className="flex w-full gap-2">
                <div className="relative flex-1">
                  <Input
                    className="w-full bg-zinc-950/50 border-zinc-800 text-white placeholder:text-zinc-600 focus:border-zinc-600 rounded-lg"
                    id="promotion-input"
                    name="code"
                    type="text"
                    autoFocus
                    placeholder="Enter code"
                    data-testid="discount-input"
                  />
                </div>
                <SubmitButton
                  variant="secondary"
                  data-testid="discount-apply-button"
                  className="bg-white text-black hover:bg-zinc-200 border-transparent font-medium"
                >
                  Apply
                </SubmitButton>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-zinc-500 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <ErrorMessage
                error={message}
                data-testid="discount-error-message"
              />
            </div>
          )}
        </form>

        {promotions.length > 0 && (
          <div className="w-full flex flex-col gap-2">
            <span className="text-xs text-zinc-500 uppercase tracking-wider font-medium">Applied Promos</span>
            {promotions.map((promotion) => (
              <div
                key={promotion.id}
                className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2"
                data-testid="discount-row"
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <Tag className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  <span className="text-sm font-medium text-emerald-400 truncate" data-testid="discount-code">
                    {promotion.code}
                  </span>
                  <span className="text-xs text-emerald-500/70">
                    (
                    {promotion.application_method?.value !== undefined &&
                      promotion.application_method.currency_code !== undefined && (
                        <>
                          {promotion.application_method.type === "percentage"
                            ? `${promotion.application_method.value}% off`
                            : `-${convertToLocale({
                                amount: promotion.application_method.value,
                                currency_code: promotion.application_method.currency_code,
                              })}`}
                        </>
                      )}
                    )
                  </span>
                </div>
                {!promotion.is_automatic && (
                  <button
                    className="text-emerald-500/50 hover:text-emerald-400 transition-colors p-1"
                    onClick={() => {
                      if (promotion.code) removePromotionCode(promotion.code)
                    }}
                    data-testid="remove-discount-button"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default DiscountCode
