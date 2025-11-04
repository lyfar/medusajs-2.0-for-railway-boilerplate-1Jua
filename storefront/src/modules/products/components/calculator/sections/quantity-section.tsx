import QuantitySelector from "../quantity-selector"
import StepCard from "./step-card"

interface QuantitySectionProps {
  onQuantityChange: (quantity: number) => void
}

export default function QuantitySection({ onQuantityChange }: QuantitySectionProps) {
  return (
    <StepCard
      step={4}
      title="Choose quantity"
      description="Pick a preset batch or enter a custom amount that fits your project."
    >
      <QuantitySelector onQuantityChange={onQuantityChange} />
    </StepCard>
  )
}
