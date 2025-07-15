const SkeletonCodeForm = () => {
  return (
    <div className="w-full flex flex-col">
      <div className="bg-muted h-7 w-24 mb-4 animate-pulse rounded-md"></div>
      <div className="grid grid-cols-[1fr_80px] gap-x-2">
        <div className="bg-muted h-12 animate-pulse rounded-md"></div>
        <div className="bg-muted h-12 animate-pulse rounded-md"></div>
      </div>
    </div>
  )
}

export default SkeletonCodeForm
