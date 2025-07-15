import { Container } from "@medusajs/ui"

const SkeletonProductPreview = () => {
  return (
    <div className="animate-pulse">
      <Container className="aspect-[9/16] w-full bg-muted rounded-md" />
      <div className="flex justify-between text-base-regular mt-2">
        <div className="w-2/5 h-6 bg-muted rounded-md"></div>
        <div className="w-1/5 h-6 bg-muted rounded-md"></div>
      </div>
    </div>
  )
}

export default SkeletonProductPreview
