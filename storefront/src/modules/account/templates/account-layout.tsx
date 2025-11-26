import React from "react"
import AccountNav from "../components/account-nav"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { LifeBuoy } from "lucide-react"

interface AccountLayoutProps {
  customer: HttpTypes.StoreCustomer | null
  children: React.ReactNode
}

const AccountLayout: React.FC<AccountLayoutProps> = ({
  customer,
  children,
}) => {
  const greeting = customer?.first_name ? `Welcome back, ${customer.first_name}` : "Your account"

  return (
    <div className="flex-1 min-h-screen bg-[#09090b] text-white relative overflow-hidden" data-testid="account-page">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none" />
      <div className="absolute top-0 right-0 w-1/3 h-96 bg-purple-500/5 blur-[120px] pointer-events-none" />
      
      <div className="content-container max-w-6xl mx-auto py-12 small:py-16 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-12 items-start">
          
          {/* Sidebar */}
          <div className="space-y-8 sticky top-24">
            <div className="space-y-2 px-2">
              <h1 className="text-2xl font-medium tracking-tight">{greeting}</h1>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Manage your designs, orders, and personal details.
              </p>
            </div>

            {customer && <AccountNav customer={customer} />}

            <div className="rounded-2xl border border-zinc-800/50 bg-zinc-900/30 p-5 backdrop-blur-sm">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                  <LifeBuoy size={20} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-medium text-zinc-200">Need help?</h3>
                  <p className="text-xs text-zinc-500 leading-relaxed">
                    Questions about your custom stickers? We're here to help.
                  </p>
                  <LocalizedClientLink 
                    href="/customer-service" 
                    className="text-xs font-medium text-indigo-400 hover:text-indigo-300 block mt-2 transition-colors"
                  >
                    Contact Support →
                  </LocalizedClientLink>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="min-h-[500px]">
             {children}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AccountLayout
