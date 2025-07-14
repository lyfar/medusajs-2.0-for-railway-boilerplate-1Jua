"use client"

import { useState, useEffect } from "react"
import { StickerShape, StickerDimensions } from "@lib/data/stickers"
import { Button } from "@medusajs/ui"
import clsx from "clsx"

interface SizeInputProps {
  shape: StickerShape
  dimensions: StickerDimensions
  onDimensionsChange: (dimensions: StickerDimensions) => void
  disabled?: boolean
  className?: string
}

// Predefined popular sizes for each shape
const predefinedSizes: Record<StickerShape, Array<{label: string, dimensions: StickerDimensions}>> = {
  rectangle: [
    { label: "Small", dimensions: { width: 5, height: 3 } },
    { label: "Medium", dimensions: { width: 10, height: 6 } },
    { label: "Large", dimensions: { width: 15, height: 9 } },
    { label: "Bumper", dimensions: { width: 20, height: 5 } },
  ],
  square: [
    { label: "Small", dimensions: { width: 4, height: 4 } },
    { label: "Medium", dimensions: { width: 8, height: 8 } },
    { label: "Large", dimensions: { width: 12, height: 12 } },
    { label: "XL", dimensions: { width: 16, height: 16 } },
  ],
  circle: [
    { label: "Small", dimensions: { diameter: 4 } },
    { label: "Medium", dimensions: { diameter: 8 } },
    { label: "Large", dimensions: { diameter: 12 } },
    { label: "XL", dimensions: { diameter: 16 } },
  ],
  diecut: [
    { label: "Small", dimensions: { width: 6, height: 6 } },
    { label: "Medium", dimensions: { width: 10, height: 10 } },
    { label: "Large", dimensions: { width: 15, height: 15 } },
    { label: "XL", dimensions: { width: 20, height: 20 } },
  ],
}

