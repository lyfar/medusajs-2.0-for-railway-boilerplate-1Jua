'use client';

import clsx from 'clsx';
import { useState, useEffect } from 'react';

interface QuantitySelectorProps {
  onQuantityChange: (quantity: number) => void;
}

const presetQuantities = [500, 1000, 2000, 5000, 10000];

export default function QuantitySelector({ onQuantityChange }: QuantitySelectorProps) {
  const [selectedQuantity, setSelectedQuantity] = useState(500);
  const [isDragging, setIsDragging] = useState(false);

  const handleQuantitySelect = (quantity: number) => {
    setSelectedQuantity(quantity);
    onQuantityChange(quantity);
  };

  const handleSliderMouseDown = () => {
    setIsDragging(true);
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setSelectedQuantity(value);
    
    // Only trigger onQuantityChange when not dragging (on release)
    if (!isDragging) {
      onQuantityChange(value);
    }
  };

  const handleSliderMouseUp = (e: React.MouseEvent<HTMLInputElement>) => {
    const value = parseInt((e.target as HTMLInputElement).value);
    setIsDragging(false);
    onQuantityChange(value);
  };

  const handleSliderTouchEnd = (e: React.TouchEvent<HTMLInputElement>) => {
    const value = parseInt((e.target as HTMLInputElement).value);
    setIsDragging(false);
    onQuantityChange(value);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        {presetQuantities.map((quantity) => (
          <button
            key={quantity}
            onClick={() => handleQuantitySelect(quantity)}
            className={clsx(
              'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
              {
                'bg-green-600 text-white border border-green-500': selectedQuantity === quantity,
                'bg-neutral-900 text-neutral-300 border border-neutral-800 hover:bg-neutral-800': selectedQuantity !== quantity
              }
            )}
          >
            {quantity.toLocaleString()}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        <div className="text-center">
          <span className="text-3xl font-bold text-white">{selectedQuantity.toLocaleString()}</span>
          <span className="text-neutral-400 ml-2">pieces</span>
        </div>

        <div className="relative">
          <input
            type="range"
            min="500"
            max="10000"
            step="100"
            value={selectedQuantity}
            onChange={handleSliderChange}
            onMouseDown={handleSliderMouseDown}
            onMouseUp={handleSliderMouseUp}
            onTouchStart={handleSliderMouseDown}
            onTouchEnd={handleSliderTouchEnd}
            className="w-full h-3 bg-neutral-700 rounded-lg appearance-none cursor-pointer slider"
            style={{
              background: `linear-gradient(to right, #10b981 0%, #10b981 ${((selectedQuantity - 500) / 9500) * 100}%, #404040 ${((selectedQuantity - 500) / 9500) * 100}%, #404040 100%)`
            }}
          />
          <div className="flex justify-between text-xs text-neutral-500 mt-2">
            <span>Min 500</span>
            <span>Max 10,000</span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => handleQuantitySelect(Math.max(500, selectedQuantity - 500))}
            className="px-4 py-2 bg-neutral-800 text-white rounded hover:bg-neutral-700 transition-colors"
            disabled={selectedQuantity <= 500}
          >
            −500
          </button>
          <button
            onClick={() => handleQuantitySelect(Math.min(10000, selectedQuantity + 500))}
            className="px-4 py-2 bg-neutral-800 text-white rounded hover:bg-neutral-700 transition-colors"
            disabled={selectedQuantity >= 10000}
          >
            +500
          </button>
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          background: #10b981;
          cursor: pointer;
          border-radius: 50%;
          border: 2px solid #10b981;
        }
        
        .slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          background: #10b981;
          cursor: pointer;
          border-radius: 50%;
          border: 2px solid #10b981;
        }
      `}</style>
    </div>
  );
} 