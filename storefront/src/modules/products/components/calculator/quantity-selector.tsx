'use client';

import clsx from 'clsx';
import { useEffect, useState } from 'react';

interface QuantitySelectorProps {
  onQuantityChange: (quantity: number) => void;
}

type QuantityOption = '500' | '1000' | '2000' | '5000' | 'Custom';

// Predefined quantity options with marketing names
const quantityMappings: Record<QuantityOption, { quantity: number | null, name: string, description: string }> = {
  '500': { quantity: 500, name: 'Starter', description: '500 pcs • Testing' },
  '1000': { quantity: 1000, name: 'Business', description: '1K pcs • Small batch' },
  '2000': { quantity: 2000, name: 'Growth', description: '2K pcs • Scale up' },
  '5000': { quantity: 5000, name: 'Volume', description: '5K pcs • Best value' },
  'Custom': { quantity: null, name: 'Custom', description: 'Any quantity' }
};

export default function QuantitySelector({ onQuantityChange }: QuantitySelectorProps) {
  const [selectedQuantity, setSelectedQuantity] = useState<QuantityOption>('500');
  const [customQuantity, setCustomQuantity] = useState<number>(500);
  const [error, setError] = useState<string>('');

  // Helper function to find matching predefined quantity
  const findMatchingQuantity = (qty: number): QuantityOption | null => {
    for (const [option, config] of Object.entries(quantityMappings)) {
      if (config.quantity === qty) {
        return option as QuantityOption;
      }
    }
    return null;
  };

  // Sync with external quantity changes
  useEffect(() => {
    // This effect will run when the component mounts
    onQuantityChange(500); // Set initial quantity
  }, [onQuantityChange]);

  const handleQuantitySelect = (option: QuantityOption) => {
    setSelectedQuantity(option);
    setError('');
    
    if (option === 'Custom') {
      // Keep current custom quantity
      return;
    }
    
    const newQuantity = quantityMappings[option].quantity!;
    setCustomQuantity(newQuantity);
    onQuantityChange(newQuantity);
  };

  const handleCustomQuantityChange = (value: string) => {
    const numValue = parseInt(value) || 0;
    setCustomQuantity(numValue);
    
    // Validation
    if (numValue < 500) {
      setError('Minimum order is 500 pieces');
    } else if (numValue > 10000) {
      setError('Maximum order is 10,000 pieces');
    } else {
      setError('');
      onQuantityChange(numValue);
    }
  };

  const handleCustomBlur = () => {
    const validatedQuantity = Math.max(500, Math.min(10000, customQuantity || 500));
    setCustomQuantity(validatedQuantity);
    setError('');
    onQuantityChange(validatedQuantity);
  };

  const getQuantityDisplay = (option: QuantityOption): string => {
    return quantityMappings[option].description;
  };

  const getQuantityLabel = (option: QuantityOption): string => {
    return quantityMappings[option].name;
  };

  return (
    <div className="space-y-4">
      {/* Quantity Selection Buttons */}
      <div className="flex gap-2">
        {(['500', '1000', '2000', '5000', 'Custom'] as QuantityOption[]).map((option) => (
          <button
            key={option}
            onClick={() => handleQuantitySelect(option)}
            className={clsx(
              'flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
              {
                'bg-neutral-800 text-white border border-neutral-700 shadow-lg': 
                  selectedQuantity === option,
                'bg-neutral-900 text-neutral-300 border border-neutral-800 hover:bg-neutral-800 hover:border-neutral-700': 
                  selectedQuantity !== option
              }
            )}
          >
            <div className="font-bold">{getQuantityLabel(option)}</div>
            <div className="text-xs opacity-70 mt-0.5">
              {getQuantityDisplay(option)}
            </div>
          </button>
        ))}
      </div>

      {/* Custom Quantity Input */}
      {selectedQuantity === 'Custom' && (
        <div className="overflow-hidden">
          <div className="animate-in slide-in-from-top-2 duration-300">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                Quantity (pieces)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="500"
                  max="10000"
                  step="50"
                  placeholder="Enter quantity"
                  className="w-full rounded-lg bg-neutral-800 border border-neutral-700 px-4 py-2 text-white placeholder-neutral-500 focus:border-blue-500 focus:outline-none transition-colors"
                  value={customQuantity || ''}
                  onChange={(e) => handleCustomQuantityChange(e.target.value)}
                  onBlur={handleCustomBlur}
                />
                {error && (
                  <p className="absolute -bottom-6 left-0 text-xs text-red-400">
                    {error}
                  </p>
                )}
              </div>
              <p className="text-xs text-neutral-500">
                Minimum: 500 pieces • Maximum: 10,000 pieces
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 