export default function SizeInput({
  shape,
  dimensions,
  onDimensionsChange,
  disabled = false,
  className,
}: SizeInputProps) {
  const [localDimensions, setLocalDimensions] = useState<StickerDimensions>(dimensions)
  const [isCustom, setIsCustom] = useState(false)

  // Update local state when dimensions prop changes
  useEffect(() => {
    setLocalDimensions(dimensions)
    
    // Check if current dimensions match any predefined size
    const currentSizes = predefinedSizes[shape]
    const isMatchingPredefined = currentSizes.some(size => {
      if (shape === 'circle') {
        return size.dimensions.diameter === dimensions.diameter
      } else {
        return size.dimensions.width === dimensions.width && 
               size.dimensions.height === dimensions.height
      }
    })
    setIsCustom(!isMatchingPredefined)
  }, [dimensions, shape])

  const handleInputChange = (field: keyof StickerDimensions, value: string) => {
    const numValue = parseFloat(value) || 0
    const validValue = Math.max(0.1, Math.min(100, numValue)) // Constrain between 0.1 and 100 cm
    
    const newDimensions = {
      ...localDimensions,
      [field]: validValue
    }
    
    setLocalDimensions(newDimensions)
    onDimensionsChange(newDimensions)
    setIsCustom(true)
  }

  const handlePredefinedSizeClick = (predefinedDimensions: StickerDimensions) => {
    setLocalDimensions(predefinedDimensions)
    onDimensionsChange(predefinedDimensions)
    setIsCustom(false)
  }

  const calculateArea = () => {
    if (shape === 'circle' && localDimensions.diameter) {
      const radius = localDimensions.diameter / 2
      return Math.PI * Math.pow(radius, 2)
    } else if (localDimensions.width && localDimensions.height) {
      return localDimensions.width * localDimensions.height
    }
    return 0
  }

  const renderCircleInput = () => (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-ui-fg-base">
        Diameter (cm):
      </label>
      <input
        type="number"
        value={localDimensions.diameter || ''}
        onChange={(e) => handleInputChange('diameter', e.target.value)}
        disabled={disabled}
        min="0.1"
        max="100"
        step="0.1"
        placeholder="Enter diameter"
        className={clsx(
          "w-full h-12 px-4 border rounded-lg text-sm font-medium",
          "border-ui-border-base focus:ring-2 focus:ring-ui-border-interactive focus:border-transparent",
          "bg-ui-bg-base transition-all duration-200"
        )}
      />
    </div>
  )

  const renderRectangularInput = () => (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-3">
        <label className="block text-sm font-medium text-ui-fg-base">
          Width (cm):
        </label>
        <input
          type="number"
          value={localDimensions.width || ''}
          onChange={(e) => handleInputChange('width', e.target.value)}
          disabled={disabled}
          min="0.1"
          max="100"
          step="0.1"
          placeholder="Width"
          className={clsx(
            "w-full h-12 px-4 border rounded-lg text-sm font-medium",
            "border-ui-border-base focus:ring-2 focus:ring-ui-border-interactive focus:border-transparent",
            "bg-ui-bg-base transition-all duration-200"
          )}
        />
      </div>
      
      <div className="space-y-3">
        <label className="block text-sm font-medium text-ui-fg-base">
          Height (cm):
        </label>
        <input
          type="number"
          value={localDimensions.height || ''}
          onChange={(e) => handleInputChange('height', e.target.value)}
          disabled={disabled}
          min="0.1"
          max="100"
          step="0.1"
          placeholder="Height"
          className={clsx(
            "w-full h-12 px-4 border rounded-lg text-sm font-medium",
            "border-ui-border-base focus:ring-2 focus:ring-ui-border-interactive focus:border-transparent",
            "bg-ui-bg-base transition-all duration-200"
          )}
        />
      </div>
    </div>
  )

  const getShapeDescription = () => {
    switch (shape) {
      case 'rectangle':
        return 'Choose a popular size or enter custom dimensions'
      case 'square':
        return 'Perfect squares for balanced designs'
      case 'circle':
        return 'Round stickers with diameter measurement'
      case 'diecut':
        return 'Custom shapes cut to your design outline'
      default:
        return 'Enter the dimensions for your sticker'
    }
  }

  const currentSizes = predefinedSizes[shape]

  return (
    <div className={className}>
      <div className="space-y-3">
        <label className="block text-sm font-medium text-ui-fg-base">
          Size & Dimensions
        </label>

        {/* Predefined Sizes */}
        <div className="grid grid-cols-2 gap-2">
          {currentSizes.map((size, index) => {
            const isSelected = !isCustom && (
              shape === 'circle' 
                ? size.dimensions.diameter === localDimensions.diameter
                : size.dimensions.width === localDimensions.width && 
                  size.dimensions.height === localDimensions.height
            )
            
            return (
              <Button
                key={index}
                variant={isSelected ? "primary" : "secondary"}
                onClick={() => handlePredefinedSizeClick(size.dimensions)}
                disabled={disabled}
                className="h-12 p-2 flex flex-col items-center justify-center"
              >
                <span className="font-medium text-sm">{size.label}</span>
                <span className="text-xs opacity-75">
                  {shape === 'circle' 
                    ? `⌀${size.dimensions.diameter}cm`
                    : `${size.dimensions.width}×${size.dimensions.height}cm`
                  }
                </span>
              </Button>
            )
          })}
        </div>

        {/* Custom Size Toggle */}
        <Button
          variant={isCustom ? "primary" : "secondary"}
          onClick={() => setIsCustom(!isCustom)}
          disabled={disabled}
          className="w-full h-10 font-medium"
        >
          {isCustom ? "✓ Custom Size" : "Enter Custom Size"}
        </Button>

        {/* Custom Size Inputs */}
        {isCustom && (
          <div className="p-3 bg-ui-bg-subtle rounded border">
            {shape === 'circle' ? renderCircleInput() : renderRectangularInput()}
          </div>
        )}

        {/* Area Display */}
        <div className="p-3 bg-blue-50 rounded border">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Area:</span>
            <span className="font-bold text-blue-600">
              {calculateArea().toFixed(1)} cm²
            </span>
          </div>
          {shape === 'square' && localDimensions.width !== localDimensions.height && (
            <div className="mt-2 text-sm text-orange-600">
              ⚠ For a perfect square, width and height should be equal
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 