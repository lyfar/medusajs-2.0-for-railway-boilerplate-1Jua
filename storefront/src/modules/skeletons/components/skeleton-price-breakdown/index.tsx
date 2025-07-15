const SkeletonPriceBreakdown = () => {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex justify-between mb-2">
          <div className="w-40 h-5 bg-muted animate-pulse rounded-md"></div>
          <div className="w-20 h-5 bg-muted animate-pulse rounded-md"></div>
        </div>
        <div className="w-full h-3 bg-muted animate-pulse rounded-md mt-2"></div>
        <div className="w-4/5 h-3 bg-muted animate-pulse rounded-md mt-2"></div>
      </div>

      <div>
        <div className="flex justify-between mb-2">
          <div className="w-48 h-5 bg-muted animate-pulse rounded-md"></div>
          <div className="w-16 h-5 bg-muted animate-pulse rounded-md"></div>
        </div>
        <div className="w-full h-3 bg-muted animate-pulse rounded-md mt-2"></div>
        <div className="w-3/4 h-3 bg-muted animate-pulse rounded-md mt-2"></div>
      </div>

      <div className="mt-6 border-t border-neutral-800 pt-6">
        <div className="flex justify-between mb-2">
          <div className="w-32 h-7 bg-muted animate-pulse rounded-md"></div>
          <div className="w-24 h-7 bg-muted animate-pulse rounded-md"></div>
        </div>
        <div className="w-36 h-4 bg-muted animate-pulse rounded-md mt-2 ml-auto"></div>
        
        <div className="bg-neutral-800/50 rounded-lg p-6 mt-4 space-y-3">
          <div className="w-56 h-4 bg-muted animate-pulse rounded-md"></div>
          <div className="w-full h-3 bg-muted animate-pulse rounded-md"></div>
          <div className="w-full h-3 bg-muted animate-pulse rounded-md"></div>
          <div className="w-5/6 h-3 bg-muted animate-pulse rounded-md"></div>
          <div className="w-3/4 h-3 bg-muted animate-pulse rounded-md"></div>
          <div className="w-48 h-3 bg-muted animate-pulse rounded-md mt-2"></div>
        </div>
      </div>
    </div>
  )
}

export default SkeletonPriceBreakdown