"use client"

import { Popover, Transition } from "@headlessui/react"
import { Button } from "@medusajs/ui"
import { usePathname } from "next/navigation"
import { Fragment, useEffect, useRef, useState } from "react"

import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Item from "@modules/cart/components/item"
import { ShoppingBag } from "lucide-react"

const CartDropdown = ({
  cart: cartState,
}: {
  cart?: HttpTypes.StoreCart | null
}) => {
  const [activeTimer, setActiveTimer] = useState<NodeJS.Timer | undefined>(
    undefined
  )
  const [cartDropdownOpen, setCartDropdownOpen] = useState(false)

  const open = () => setCartDropdownOpen(true)
  const close = () => setCartDropdownOpen(false)

  // Calculate total unique items (line items) instead of total quantity sum
  const totalItems = cartState?.items?.length || 0

  const subtotal = cartState?.subtotal ?? 0
  const itemRef = useRef<number>(totalItems || 0)

  const timedOpen = () => {
    open()
    const timer = setTimeout(close, 5000)
    setActiveTimer(timer)
  }

  const openAndCancel = () => {
    if (activeTimer) {
      clearTimeout(activeTimer)
    }
    open()
  }

  useEffect(() => {
    return () => {
      if (activeTimer) {
        clearTimeout(activeTimer)
      }
    }
  }, [activeTimer])

  const pathname = usePathname()

  useEffect(() => {
    if (itemRef.current !== totalItems && !pathname.includes("/cart")) {
      timedOpen()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalItems, itemRef.current])

  return (
    <div
      className="h-full z-50"
      onMouseEnter={openAndCancel}
      onMouseLeave={close}
    >
      <Popover className="relative h-full">
        <Popover.Button className="h-full focus:outline-none">
          <LocalizedClientLink
            className="group hover:text-ui-fg-base transition-all duration-200 flex items-center gap-2 px-3 py-2 rounded-full hover:bg-white/5 active:scale-95"
            href="/cart"
            data-testid="nav-cart-link"
          >
            <div className="relative">
              <ShoppingBag className="w-5 h-5 text-zinc-400 group-hover:text-white transition-colors" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-500 text-[10px] font-bold text-white ring-2 ring-[#09090b]">
                  {totalItems}
                </span>
              )}
            </div>
            <span className="text-sm font-medium hidden sm:block text-zinc-400 group-hover:text-white transition-colors">Cart</span>
          </LocalizedClientLink>
        </Popover.Button>
        <Transition
          show={cartDropdownOpen}
          as={Fragment}
          enter="transition ease-out duration-200"
          enterFrom="opacity-0 translate-y-2 scale-95"
          enterTo="opacity-100 translate-y-0 scale-100"
          leave="transition ease-in duration-150"
          leaveFrom="opacity-100 translate-y-0 scale-100"
          leaveTo="opacity-0 translate-y-2 scale-95"
        >
          <Popover.Panel
            static
            className="hidden small:block absolute top-[calc(100%+8px)] right-0 w-[400px] z-50"
            data-testid="nav-cart-dropdown"
          >
            <div className="rounded-2xl border border-zinc-800 bg-[#09090b]/90 backdrop-blur-xl shadow-2xl overflow-hidden ring-1 ring-white/10">
              <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/5">
                <h3 className="font-medium text-zinc-100">Shopping Bag</h3>
                <span className="text-xs text-zinc-400 bg-zinc-800/50 px-2 py-1 rounded-full">
                  {totalItems} {totalItems === 1 ? 'item' : 'items'}
                </span>
              </div>

              {cartState && cartState.items?.length ? (
                <>
                  <div className="overflow-y-auto max-h-[400px] p-4 flex flex-col gap-2 scrollbar-hide">
                    {cartState.items
                      .sort((a, b) => {
                        return (a.created_at ?? "") > (b.created_at ?? "")
                          ? -1
                          : 1
                      })
                      .map((item) => (
                        <Item
                          key={item.id}
                          item={item}
                          currencyCode={cartState.currency_code}
                          type="preview"
                        />
                      ))}
                  </div>
                  
                  <div className="p-4 bg-white/5 border-t border-white/5 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400 text-sm">Subtotal</span>
                      <span
                        className="text-lg font-semibold text-white"
                        data-testid="cart-subtotal"
                      >
                        {convertToLocale({
                          amount: subtotal,
                          currency_code: cartState.currency_code,
                        })}
                      </span>
                    </div>
                    <LocalizedClientLink href="/cart" passHref className="block">
                      <Button
                        className="w-full bg-white text-black hover:bg-zinc-200 transition-colors font-medium h-11 rounded-xl shadow-lg shadow-white/5"
                        size="large"
                        data-testid="go-to-cart-button"
                      >
                        Review & Checkout
                      </Button>
                    </LocalizedClientLink>
                  </div>
                </>
              ) : (
                <div className="flex flex-col gap-4 items-center justify-center py-16 px-8 text-center">
                  <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-600 border border-zinc-800">
                    <ShoppingBag className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-zinc-200 font-medium">Your bag is empty</p>
                    <p className="text-zinc-500 text-sm max-w-[200px] mx-auto">
                      Start creating your custom stickers to see them here.
                    </p>
                  </div>
                  <Button 
                    onClick={close}
                    variant="secondary"
                    className="mt-4 bg-white text-black hover:bg-zinc-200 border-transparent"
                  >
                    Start Creating
                  </Button>
                </div>
              )}
            </div>
          </Popover.Panel>
        </Transition>
      </Popover>
    </div>
  )
}

export default CartDropdown
