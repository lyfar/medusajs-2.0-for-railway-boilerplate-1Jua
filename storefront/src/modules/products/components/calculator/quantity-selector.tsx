'use client';

import clsx from 'clsx'
import { useEffect, useMemo, useState } from 'react'

interface QuantitySelectorProps {
  quantity: number
  onQuantityChange: (quantity: number) => void
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

const determineOption = (quantity: number): QuantityOption => {
  const match = (Object.keys(quantityMappings) as QuantityOption[]).find((option) => {
    const target = quantityMappings[option].quantity
    return target !== null && target === quantity
  })
  return match ?? 'Custom'
}

export default function QuantitySelector({ quantity, onQuantityChange }: QuantitySelectorProps) {
  const [selectedQuantity, setSelectedQuantity] = useState<QuantityOption>(() => determineOption(quantity))
  const [sliderQuantity, setSliderQuantity] = useState<number>(quantity || 500)

  useEffect(() => {
    const option = determineOption(quantity)
    setSelectedQuantity(option)
    if (option === 'Custom') {
      setSliderQuantity(quantity)
    } else if (quantityMappings[option].quantity) {
      setSliderQuantity(quantityMappings[option].quantity!)
    }
  }, [quantity])

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
      <div className="grid auto-rows-fr grid-cols-2 gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
        {(['500', '1000', '2000', '5000', 'Custom'] as QuantityOption[]).map((option) => {
          const isSelected = selectedQuantity === option

          return (
            <button
              key={option}
              onClick={() => handleQuantitySelect(option)}
              className={clsx(
                'h-full w-full rounded-lg border px-3 py-3.5 text-left text-sm transition-all active:scale-95 min-h-[60px] sm:min-h-[68px]',
                isSelected
                  ? 'border-ui-border-strong bg-ui-bg-field text-ui-fg-base shadow-elevation-card-hover ring-2 ring-indigo-500/20'
                  : 'border-ui-border-base bg-ui-bg-subtle text-ui-fg-subtle hover:bg-ui-bg-base hover:text-ui-fg-base active:bg-ui-bg-field'
              )}
            >
              <div className="text-sm font-semibold text-ui-fg-base leading-tight">
                {getQuantityLabel(option)}
              </div>
              <div className="text-xs text-ui-fg-muted mt-1 leading-tight">{getQuantityDisplay(option)}</div>
            </button>
          )
        })}
      </div>

      {selectedQuantity === 'Custom' && (
        <div className="space-y-4 rounded-xl border border-ui-border-base bg-ui-bg-subtle p-4 sm:p-5">
          <div className="flex items-center justify-between text-sm text-ui-fg-muted">
            <span className="font-medium">Custom Quantity</span>
            <span className="font-bold text-ui-fg-base text-lg">{sliderDisplayValue}</span>
          </div>
          <div className="space-y-3">
            <input
              type="range"
              min={500}
              max={20000}
              step={500}
              value={sliderQuantity}
              onChange={(event) => setSliderQuantity(Number(event.target.value))}
              className="w-full h-2 rounded-lg appearance-none cursor-pointer"
              style={{ 
                accentColor: 'var(--fg-interactive)',
              }}
            />
            <div className="flex justify-between text-xs text-ui-fg-muted font-medium">
              <span>500</span>
              <span>20,000</span>
            </div>
          </div>
          <p className="text-xs text-ui-fg-muted leading-relaxed rounded-md bg-ui-bg-base px-3 py-2">
            💡 Need more than 20,000 pieces? Contact us for a custom quote and bulk pricing.
          </p>
        </div>
      )}
    </div>
  )
}
