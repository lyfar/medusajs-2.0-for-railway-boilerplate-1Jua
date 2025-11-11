import QuantitySelector from "../quantity-selector"
import StepCard from "./step-card"

interface QuantitySectionProps {
  quantity: number
  onQuantityChange: (quantity: number) => void
}

export default function QuantitySection({ quantity, onQuantityChange }: QuantitySectionProps) {
  return (
    <StepCard
      step={4}
      title="Choose quantity"
      description="Pick a preset batch or enter a custom amount that fits your project."
    >
      <QuantitySelector quantity={quantity} onQuantityChange={onQuantityChange} />
    </StepCard>
  )
}
