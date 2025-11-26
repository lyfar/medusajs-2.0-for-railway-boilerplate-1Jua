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

const sizeVisuals: Record<SizeOption, { label: string }> = {
  S: { label: 'S' },
  M: { label: 'M' },
  L: { label: 'L' },
  XL: { label: 'XL' },
  Custom: { label: 'C' }
}

export default function SizeInput({ shape, dimensions, onSizeChange, layout = 'default' }: SizeInputProps & { layout?: 'default' | 'horizontal' }) {
  const [selectedSize, setSelectedSize] = useState<SizeOption>('L');
  const [customDimensions, setCustomDimensions] = useState<Dimensions>({
    width: 0,
    height: 0,
    diameter: 0
  });
  const [dimensionErrors, setDimensionErrors] = useState<{ width?: string; height?: string; diameter?: string }>({})
  const isHorizontal = layout === 'horizontal';

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
      <div className={clsx(
        isHorizontal ? "flex overflow-x-auto snap-x snap-mandatory gap-3 pb-1 no-scrollbar" : "grid auto-rows-fr grid-cols-3 gap-2 sm:grid-cols-2 xl:grid-cols-3"
      )}>
        {(['S', 'M', 'L', 'XL', 'Custom'] as SizeOption[]).map((size) => {
          const isSelected = selectedSize === size

          return (
            <button
              key={size}
              onClick={() => handleSizeSelect(size)}
              className={clsx(
                'group flex items-center rounded-rounded border text-left transition-all',
                isHorizontal ? "snap-start shrink-0 p-2 gap-2 min-w-[100px]" : "px-3.5 py-3 gap-3 text-sm h-full",
                isSelected
                  ? 'border-indigo-400 ring-2 ring-indigo-500/40 shadow-md bg-neutral-950 text-white'
                  : 'border-neutral-700 bg-neutral-950 text-neutral-200 hover:border-neutral-500 hover:bg-neutral-900'
              )}
            >
              <div
                className={clsx(
                  'flex shrink-0 items-center justify-center rounded-md border font-bold uppercase transition',
                  isHorizontal ? "h-8 w-8 text-[10px]" : "h-11 w-11 text-xs",
                  isSelected
                    ? 'border-indigo-300 text-white bg-indigo-500/10 shadow-sm ring-1 ring-indigo-300/60'
                    : 'border-neutral-600 text-neutral-200 bg-neutral-900 ring-1 ring-neutral-800'
                )}
              >
                {sizeVisuals[size].label}
              </div>
              <div className="flex flex-col gap-0.5">
                <span className={clsx('font-semibold', isHorizontal ? "text-[10px] leading-tight" : "text-xs", isSelected ? 'text-white' : 'text-neutral-100')}>{size}</span>
                <span className={clsx('leading-tight', isHorizontal ? "text-[10px]" : "text-[11px]", isSelected ? 'text-neutral-200' : 'text-neutral-500')}>
                  {getDimensionDisplay(size)}
                </span>
              </div>
            </button>
          )
        })}
      </div>

      {selectedSize === 'Custom' && (
        isHorizontal ? (
          <div className="rounded-lg border border-white/10 bg-neutral-900/50 backdrop-blur-sm p-3">
             {shape === 'circle' ? (
                <div className="flex items-center gap-2">
                   <label className="text-[10px] text-neutral-400 font-medium">Diameter</label>
                   <div className="flex-1 relative">
                      <input
                        type="number"
                        min="1"
                        max="50"
                        step="0.1"
                        value={customDimensions.diameter || ''}
                        onChange={(event) => handleCustomDimensionChange('diameter', event.target.value)}
                        className={clsx(
                          "w-full bg-neutral-950 border border-neutral-800 rounded px-2 py-1.5 text-xs text-white focus:border-indigo-500 focus:outline-none",
                          dimensionErrors.diameter && "border-red-500"
                        )}
                        placeholder="1-50"
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-neutral-600">cm</span>
                   </div>
                </div>
             ) : (
                <div className="flex items-center gap-2">
                   <div className="flex-1 flex items-center gap-2">
                      <span className="text-[10px] text-neutral-400 font-medium w-3">W</span>
                      <div className="relative flex-1">
                        <input
                          type="number"
                          min="1"
                          max="50"
                          step="0.1"
                          value={customDimensions.width || ''}
                          onChange={(event) => handleCustomDimensionChange('width', event.target.value)}
                          className={clsx(
                            "w-full bg-neutral-950 border border-neutral-800 rounded px-2 py-1.5 text-xs text-white focus:border-indigo-500 focus:outline-none",
                            dimensionErrors.width && "border-red-500"
                          )}
                          placeholder="Width"
                        />
                      </div>
                   </div>
                   <span className="text-neutral-600 text-xs">×</span>
                   <div className="flex-1 flex items-center gap-2">
                      <span className="text-[10px] text-neutral-400 font-medium w-3">H</span>
                      <div className="relative flex-1">
                        <input
                          type="number"
                          min="1"
                          max="50"
                          step="0.1"
                          value={customDimensions.height || ''}
                          onChange={(event) => handleCustomDimensionChange('height', event.target.value)}
                          className={clsx(
                            "w-full bg-neutral-950 border border-neutral-800 rounded px-2 py-1.5 text-xs text-white focus:border-indigo-500 focus:outline-none",
                            dimensionErrors.height && "border-red-500"
                          )}
                          placeholder="Height"
                        />
                      </div>
                   </div>
                </div>
             )}
             {(dimensionErrors.width || dimensionErrors.height || dimensionErrors.diameter || atMaximumSize) && (
                <p className={clsx("text-[10px] mt-2 text-center", (dimensionErrors.width || dimensionErrors.height || dimensionErrors.diameter) ? "text-red-400" : "text-neutral-500")}>
                  {dimensionErrors.width || dimensionErrors.height || dimensionErrors.diameter || sizeGuidanceText}
                </p>
             )}
          </div>
        ) : (
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
        )
      )}
    </div>
  )
} 
