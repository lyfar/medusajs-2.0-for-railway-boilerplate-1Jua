import SizeInput from "../size-input"
import { Shape } from "../shape-selector"
import { Dimensions } from "../types"
import StepCard from "./step-card"

interface SizeSectionProps {
  shape: Shape
  dimensions: Dimensions
  onSizeChange: (dimensions: Dimensions) => void
}

export default function SizeSection({ shape, dimensions, onSizeChange }: SizeSectionProps) {
  return (
    <StepCard
      step={3}
      title="Set sticker size"
      description="Adjust width and height or choose a preset that matches your needs."
      infoTitle="Sizing tips"
      infoDescription="Enter width/height (or diameter) between 1–50 cm. Keep proportions close to your design and choose Custom if you need an exact fit."
    >
      <SizeInput shape={shape} dimensions={dimensions} onSizeChange={onSizeChange} />
    </StepCard>
  )
}
