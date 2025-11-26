import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { convertToLocale } from "@lib/util/money"
import { Package, User, MapPin, ChevronRight, ArrowUpRight } from "lucide-react"

type OverviewProps = {
  customer: HttpTypes.StoreCustomer | null
  orders: HttpTypes.StoreOrder[] | null
}

const Overview = ({ customer, orders }: OverviewProps) => {
  const profileCompletion = getProfileCompletion(customer)
  const addressCount = customer?.addresses?.length || 0
  const recentOrders = orders?.slice(0, 3) || []

  return (
    <div data-testid="overview-page-wrapper" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard 
          label="Profile Completion" 
          value={`${profileCompletion}%`} 
          icon={<User size={20} />}
          helper="Complete your details"
          trend={profileCompletion === 100 ? "good" : "neutral"}
        />
        <StatCard 
          label="Saved Addresses" 
          value={addressCount} 
          icon={<MapPin size={20} />}
          helper="Delivery locations" 
        />
      </div>

      {/* Recent Orders Section */}
      <div className="rounded-2xl border border-zinc-800/50 bg-zinc-900/30 backdrop-blur-xl overflow-hidden">
        <div className="p-6 border-b border-zinc-800/50 flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-lg font-medium text-white">Recent Orders</h2>
            <p className="text-sm text-zinc-500">Track your latest sticker shipments</p>
          </div>
          <LocalizedClientLink 
            href="/account/orders" 
            className="group flex items-center gap-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
          >
            View all 
            <ArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </LocalizedClientLink>
        </div>

        <div className="p-2">
          {recentOrders.length > 0 ? (
            <div className="space-y-2">
              {recentOrders.map((order) => (
                <LocalizedClientLink
                  key={order.id}
                  href={`/account/orders/details/${order.id}`}
                  className="group block"
                >
                  <div className="flex items-center justify-between p-4 rounded-xl hover:bg-white/5 border border-transparent hover:border-zinc-800/50 transition-all duration-200">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-500 group-hover:scale-110 group-hover:bg-indigo-500/10 group-hover:text-indigo-400 transition-all duration-300">
                        <Package size={20} />
                      </div>
                      <div>
                        <p className="text-white font-medium">Order #{order.display_id}</p>
                        <p className="text-xs text-zinc-500 mt-0.5">
                          {new Date(order.created_at).toLocaleDateString(undefined, { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right hidden sm:block">
                        <p className="text-sm font-medium text-white">
                          {convertToLocale({
                            amount: order.total,
                            currency_code: order.currency_code,
                          })}
                        </p>
                        <p className="text-xs text-zinc-500 mt-0.5">
                          {order.items.length} items
                        </p>
                      </div>
                      <ChevronRight size={16} className="text-zinc-600 group-hover:text-white group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </LocalizedClientLink>
              ))}
            </div>
          ) : (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-zinc-800/50 flex items-center justify-center text-zinc-600 mb-2">
                <Package size={24} />
              </div>
              <p className="text-zinc-400 font-medium">No orders yet</p>
              <p className="text-sm text-zinc-600 max-w-xs mx-auto">
                When you place an order, it will appear here for tracking.
              </p>
              <LocalizedClientLink href="/store" className="mt-4">
                <button className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
                  Start Shopping
                </button>
              </LocalizedClientLink>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const getProfileCompletion = (customer: HttpTypes.StoreCustomer | null) => {
  let count = 0

  if (!customer) {
    return 0
  }

  if (customer.email) {
    count++
  }

  if (customer.first_name && customer.last_name) {
    count++
  }

  if (customer.phone) {
    count++
  }

  const billingAddress = customer.addresses?.find(
    (addr) => addr.is_default_billing
  )

  if (billingAddress) {
    count++
  }

  return (count / 4) * 100
}

const StatCard = ({ 
  label, 
  value, 
  helper, 
  icon,
  trend 
}: { 
  label: string; 
  value: string | number; 
  helper?: string;
  icon?: React.ReactNode;
  trend?: "good" | "neutral" | "bad"
}) => {
  return (
    <div className="rounded-2xl border border-zinc-800/50 bg-zinc-900/30 backdrop-blur-xl p-5 relative overflow-hidden group hover:border-zinc-700/50 transition-colors">
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        {icon}
      </div>
      
      <div className="relative z-10">
        <div className="flex items-center gap-2 text-zinc-500 mb-3">
          {icon && <span className="text-zinc-400">{icon}</span>}
          <span className="text-xs font-medium uppercase tracking-wider">{label}</span>
        </div>
        
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-semibold text-white tracking-tight">{value}</span>
        </div>
        
        {helper && (
          <p className="text-xs text-zinc-500 mt-2 font-medium">
            {helper}
          </p>
        )}
      </div>
    </div>
  )
}

export default Overview
