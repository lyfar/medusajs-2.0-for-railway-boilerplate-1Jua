"use client"

import { Popover, Transition } from "@headlessui/react"
import { Button } from "@medusajs/ui"
import { usePathname } from "next/navigation"
import { Fragment, useEffect, useRef, useState } from "react"

import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"
import DeleteButton from "@modules/common/components/delete-button"
import LineItemOptions from "@modules/common/components/line-item-options"
import LineItemPrice from "@modules/common/components/line-item-price"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "@modules/products/components/thumbnail"

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

  // Fix malformed Cloudflare R2 URLs
  const normalizeCloudflareUrl = (url: string) => {
    // Check if URL has the malformed pattern: r2.devpk_
    if (url.includes('r2.devpk_')) {
      // Extract the filename from the end of the URL
      const filename = url.split('/').pop()
      // Replace the malformed part with correct structure
      const baseUrl = url.split('r2.devpk_')[0] + 'r2.dev/'
      return baseUrl + filename
    }
    return url
  }

  // Format size display from dimensions
  const formatSizeDisplay = (metadata: any) => {
    const dimensions = metadata?.dimensions as { width?: number; height?: number; diameter?: number } | undefined
    if (!dimensions) return null
    
    if (dimensions.diameter) {
      return `${dimensions.diameter} cm`
    }
    
    if (dimensions.width && dimensions.height) {
      return `${dimensions.width} x ${dimensions.height} cm`
    }
    
    return null
  }

  const totalItems =
    cartState?.items?.reduce((acc, item) => {
      return acc + item.quantity
    }, 0) || 0

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

  // Clean up the timer when the component unmounts
  useEffect(() => {
    return () => {
      if (activeTimer) {
        clearTimeout(activeTimer)
      }
    }
  }, [activeTimer])

  const pathname = usePathname()

  // open cart dropdown when modifying the cart items, but only if we're not on the cart page
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
        <Popover.Button className="h-full">
          <LocalizedClientLink
            className="hover:text-ui-fg-base"
            href="/cart"
            data-testid="nav-cart-link"
          >{`Cart (${totalItems})`}</LocalizedClientLink>
        </Popover.Button>
        <Transition
          show={cartDropdownOpen}
          as={Fragment}
          enter="transition ease-out duration-200"
          enterFrom="opacity-0 translate-y-1"
          enterTo="opacity-100 translate-y-0"
          leave="transition ease-in duration-150"
          leaveFrom="opacity-100 translate-y-0"
          leaveTo="opacity-0 translate-y-1"
        >
          <Popover.Panel
            static
            className="hidden small:block absolute top-[calc(100%+1px)] right-0 bg-neutral-900 border-x border-b border-neutral-800 w-[420px] text-ui-fg-base shadow-2xl"
            data-testid="nav-cart-dropdown"
          >
            <div className="p-4 flex items-center justify-center border-b border-neutral-800">
              <h3 className="text-large-semi text-white">Cart</h3>
            </div>
            {cartState && cartState.items?.length ? (
              <>
                <div className="overflow-y-scroll max-h-[402px] px-4 grid grid-cols-1 gap-y-8 no-scrollbar p-px">
                  {cartState.items
                    .sort((a, b) => {
                      return (a.created_at ?? "") > (b.created_at ?? "")
                        ? -1
                        : 1
                    })
                    .map((item) => {
                      const rawDesignUrl = (item.metadata?.design_url as string) || null
                      const designUrl = rawDesignUrl ? normalizeCloudflareUrl(rawDesignUrl) : null
                      const isSticker = !!item.metadata?.shape || !!designUrl
                      
                      return (
                        <div
                          className="grid grid-cols-[122px_1fr] gap-x-4"
                          key={item.id}
                          data-testid="cart-item"
                        >
                          <LocalizedClientLink
                            href={`/products/${item.variant?.product?.handle}`}
                            className="w-24"
                          >
                            {designUrl ? (
                              <div className="w-24 h-24 rounded-md overflow-hidden bg-card">
                                <img
                                  src={designUrl}
                                  alt="Custom sticker design"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ) : (
                              <Thumbnail
                                thumbnail={item.variant?.product?.thumbnail}
                                images={item.variant?.product?.images}
                                size="square"
                              />
                            )}
                          </LocalizedClientLink>
                          <div className="flex flex-col justify-between flex-1">
                            <div className="flex flex-col flex-1">
                              <div className="flex items-start justify-between">
                                <div className="flex flex-col overflow-ellipsis whitespace-nowrap mr-4 w-[180px]">
                                  <h3 className="text-base-regular overflow-hidden text-ellipsis text-white">
                                    <LocalizedClientLink
                                      href={`/products/${item.variant?.product?.handle}`}
                                      data-testid="product-link"
                                    >
                                      {item.title}
                                    </LocalizedClientLink>
                                  </h3>
                                  
                                  {!isSticker && (
                                    <LineItemOptions
                                      variant={item.variant}
                                      data-testid="cart-item-variant"
                                      data-value={item.variant}
                                    />
                                  )}
                                  
                                  {isSticker && (
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {typeof item.metadata?.shape === "string" && (
                                        <span className="px-1 py-0.5 bg-muted text-muted-foreground text-xs rounded border border-border">
                                          {item.metadata.shape}
                                        </span>
                                      )}
                                      {formatSizeDisplay(item.metadata) && (
                                        <span className="px-1 py-0.5 bg-muted text-muted-foreground text-xs rounded border border-border">
                                          {formatSizeDisplay(item.metadata)}
                                        </span>
                                      )}
                                      {designUrl && (
                                        <span className="px-1 py-0.5 bg-primary text-primary-foreground text-xs rounded border border-primary">
                                          Custom Design
                                        </span>
                                      )}
                                    </div>
                                  )}
                                  
                                  <span
                                    className="text-neutral-400 mt-1"
                                    data-testid="cart-item-quantity"
                                    data-value={item.quantity}
                                  >
                                    Quantity: {item.quantity}
                                  </span>
                                </div>
                                <div className="flex justify-end">
                                  <LineItemPrice item={item} style="tight" />
                                </div>
                              </div>
                            </div>
                            <DeleteButton
                              id={item.id}
                              className="mt-1"
                              data-testid="cart-item-remove-button"
                            >
                              Remove
                            </DeleteButton>
                          </div>
                        </div>
                      )
                    })}
                </div>
                <div className="p-4 flex flex-col gap-y-4 text-small-regular border-t border-neutral-800">
                  <div className="flex items-center justify-between">
                    <span className="text-ui-fg-base font-semibold text-white">
                      Subtotal{" "}
                      <span className="font-normal text-neutral-400">(excl. taxes)</span>
                    </span>
                    <span
                      className="text-large-semi text-white"
                      data-testid="cart-subtotal"
                      data-value={subtotal}
                    >
                      {convertToLocale({
                        amount: subtotal,
                        currency_code: cartState.currency_code,
                      })}
                    </span>
                  </div>
                  <LocalizedClientLink href="/cart" passHref>
                    <Button
                      className="w-full"
                      size="large"
                      data-testid="go-to-cart-button"
                    >
                      Go to cart
                    </Button>
                  </LocalizedClientLink>
                </div>
              </>
            ) : (
              <div>
                <div className="flex py-16 flex-col gap-y-4 items-center justify-center">
                  <div className="bg-neutral-800 text-small-regular flex items-center justify-center w-8 h-8 rounded-full text-white">
                    <span>0</span>
                  </div>
                  <span className="text-neutral-400">Your shopping bag is empty.</span>
                  <div>
                    <LocalizedClientLink href="/store">
                      <>
                        <span className="sr-only">Go to all products page</span>
                        <Button onClick={close}>Explore products</Button>
                      </>
                    </LocalizedClientLink>
                  </div>
                </div>
              </div>
            )}
          </Popover.Panel>
        </Transition>
      </Popover>
    </div>
  )
}

export default CartDropdown
