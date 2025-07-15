import SkeletonCartTotals from "@modules/skeletons/components/skeleton-cart-totals"

const SkeletonOrderInformation = () => {
  return (
    <div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 py-10 border-b border-border">
        <div className="flex flex-col">
          <div className="w-32 h-4 bg-muted mb-4 animate-pulse rounded-md"></div>
          <div className="w-2/6 h-3 bg-muted animate-pulse rounded-md"></div>
          <div className="w-3/6 h-3 bg-muted my-2 animate-pulse rounded-md"></div>
          <div className="w-1/6 h-3 bg-muted animate-pulse rounded-md"></div>
        </div>
        <div className="flex flex-col">
          <div className="w-32 h-4 bg-muted mb-4 animate-pulse rounded-md"></div>
          <div className="w-2/6 h-3 bg-muted animate-pulse rounded-md"></div>
          <div className="w-3/6 h-3 bg-muted my-2 animate-pulse rounded-md"></div>
          <div className="w-2/6 h-3 bg-muted animate-pulse rounded-md"></div>
          <div className="w-1/6 h-3 bg-muted mt-2 animate-pulse rounded-md"></div>
          <div className="w-32 h-4 bg-muted my-4 animate-pulse rounded-md"></div>
          <div className="w-1/6 h-3 bg-muted animate-pulse rounded-md"></div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 py-10">
        <div className="flex flex-col">
          <div className="w-32 h-4 bg-muted mb-4 animate-pulse rounded-md"></div>
          <div className="w-2/6 h-3 bg-muted animate-pulse rounded-md"></div>
          <div className="w-3/6 h-3 bg-muted my-4 animate-pulse rounded-md"></div>
        </div>

        <SkeletonCartTotals />
      </div>
    </div>
  )
}

export default SkeletonOrderInformation
