const SkeletonCartTotals = ({ header = true }) => {
  return (
    <div className="flex flex-col">
      {header && <div className="w-32 h-4 bg-muted mb-4 animate-pulse rounded-md"></div>}
      <div className="flex items-center justify-between">
        <div className="w-32 h-3 bg-muted animate-pulse rounded-md"></div>
        <div className="w-32 h-3 bg-muted animate-pulse rounded-md"></div>
      </div>

      <div className="flex items-center justify-between my-4">
        <div className="w-24 h-3 bg-muted animate-pulse rounded-md"></div>
        <div className="w-24 h-3 bg-muted animate-pulse rounded-md"></div>
      </div>

      <div className="flex items-center justify-between">
        <div className="w-28 h-3 bg-muted animate-pulse rounded-md"></div>
        <div className="w-20 h-3 bg-muted animate-pulse rounded-md"></div>
      </div>

      <div className="w-full border-b border-border border-dashed my-4"></div>

      <div className="flex items-center justify-between">
        <div className="w-32 h-6 bg-muted mb-4 animate-pulse rounded-md"></div>
        <div className="w-24 h-6 bg-muted mb-4 animate-pulse rounded-md"></div>
      </div>
    </div>
  )
}

export default SkeletonCartTotals
