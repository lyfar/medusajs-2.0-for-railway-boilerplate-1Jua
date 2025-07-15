import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ChevronDown from "@modules/common/icons/chevron-down"

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative bg-gray-900 dark:bg-black">
      <div className="h-16 bg-white dark:bg-black">
        <nav className="flex items-center h-full justify-between content-container">
          <LocalizedClientLink
            href="/cart"
            className="text-small-semi text-ui-fg-base dark:text-white flex items-center gap-x-2 uppercase flex-1 basis-0"
          >
            <>
              <ChevronDown className="rotate-90" size={16} />
              <span className="mt-px hidden small:block txt-compact-plus text-ui-fg-base dark:text-white hover:text-ui-fg-base dark:hover:text-gray-300 uppercase">
                Back to shopping cart
              </span>
              <span className="mt-px block small:hidden">
                <ChevronDown className="rotate-90" size={16} />
              </span>
            </>
          </LocalizedClientLink>
          <LocalizedClientLink
            href="/"
            className="txt-compact-xlarge-plus text-ui-fg-subtle dark:text-white hover:text-ui-fg-base dark:hover:text-gray-300 uppercase"
          >
            EggShell
          </LocalizedClientLink>
          <div className="flex-1 basis-0" />
        </nav>
      </div>
      <div className="relative">{children}</div>
    </div>
  )
}
