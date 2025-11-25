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
      infoTitle="Quantity guidance"
      infoDescription="Pick a preset for quick pricing or drag the slider for a custom run up to 20,000 pcs. Larger batches reduce cost per piece."
    >
      <QuantitySelector quantity={quantity} onQuantityChange={onQuantityChange} />
    </StepCard>
  )
}
