'use client';

import clsx from 'clsx';
import { useEffect, useMemo, useState } from 'react';
import { Shape } from './shape-selector';
import { SIZE_PRESETS, SizePresetKey, SizeDimensions } from './size-presets';

interface SizeInputProps {
  shape: Shape;
  dimensions: { width?: number; height?: number; diameter?: number };
  onSizeChange: (dimensions: { width?: number; height?: number; diameter?: number }) => void;
}

type SizeOption = SizePresetKey | 'Custom';

type Dimensions = SizeDimensions;

// Predefined sizes for each shape and size option
const sizeMappings: Record<Shape, Record<SizeOption, Dimensions>> = {
  rectangle: { ...SIZE_PRESETS.rectangle, Custom: {} },
  square: { ...SIZE_PRESETS.square, Custom: {} },
  circle: { ...SIZE_PRESETS.circle, Custom: {} },
  diecut: { ...SIZE_PRESETS.diecut, Custom: {} }
};

export default function SizeInput({ shape, dimensions, onSizeChange }: SizeInputProps) {
  const [selectedSize, setSelectedSize] = useState<SizeOption>('L');
  const [customDimensions, setCustomDimensions] = useState<Dimensions>({
    width: 0,
    height: 0,
    diameter: 0
  });
  const [dimensionErrors, setDimensionErrors] = useState<{ width?: string; height?: string; diameter?: string }>({})

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
        const matchesDirect = sizeDims.width === dims.width && sizeDims.height === dims.height;
        const matchesSwapped = sizeDims.width === dims.height && sizeDims.height === dims.width;

        if (matchesDirect || matchesSwapped) {
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
      setDimensionErrors({})
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

  const validateDimension = (dimension: keyof Dimensions, rawValue: number) => {
    let message = ''
    let value = rawValue

    if (rawValue > 50) {
      message = 'Maximum size is 50 cm per dimension'
      value = 50
    } else if (rawValue > 0 && rawValue < 1) {
      message = 'Minimum size is 1 cm'
      value = 1
    } else if (rawValue === 0) {
      message = 'Enter a value between 1 and 50 cm'
    }

    setDimensionErrors((prev) => ({ ...prev, [dimension]: message }))
    return value
  }

  const handleCustomDimensionChange = (dimension: keyof Dimensions, value: string) => {
    if (!value) {
      setCustomDimensions((prev) => ({ ...prev, [dimension]: 0 }))
      setDimensionErrors((prev) => ({ ...prev, [dimension]: 'Enter a value between 1 and 50 cm' }))
      return
    }

    const parsedValue = Number(value)
    if (Number.isNaN(parsedValue)) {
      return
    }

    const clampedValue = validateDimension(dimension, parsedValue)
    const nextDimensions = { ...customDimensions, [dimension]: clampedValue }
    setCustomDimensions(nextDimensions)

    if (shape === 'circle') {
      if (clampedValue >= 1) {
        onSizeChange({ diameter: clampedValue })
      }
    } else {
      if (nextDimensions.width && nextDimensions.height && nextDimensions.width >= 1 && nextDimensions.height >= 1) {
        onSizeChange({ width: nextDimensions.width, height: nextDimensions.height })
      }
    }
  }

  const atMaximumSize = useMemo(() => {
    if (shape === 'circle') {
      return (customDimensions.diameter || 0) >= 50
    }
    return (customDimensions.width || 0) >= 50 || (customDimensions.height || 0) >= 50
  }, [shape, customDimensions])

  const sizeGuidanceText = useMemo(() => (
    atMaximumSize
      ? 'For sizes above 50 cm, please contact us for a custom quote.'
      : 'Set each dimension between 1 cm and 50 cm. Need something larger? Reach out to us.'
  ), [atMaximumSize])

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
      <div className="grid auto-rows-fr grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {(['S', 'M', 'L', 'XL', 'Custom'] as SizeOption[]).map((size) => {
          const isSelected = selectedSize === size

          return (
            <button
              key={size}
              onClick={() => handleSizeSelect(size)}
              className={clsx(
                'h-full w-full rounded-rounded border px-4 py-3 text-left text-sm font-medium transition-colors',
                isSelected
                  ? 'border-ui-border-strong bg-ui-bg-field text-ui-fg-base shadow-elevation-card-hover'
                  : 'border-ui-border-base bg-ui-bg-subtle text-ui-fg-subtle hover:bg-ui-bg-base hover:text-ui-fg-base'
              )}
            >
              <div className="text-xs uppercase tracking-wide text-ui-fg-muted">{size}</div>
              <div className={clsx('text-sm font-semibold', isSelected ? 'text-ui-fg-base' : 'text-ui-fg-subtle')}>
                {getDimensionDisplay(size)}
              </div>
            </button>
          )
        })}
      </div>

      {selectedSize === 'Custom' && (
        <div className="space-y-4 rounded-rounded border border-ui-border-base bg-ui-bg-subtle p-4">
          {shape === 'circle' ? (
            <div className="space-y-1.5">
              <label className={clsx('text-xs font-medium uppercase tracking-wide', dimensionErrors.diameter ? 'text-ui-fg-error' : 'text-ui-fg-muted')}>
                Diameter (cm)
              </label>
              <input
                type="number"
                min="1"
                max="50"
                step="0.1"
                value={customDimensions.diameter || ''}
                onChange={(event) => handleCustomDimensionChange('diameter', event.target.value)}
                className={clsx(
                  'w-full rounded-rounded border px-3 py-2 text-sm transition-colors focus:outline-none',
                  dimensionErrors.diameter
                    ? 'border-ui-border-error bg-ui-bg-field text-ui-fg-error focus:border-ui-border-error'
                    : 'border-ui-border-base bg-ui-bg-base text-ui-fg-base focus:border-ui-border-strong'
                )}
              />
              {dimensionErrors.diameter && (
                <p className="text-xs text-ui-fg-error">{dimensionErrors.diameter}</p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className={clsx('text-xs font-medium uppercase tracking-wide', dimensionErrors.width ? 'text-ui-fg-error' : 'text-ui-fg-muted')}>
                  Width (cm)
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  step="0.1"
                  value={customDimensions.width || ''}
                  onChange={(event) => handleCustomDimensionChange('width', event.target.value)}
                  className={clsx(
                    'w-full rounded-rounded border px-3 py-2 text-sm transition-colors focus:outline-none',
                    dimensionErrors.width
                      ? 'border-ui-border-error bg-ui-bg-field text-ui-fg-error focus:border-ui-border-error'
                      : 'border-ui-border-base bg-ui-bg-base text-ui-fg-base focus:border-ui-border-strong'
                  )}
                />
                {dimensionErrors.width && (
                  <p className="text-xs text-ui-fg-error">{dimensionErrors.width}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <label className={clsx('text-xs font-medium uppercase tracking-wide', dimensionErrors.height ? 'text-ui-fg-error' : 'text-ui-fg-muted')}>
                  Height (cm)
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  step="0.1"
                  value={customDimensions.height || ''}
                  onChange={(event) => handleCustomDimensionChange('height', event.target.value)}
                  className={clsx(
                    'w-full rounded-rounded border px-3 py-2 text-sm transition-colors focus:outline-none',
                    dimensionErrors.height
                      ? 'border-ui-border-error bg-ui-bg-field text-ui-fg-error focus:border-ui-border-error'
                      : 'border-ui-border-base bg-ui-bg-base text-ui-fg-base focus:border-ui-border-strong'
                  )}
                />
                {dimensionErrors.height && (
                  <p className="text-xs text-ui-fg-error">{dimensionErrors.height}</p>
                )}
              </div>
            </div>
          )}

          <p className={clsx('text-xs', atMaximumSize ? 'text-ui-fg-error' : 'text-ui-fg-muted')}>
            {sizeGuidanceText}
          </p>
        </div>
      )}
    </div>
  )
} 
