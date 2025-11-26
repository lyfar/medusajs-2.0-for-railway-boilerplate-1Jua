"use client"

import { clx } from "@medusajs/ui"
import { useParams, usePathname } from "next/navigation"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { HttpTypes } from "@medusajs/types"
import { signout } from "@lib/data/customer"
import { User, MapPin, Package, LogOut, LayoutDashboard, ChevronRight } from "lucide-react"

const AccountNav = ({
  customer,
}: {
  customer: HttpTypes.StoreCustomer | null
}) => {
  const route = usePathname()
  const { countryCode } = useParams() as { countryCode: string }

  const handleLogout = async () => {
    await signout(countryCode)
  }

  return (
    <nav className="space-y-1">
      <AccountNavLink
        href="/account"
        route={route!}
        icon={<LayoutDashboard size={18} />}
        data-testid="overview-link"
      >
        Overview
      </AccountNavLink>
      
      <AccountNavLink
        href="/account/orders"
        route={route!}
        icon={<Package size={18} />}
        data-testid="orders-link"
      >
        Orders
      </AccountNavLink>

      <AccountNavLink
        href="/account/profile"
        route={route!}
        icon={<User size={18} />}
        data-testid="profile-link"
      >
        Profile
      </AccountNavLink>
      
      <AccountNavLink
        href="/account/addresses"
        route={route!}
        icon={<MapPin size={18} />}
        data-testid="addresses-link"
      >
        Addresses
      </AccountNavLink>

      <div className="pt-4 mt-4 border-t border-zinc-800/50">
        <button
          type="button"
          onClick={handleLogout}
          data-testid="logout-button"
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-zinc-400 hover:text-red-400 hover:bg-red-500/5 transition-all duration-200 group border border-transparent"
        >
          <LogOut size={18} className="group-hover:translate-x-0.5 transition-transform" />
          Log out
        </button>
      </div>
    </nav>
  )
}

type AccountNavLinkProps = {
  href: string
  route: string
  children: React.ReactNode
  icon?: React.ReactNode
  "data-testid"?: string
}

const AccountNavLink = ({
  href,
  route,
  children,
  icon,
  "data-testid": dataTestId,
}: AccountNavLinkProps) => {
  const { countryCode }: { countryCode: string } = useParams()

  const active = route.split(countryCode)[1] === href || (href === "/account" && route.split(countryCode)[1] === undefined)
  
  return (
    <LocalizedClientLink
      href={href}
      className={clx(
        "flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group border",
        {
          "bg-zinc-800/50 text-white shadow-inner border-zinc-700/50": active,
          "text-zinc-400 hover:text-white hover:bg-zinc-800/30 border-transparent": !active,
        }
      )}
      data-testid={dataTestId}
    >
      <div className="flex items-center gap-3">
        <span className={clx("transition-colors", active ? "text-indigo-400" : "text-zinc-500 group-hover:text-zinc-300")}>
          {icon}
        </span>
        <span>{children}</span>
      </div>
      {active && <ChevronRight size={14} className="text-zinc-500" />}
    </LocalizedClientLink>
  )
}

export default AccountNav
