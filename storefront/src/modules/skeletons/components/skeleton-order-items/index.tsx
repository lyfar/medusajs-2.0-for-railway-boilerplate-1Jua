const SkeletonOrderItems = () => {
  return (
    <div className="flex flex-col gap-y-4 py-10 border-y border-border">
      <div className="grid grid-cols-[122px_1fr] gap-x-4">
        <div className="w-full aspect-[29/34] bg-muted animate-pulse rounded-md"></div>
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-y-2">
            <div className="w-48 h-6 bg-muted animate-pulse rounded-md"></div>
            <div className="w-24 h-4 bg-muted animate-pulse rounded-md"></div>
            <div className="w-32 h-4 bg-muted animate-pulse rounded-md"></div>
          </div>
          <div className="w-32 h-6 bg-muted animate-pulse rounded-md"></div>
        </div>
      </div>

      <div className="grid grid-cols-[122px_1fr] gap-x-4">
        <div className="w-full aspect-[29/34] bg-muted animate-pulse rounded-md"></div>
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-y-2">
            <div className="w-48 h-6 bg-muted animate-pulse rounded-md"></div>
            <div className="w-24 h-4 bg-muted animate-pulse rounded-md"></div>
            <div className="w-32 h-4 bg-muted animate-pulse rounded-md"></div>
          </div>
          <div className="w-32 h-6 bg-muted animate-pulse rounded-md"></div>
        </div>
      </div>

      <div className="grid grid-cols-[122px_1fr] gap-x-4">
        <div className="w-full aspect-[29/34] bg-muted animate-pulse rounded-md"></div>
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-y-2">
            <div className="w-48 h-6 bg-muted animate-pulse rounded-md"></div>
            <div className="w-24 h-4 bg-muted animate-pulse rounded-md"></div>
            <div className="w-32 h-4 bg-muted animate-pulse rounded-md"></div>
          </div>
          <div className="w-32 h-6 bg-muted animate-pulse rounded-md"></div>
        </div>
      </div>
    </div>
  )
}

export default SkeletonOrderItems
