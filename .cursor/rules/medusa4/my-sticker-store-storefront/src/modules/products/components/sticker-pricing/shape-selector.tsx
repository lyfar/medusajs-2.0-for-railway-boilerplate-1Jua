"use client"

import { Button } from "@medusajs/ui"
import clsx from "clsx"

export type StickerShape = 'rectangle' | 'square' | 'circle' | 'diecut'

export interface ShapePricingParams {
  F_S: number  // Fixed setup cost
  k_S: number  // Variable cost multiplier based on area
  delta: number // Scaling exponent for quantity discounts
}

export interface StickerShapeOption {
  value: StickerShape
  label: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  pricingParams: ShapePricingParams
}

// Custom icon components
function RectangleIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="4" y="6" width="16" height="12" rx="2" />
    </svg>
  )
}

function SquareIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
    </svg>
  )
}

function CircleIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="9" />
    </svg>
  )
}

function DieCutIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    </svg>
  )
}

export const stickerShapes: StickerShapeOption[] = [
  {
    value: 'rectangle',
    label: 'Rectangle',
    description: 'Most cost-effective option',
    icon: RectangleIcon,
    pricingParams: { F_S: 100, k_S: 0.5, delta: 0.8 }
  },
  {
    value: 'square',
    label: 'Square',
    description: 'Classic balanced shape',
    icon: SquareIcon,
    pricingParams: { F_S: 100, k_S: 0.5, delta: 0.8 }
  },
  {
    value: 'circle',
    label: 'Circle',
    description: 'Rounded design (+20% cost)',
    icon: CircleIcon,
    pricingParams: { F_S: 120, k_S: 0.6, delta: 0.8 }
  },
  {
    value: 'diecut',
    label: 'Die Cut',
    description: 'Custom shape (+50% cost)',
    icon: DieCutIcon,
    pricingParams: { F_S: 150, k_S: 0.7, delta: 0.8 }
  }
]

interface StickerShapeSelectorProps {
  selectedShape: StickerShape
  onShapeChange: (shape: StickerShape) => void
  disabled?: boolean
  className?: string
}

export default function StickerShapeSelector({
  selectedShape,
  onShapeChange,
  disabled = false,
  className,
}: StickerShapeSelectorProps) {
  const selectedShapeOption = stickerShapes.find(shape => shape.value === selectedShape)

  return (
    <div className={className}>
      <div className="space-y-3">
        <label className="block text-sm font-medium text-ui-fg-base">
          Shape & Style
        </label>
        
        {/* Shape Selection Grid */}
        <div className="grid grid-cols-4 gap-2">
          {stickerShapes.map((shape) => {
            const Icon = shape.icon
            return (
              <Button
                key={shape.value}
                variant={selectedShape === shape.value ? "primary" : "secondary"}
                onClick={() => onShapeChange(shape.value)}
                disabled={disabled}
                className="h-14 p-2 flex flex-col items-center justify-center space-y-1"
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs font-medium">{shape.label}</span>
              </Button>
            )
          })}
        </div>

        {/* Selected Shape Info */}
        {selectedShapeOption && (
          <div className="p-3 bg-ui-bg-subtle rounded border">
            <div className="flex items-center space-x-2">
              <selectedShapeOption.icon className="h-4 w-4 text-ui-fg-interactive" />
              <span className="text-sm font-medium">{selectedShapeOption.label}</span>
              <span className="text-xs text-ui-fg-subtle">- {selectedShapeOption.description}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 