import ImageDropZone, { type AutoConfigureSuggestion } from "../image-drop-zone"
import { Shape } from "../shape-selector"
import { Dimensions } from "../types"
import { DesignDraftState } from "../utils/design-storage"
import StepCard from "./step-card"
import type { Orientation } from "../orientation"

interface DesignUploadSectionProps {
  shape: Shape
  dimensions: Dimensions
  onDesignChange?: (state: DesignDraftState | null) => void
  onAutoConfigure?: (suggestion: AutoConfigureSuggestion) => void
  orientation?: Orientation
  onOrientationChange?: (orientation: Orientation) => void
  disabled?: boolean
}

export default function DesignUploadSection({
  shape,
  dimensions,
  onDesignChange,
  onAutoConfigure,
  orientation,
  onOrientationChange,
  disabled,
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
    </StepCard>
  )
}
