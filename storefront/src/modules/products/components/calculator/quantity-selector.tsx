'use client';

import clsx from 'clsx';
import { useState } from 'react';

interface QuantitySelectorProps {
  onQuantityChange: (quantity: number) => void;
}

const presetQuantities = [500, 1000, 2000, 5000];

export default function QuantitySelector({ onQuantityChange }: QuantitySelectorProps) {
  const [selectedQuantity, setSelectedQuantity] = useState(500);
  const [isCustom, setIsCustom] = useState(false);

  const handleQuantitySelect = (quantity: number) => {
    setSelectedQuantity(quantity);
    setIsCustom(false);
    onQuantityChange(quantity);
  };

  const handleCustomQuantityChange = (value: string) => {
    const quantity = Math.max(500, parseInt(value) || 500);
    setSelectedQuantity(quantity);
    onQuantityChange(quantity);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {presetQuantities.map((quantity) => (
          <button
            key={quantity}
            onClick={() => handleQuantitySelect(quantity)}
            className={clsx(
              'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
              {
                'bg-neutral-800 text-white border border-neutral-700': selectedQuantity === quantity && !isCustom,
                'bg-neutral-900 text-neutral-300 border border-neutral-800 hover:bg-neutral-800': selectedQuantity !== quantity || isCustom
              }
            )}
          >
            {quantity.toLocaleString()}
          </button>
        ))}
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="number"
          min="500"
          step="100"
          className="w-full rounded-lg bg-neutral-800 text-white border border-neutral-700 px-4 py-2"
          placeholder="Custom quantity (min. 500)"
          value={isCustom ? selectedQuantity : ''}
          onChange={(e) => {
            setIsCustom(true);
            handleCustomQuantityChange(e.target.value);
          }}
        />
      </div>
    </div>
  );
} 