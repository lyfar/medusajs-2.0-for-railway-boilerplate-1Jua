import ImageDropZone, { type AutoConfigureSuggestion } from "../image-drop-zone"
import { Shape } from "../shape-selector"
import { Dimensions } from "../types"
import { DesignDraftState } from "../utils/design-storage"
import StepCard from "./step-card"
import type { Orientation } from "../orientation"
import MobileControlRail from "../mobile-control-rail"

interface DesignUploadSectionProps {
  shape: Shape
  dimensions: Dimensions
  onDesignChange?: (state: DesignDraftState | null) => void
  onAutoConfigure?: (suggestion: AutoConfigureSuggestion) => void
  orientation?: Orientation
  onOrientationChange?: (orientation: Orientation) => void
  disabled?: boolean
  quantity?: number
  onShapeChange?: (shape: Shape) => void
  onSizeChange?: (dimensions: Dimensions) => void
  onQuantityChange?: (quantity: number) => void
  onOrientationToggle?: () => void
  canAdjustOrientation?: boolean
}

export default function DesignUploadSection({
  shape,
  dimensions,
  onDesignChange,
  onAutoConfigure,
  orientation,
  onOrientationChange,
  disabled,
  quantity,
  onShapeChange,
  onSizeChange,
  onQuantityChange,
  onOrientationToggle,
  canAdjustOrientation,
}: DesignUploadSectionProps) {
  return (
    <StepCard
      step={1}
      title="Upload your design"
      description="Drag and drop your artwork or browse files. We’ll preview how it fits your sticker."
      contentClassName="mt-6"
    >
      <ImageDropZone
        shape={shape}
        dimensions={dimensions}
        onDesignChange={onDesignChange}
        onAutoConfigure={onAutoConfigure}
        orientation={orientation}
        onOrientationChange={onOrientationChange}
        disabled={disabled}
        compact={false}
      />
      {typeof quantity === "number" &&
        onShapeChange &&
        onSizeChange &&
        onQuantityChange && (
          <div className="md:hidden">
            <MobileControlRail
              shape={shape}
              dimensions={dimensions}
              quantity={quantity}
              onShapeChange={onShapeChange}
              onSizeChange={onSizeChange}
              onQuantityChange={onQuantityChange}
              orientation={orientation}
              onOrientationToggle={onOrientationToggle}
              canAdjustOrientation={canAdjustOrientation}
            />
          </div>
        )}
    </StepCard>
  )
}
