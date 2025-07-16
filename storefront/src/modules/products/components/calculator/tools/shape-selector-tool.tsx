"use client"

import { useState } from "react"
import clsx from "clsx"
import { Circle, Hexagon, Square, X } from "lucide-react"
import { Shape, shapes } from "../shape-selector"

// Custom rectangle icon component
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
  );
}

interface ShapeSelectorToolProps {
  shape: Shape
  onShapeChange?: (shape: Shape) => void
}

export default function ShapeSelectorTool({ shape, onShapeChange }: ShapeSelectorToolProps) {
  const [showShapeSelector, setShowShapeSelector] = useState(false)

  const getShapeIcon = (shapeType: Shape) => {
    switch (shapeType) {
      case 'rectangle':
        return <RectangleIcon className="w-4 h-4" />
      case 'square':
        return <Square className="w-4 h-4" />
      case 'circle':
        return <Circle className="w-4 h-4" />
      case 'diecut':
        return <Hexagon className="w-4 h-4" />
      default:
        return <RectangleIcon className="w-4 h-4" />
    }
  }

  return (
    <>
      <div className="flex flex-col gap-1">
        <button
          onClick={() => setShowShapeSelector(true)}
          className="w-10 h-10 bg-purple-700 hover:bg-purple-600 text-white rounded-lg flex items-center justify-center transition-colors"
          title="Change shape"
        >
          {getShapeIcon(shape)}
        </button>
      </div>

      {/* Shape Selector Modal */}
      {showShapeSelector && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-neutral-800 border border-neutral-700 rounded-2xl p-6 shadow-2xl max-w-md w-full mx-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Select Shape</h3>
              <button
                onClick={() => setShowShapeSelector(false)}
                className="w-8 h-8 bg-neutral-700 hover:bg-neutral-600 text-neutral-400 hover:text-white rounded-lg flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {shapes.map((shapeOption) => {
                const Icon = shapeOption.icon;
                const isSelected = shape === shapeOption.value;
                
                return (
                  <button
                    key={shapeOption.value}
                    onClick={() => {
                      if (onShapeChange) {
                        onShapeChange(shapeOption.value);
                      }
                      setShowShapeSelector(false);
                    }}
                    className={clsx(
                      "p-4 rounded-xl transition-all duration-200 flex flex-col items-center gap-3 border-2",
                      {
                        "bg-purple-600 border-purple-500 text-white": isSelected,
                        "bg-neutral-700 border-neutral-600 text-neutral-300 hover:bg-neutral-600 hover:border-neutral-500": !isSelected,
                      }
                    )}
                  >
                    <Icon className="w-8 h-8" />
                    <span className="text-sm font-medium">{shapeOption.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  )
} 