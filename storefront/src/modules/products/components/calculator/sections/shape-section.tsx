import ShapeSelector, { Shape } from "../shape-selector"
import StepCard from "./step-card"

interface ShapeSectionProps {
  shape: Shape
  onShapeChange: (shape: Shape) => void
}

export default function ShapeSection({ shape, onShapeChange }: ShapeSectionProps) {
  return (
    <StepCard
      step={2}
      title="Choose your sticker shape"
      description="Start by picking the outline that best matches your design."
    >
      <ShapeSelector selectedShape={shape} onShapeChange={onShapeChange} />
    </StepCard>
  )
}
