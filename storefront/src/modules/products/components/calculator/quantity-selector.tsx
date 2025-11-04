'use client';

import clsx from 'clsx'
import { useEffect, useMemo, useState } from 'react'

interface QuantitySelectorProps {
  onQuantityChange: (quantity: number) => void;
}

type QuantityOption = '500' | '1000' | '2000' | '5000' | 'Custom';

// Predefined quantity options with marketing names
const quantityMappings: Record<QuantityOption, { quantity: number | null, name: string, description: string }> = {
  '500': { quantity: 500, name: 'Starter', description: '500 pieces' },
  '1000': { quantity: 1000, name: 'Business', description: '1,000 pieces' },
  '2000': { quantity: 2000, name: 'Growth', description: '2,000 pieces' },
  '5000': { quantity: 5000, name: 'Volume', description: '5,000 pieces' },
  'Custom': { quantity: null, name: 'Custom', description: 'Set your quantity' }
};

export default function QuantitySelector({ onQuantityChange }: QuantitySelectorProps) {
  const [selectedQuantity, setSelectedQuantity] = useState<QuantityOption>('500')
  const [sliderQuantity, setSliderQuantity] = useState<number>(500)

  // Helper function to find matching predefined quantity
  useEffect(() => {
    onQuantityChange(500)
  }, [onQuantityChange])

  const handleQuantitySelect = (option: QuantityOption) => {
    setSelectedQuantity(option)

    if (option === 'Custom') {
      return
    }

    const newQuantity = quantityMappings[option].quantity!
    setSliderQuantity(newQuantity)
    onQuantityChange(newQuantity)
  }

  useEffect(() => {
    if (selectedQuantity !== 'Custom') return

    const timer = setTimeout(() => {
      onQuantityChange(sliderQuantity)
    }, 200)

    return () => clearTimeout(timer)
  }, [sliderQuantity, selectedQuantity, onQuantityChange])

  const sliderDisplayValue = useMemo(
    () => sliderQuantity.toLocaleString(),
    [sliderQuantity]
  )

  const getQuantityDisplay = (option: QuantityOption): string => {
    return quantityMappings[option].description;
  };

  const getQuantityLabel = (option: QuantityOption): string => {
    return quantityMappings[option].name;
  };

  return (
    <div className="space-y-4">
      <div className="grid auto-rows-fr grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {(['500', '1000', '2000', '5000', 'Custom'] as QuantityOption[]).map((option) => {
          const isSelected = selectedQuantity === option

          return (
            <button
              key={option}
              onClick={() => handleQuantitySelect(option)}
              className={clsx(
                'h-full w-full rounded-rounded border px-4 py-3 text-left text-sm transition-colors',
                isSelected
                  ? 'border-ui-border-strong bg-ui-bg-field text-ui-fg-base shadow-elevation-card-hover'
                  : 'border-ui-border-base bg-ui-bg-subtle text-ui-fg-subtle hover:bg-ui-bg-base hover:text-ui-fg-base'
              )}
            >
              <div className="text-sm font-semibold text-ui-fg-base">
                {getQuantityLabel(option)}
              </div>
              <div className="text-xs text-ui-fg-muted">{getQuantityDisplay(option)}</div>
            </button>
          )
        })}
      </div>

      {selectedQuantity === 'Custom' && (
        <div className="space-y-4 rounded-rounded border border-ui-border-base bg-ui-bg-subtle p-4">
          <div className="flex items-center justify-between text-sm text-ui-fg-muted">
            <span>Quantity</span>
            <span className="font-medium text-ui-fg-base">{sliderDisplayValue} pcs</span>
          </div>
          <input
            type="range"
            min={500}
            max={20000}
            step={500}
            value={sliderQuantity}
            onChange={(event) => setSliderQuantity(Number(event.target.value))}
            className="w-full"
            style={{ accentColor: 'var(--fg-interactive)' }}
          />
          <div className="flex justify-between text-xs text-ui-fg-muted">
            <span>500</span>
            <span>20,000</span>
          </div>
          <p className="text-xs text-ui-fg-muted">
            Need more than 20,000 pieces? Contact us for a custom quote.
          </p>
        </div>
      )}
    </div>
  )
}
