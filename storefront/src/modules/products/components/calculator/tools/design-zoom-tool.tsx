"use client"

import { Plus, Minus } from "lucide-react"
import { Shape } from "../shape-selector"

interface DesignZoomToolProps {
  shape: Shape
  scale: number
  onScaleChange: (delta: number) => void
}

export default function DesignZoomTool({ shape, scale, onScaleChange }: DesignZoomToolProps) {
  // Only show for non-diecut shapes
  if (shape === "diecut") return null

  return (
    <div className="flex flex-col gap-1">
      <button
        onClick={() => onScaleChange(0.1)}
        disabled={scale >= 3}
        className="w-10 h-10 bg-green-700 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg flex items-center justify-center transition-colors"
        title="Zoom in design"
      >
        <Plus className="w-4 h-4" />
      </button>
      <div className="text-xs text-green-300 text-center font-mono">
        {Math.round(scale * 100)}%
      </div>
      <button
        onClick={() => onScaleChange(-0.1)}
        disabled={scale <= 0.5}
        className="w-10 h-10 bg-green-700 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg flex items-center justify-center transition-colors"
        title="Zoom out design"
      >
        <Minus className="w-4 h-4" />
      </button>
    </div>
  )
} 