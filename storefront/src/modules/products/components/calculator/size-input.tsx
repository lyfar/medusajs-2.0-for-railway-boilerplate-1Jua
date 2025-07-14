'use client';

import clsx from 'clsx';
import { useEffect, useState } from 'react';
import { Shape } from './shape-selector';

interface SizeInputProps {
  shape: Shape;
  dimensions: { width?: number; height?: number; diameter?: number };
  onSizeChange: (dimensions: { width?: number; height?: number; diameter?: number }) => void;
}

type RectangularSize = {
  label: string;
  width: number;
  height: number;
};

type CircularSize = {
  label: string;
  diameter: number;
};

const standardSizes: Record<Shape, (RectangularSize | CircularSize)[]> = {
  rectangle: [
    { label: '10 x 6 cm', width: 10, height: 6 },
    { label: '4 x 7 cm', width: 4, height: 7 },
    { label: '6 x 8 cm', width: 6, height: 8 },
    { label: '15 x 5 cm', width: 15, height: 5 },
    { label: '5 x 15 cm', width: 5, height: 15 }
  ],
  square: [
    { label: '8 x 8 cm', width: 8, height: 8 },
    { label: '4 x 4 cm', width: 4, height: 4 },
    { label: '10 x 10 cm', width: 10, height: 10 },
    { label: '12 x 12 cm', width: 12, height: 12 }
  ],
  diecut: [
    { label: '15 x 5 cm', width: 15, height: 5 },
    { label: '8 x 6 cm', width: 8, height: 6 },
    { label: '10 x 10 cm', width: 10, height: 10 },
    { label: '7 x 4 cm', width: 7, height: 4 },
    { label: '10 x 6 cm', width: 10, height: 6 }
  ],
  circle: [
    { label: '12 cm', diameter: 12 },
    { label: '2.5 cm', diameter: 2.5 },
    { label: '5 cm', diameter: 5 },
    { label: '7.5 cm', diameter: 7.5 },
    { label: '10 cm', diameter: 10 }
  ]
};

function isCircularSize(size: RectangularSize | CircularSize): size is CircularSize {
  return 'diameter' in size;
}

export default function SizeInput({ shape, dimensions, onSizeChange }: SizeInputProps) {
  const [isCustom, setIsCustom] = useState(false);
  const [selectedSize, setSelectedSize] = useState<RectangularSize | CircularSize | null>(null);
  const [customDimensions, setCustomDimensions] = useState({
    width: 0,
    height: 0,
    diameter: 0
  });

  // Sync with external dimensions
  useEffect(() => {
    // Find matching standard size
    const currentSizes = standardSizes[shape];
    const matchingSize = currentSizes.find(size => {
      if (isCircularSize(size)) {
        return size.diameter === dimensions.diameter;
      } else {
        return size.width === dimensions.width && size.height === dimensions.height;
      }
    });

    if (matchingSize) {
      setSelectedSize(matchingSize);
      setIsCustom(false);
    } else if (dimensions.width || dimensions.height || dimensions.diameter) {
      setCustomDimensions({
        width: dimensions.width || 0,
        height: dimensions.height || 0,
        diameter: dimensions.diameter || 0
      });
      setIsCustom(true);
      setSelectedSize(null);
    }
  }, [shape, dimensions]);

  const handleSizeSelect = (size: RectangularSize | CircularSize) => {
    setSelectedSize(size);
    setIsCustom(false);
    if (isCircularSize(size)) {
      onSizeChange({ diameter: size.diameter });
    } else {
      onSizeChange({ width: size.width, height: size.height });
    }
  };

  const handleCustomDimensionChange = (dimension: string, value: string) => {
    const numValue = parseFloat(value);
    const newDimensions = { ...customDimensions, [dimension]: numValue };
    setCustomDimensions(newDimensions);
    onSizeChange(newDimensions);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {standardSizes[shape].map((size, index) => (
          <button
            key={index}
            onClick={() => handleSizeSelect(size)}
            className={clsx(
              'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
              {
                'bg-neutral-800 text-white border border-neutral-700': 
                  selectedSize === size && !isCustom,
                'bg-neutral-900 text-neutral-300 border border-neutral-800 hover:bg-neutral-800': 
                  selectedSize !== size || isCustom
              }
            )}
          >
            {size.label}
          </button>
        ))}
      </div>

      <div className="flex items-center space-x-2">
        <button
          onClick={() => setIsCustom(true)}
          className={clsx(
            'w-full rounded-lg px-4 py-2 text-sm font-medium transition-colors',
            {
              'bg-neutral-800 text-white border border-neutral-700': isCustom,
              'bg-neutral-900 text-neutral-300 border border-neutral-800 hover:bg-neutral-800': !isCustom
            }
          )}
        >
          Custom Size
        </button>
      </div>

      {isCustom && (
        <div className="grid gap-4">
          {shape === 'circle' ? (
            <div>
              <label className="block text-sm font-medium text-neutral-300">
                Diameter (cm)
              </label>
              <input
                type="number"
                min="1"
                step="0.1"
                className="mt-1 w-full rounded-lg bg-neutral-800 border border-neutral-700 px-4 py-2 text-white"
                value={customDimensions.diameter || ''}
                onChange={(e) => handleCustomDimensionChange('diameter', e.target.value)}
              />
            </div>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-neutral-300">
                  Width (cm)
                </label>
                <input
                  type="number"
                  min="1"
                  step="0.1"
                  className="mt-1 w-full rounded-lg bg-neutral-800 border border-neutral-700 px-4 py-2 text-white"
                  value={customDimensions.width || ''}
                  onChange={(e) => handleCustomDimensionChange('width', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-300">
                  Height (cm)
                </label>
                <input
                  type="number"
                  min="1"
                  step="0.1"
                  className="mt-1 w-full rounded-lg bg-neutral-800 border border-neutral-700 px-4 py-2 text-white"
                  value={customDimensions.height || ''}
                  onChange={(e) => handleCustomDimensionChange('height', e.target.value)}
                />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
} 