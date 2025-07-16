'use client';

import clsx from 'clsx';
import { useEffect, useState } from 'react';
import { Shape } from './shape-selector';

interface SizeInputProps {
  shape: Shape;
  dimensions: { width?: number; height?: number; diameter?: number };
  onSizeChange: (dimensions: { width?: number; height?: number; diameter?: number }) => void;
}

type SizeOption = 'S' | 'M' | 'L' | 'XL' | 'Custom';

interface Dimensions {
  width?: number;
  height?: number;
  diameter?: number;
}

// Predefined sizes for each shape and size option
const sizeMappings: Record<Shape, Record<SizeOption, Dimensions>> = {
  rectangle: {
    S: { width: 4, height: 7 },
    M: { width: 6, height: 8 },
    L: { width: 10, height: 6 },
    XL: { width: 15, height: 5 },
    Custom: {}
  },
  square: {
    S: { width: 4, height: 4 },
    M: { width: 8, height: 8 },
    L: { width: 10, height: 10 },
    XL: { width: 12, height: 12 },
    Custom: {}
  },
  circle: {
    S: { diameter: 2.5 },
    M: { diameter: 5 },
    L: { diameter: 7.5 },
    XL: { diameter: 10 },
    Custom: {}
  },
  diecut: {
    S: { width: 7, height: 4 },
    M: { width: 8, height: 6 },
    L: { width: 10, height: 6 },
    XL: { width: 15, height: 5 },
    Custom: {}
  }
};

export default function SizeInput({ shape, dimensions, onSizeChange }: SizeInputProps) {
  const [selectedSize, setSelectedSize] = useState<SizeOption>('L');
  const [customDimensions, setCustomDimensions] = useState<Dimensions>({
    width: 0,
    height: 0,
    diameter: 0
  });

  // Helper function to check if current dimensions match a predefined size
  const findMatchingSize = (dims: Dimensions): SizeOption | null => {
    const currentMappings = sizeMappings[shape];
    
    for (const [size, sizeDims] of Object.entries(currentMappings)) {
      if (size === 'Custom') continue;
      
      if (shape === 'circle') {
        if (sizeDims.diameter === dims.diameter) {
          return size as SizeOption;
        }
      } else {
        if (sizeDims.width === dims.width && sizeDims.height === dims.height) {
          return size as SizeOption;
        }
      }
    }
    
    return null;
  };

  // Sync with external dimensions changes
  useEffect(() => {
    const matchingSize = findMatchingSize(dimensions);
    
    if (matchingSize) {
      setSelectedSize(matchingSize);
    } else if (dimensions.width || dimensions.height || dimensions.diameter) {
      setSelectedSize('Custom');
      setCustomDimensions({
        width: dimensions.width || 0,
        height: dimensions.height || 0,
        diameter: dimensions.diameter || 0
      });
    }
  }, [shape, dimensions]);

  const handleSizeSelect = (size: SizeOption) => {
    setSelectedSize(size);
    
    if (size === 'Custom') {
      // Keep current custom dimensions
      return;
    }
    
    const newDimensions = sizeMappings[shape][size];
    onSizeChange(newDimensions);
  };

  const handleCustomDimensionChange = (dimension: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    const newCustomDimensions = { ...customDimensions, [dimension]: numValue };
    setCustomDimensions(newCustomDimensions);
    
    // Only update if we have valid dimensions
    if (shape === 'circle' && numValue > 0) {
      onSizeChange({ diameter: numValue });
    } else if (shape !== 'circle' && newCustomDimensions.width && newCustomDimensions.height && newCustomDimensions.width > 0 && newCustomDimensions.height > 0) {
      onSizeChange({ 
        width: newCustomDimensions.width, 
        height: newCustomDimensions.height 
      });
    }
  };

  const getDimensionDisplay = (size: SizeOption): string => {
    if (size === 'Custom') return 'Custom';
    
    const dims = sizeMappings[shape][size];
    if (shape === 'circle') {
      return `${dims.diameter}cm ⌀`;
    } else {
      return `${dims.width}×${dims.height}cm`;
    }
  };

  return (
    <div className="space-y-4">
      {/* Size Selection Buttons */}
      <div className="flex gap-2">
        {(['S', 'M', 'L', 'XL', 'Custom'] as SizeOption[]).map((size) => (
          <button
            key={size}
            onClick={() => handleSizeSelect(size)}
            className={clsx(
              'flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
              {
                'bg-neutral-800 text-white border border-neutral-700 shadow-lg': 
                  selectedSize === size,
                'bg-neutral-900 text-neutral-300 border border-neutral-800 hover:bg-neutral-800 hover:border-neutral-700': 
                  selectedSize !== size
              }
            )}
          >
            <div className="font-bold">{size}</div>
            <div className="text-xs opacity-70 mt-0.5">
              {getDimensionDisplay(size)}
            </div>
          </button>
        ))}
      </div>

      {/* Custom Dimension Inputs */}
      {selectedSize === 'Custom' && (
        <div className="overflow-hidden">
          <div className="animate-in slide-in-from-top-2 duration-300">
            <div className="space-y-3">
              {shape === 'circle' ? (
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    Diameter (cm)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    step="0.1"
                    placeholder="Enter diameter"
                    className="w-full rounded-lg bg-neutral-800 border border-neutral-700 px-4 py-2 text-white placeholder-neutral-500 focus:border-blue-500 focus:outline-none transition-colors"
                    value={customDimensions.diameter || ''}
                    onChange={(e) => handleCustomDimensionChange('diameter', e.target.value)}
                  />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">
                      Width (cm)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="50"
                      step="0.1"
                      placeholder="Width"
                      className="w-full rounded-lg bg-neutral-800 border border-neutral-700 px-4 py-2 text-white placeholder-neutral-500 focus:border-blue-500 focus:outline-none transition-colors"
                      value={customDimensions.width || ''}
                      onChange={(e) => handleCustomDimensionChange('width', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">
                      Height (cm)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="50"
                      step="0.1"
                      placeholder="Height"
                      className="w-full rounded-lg bg-neutral-800 border border-neutral-700 px-4 py-2 text-white placeholder-neutral-500 focus:border-blue-500 focus:outline-none transition-colors"
                      value={customDimensions.height || ''}
                      onChange={(e) => handleCustomDimensionChange('height', e.target.value)}
                    />
                  </div>
                </div>
              )}
              <p className="text-xs text-neutral-500">
                {shape === 'circle' 
                  ? 'Minimum: 1cm • Maximum: 50cm diameter'
                  : 'Minimum: 1cm • Maximum: 50cm per dimension'
                }
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 