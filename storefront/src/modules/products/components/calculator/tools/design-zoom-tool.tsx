"use client"

import { Plus, Minus, ZoomIn, RotateCw } from "lucide-react"

interface DesignZoomToolProps {
  scale: number
  onScaleChange: (delta: number) => void
  rotation: number
  onRotationChange: (delta: number) => void
}

export default function DesignZoomTool({ scale, onScaleChange, rotation, onRotationChange }: DesignZoomToolProps) {
  return (
    <div className="flex flex-col items-center gap-4">
      {/* Zoom Controls */}
      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center justify-center rounded-full bg-emerald-900/30 p-1.5">
          <ZoomIn className="h-3.5 w-3.5 text-emerald-400" />
        </div>
        <button
          onClick={() => onScaleChange(0.1)}
          disabled={scale >= 3}
          className="group flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-700/80 text-white shadow-lg transition-all hover:bg-emerald-600 hover:scale-110 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
          title="Zoom in (+)"
          type="button"
        >
          <Plus className="h-5 w-5" />
        </button>
        <div className="relative">
          <div className="rounded-lg bg-neutral-900/80 px-2.5 py-1.5 backdrop-blur-sm">
            <span className="font-mono text-sm font-bold text-emerald-300">{Math.round(scale * 100)}%</span>
          </div>
          {/* Scale indicator - centered */}
          <div className="mt-1 flex justify-center gap-0.5">
            {[0.5, 1, 1.5, 2, 2.5, 3].map((s) => (
              <div
                key={s}
                className={`h-1 w-1 rounded-full transition-colors ${
                  scale >= s ? 'bg-emerald-400' : 'bg-neutral-700'
                }`}
              />
            ))}
          </div>
        </div>
        <button
          onClick={() => onScaleChange(-0.1)}
          disabled={scale <= 0.5}
          className="group flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-700/80 text-white shadow-lg transition-all hover:bg-emerald-600 hover:scale-110 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
          title="Zoom out (-)"
          type="button"
        >
          <Minus className="h-5 w-5" />
        </button>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-1">
        <div className="h-px w-6 bg-gradient-to-r from-transparent via-neutral-600 to-transparent" />
      </div>

      {/* Rotation Controls */}
      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center justify-center rounded-full bg-sky-900/30 p-1.5">
          <RotateCw className="h-3.5 w-3.5 text-sky-400" />
        </div>
        <button
          onClick={() => onRotationChange(5)}
          className="group flex h-11 w-11 items-center justify-center rounded-xl bg-sky-700/80 text-white shadow-lg transition-all hover:bg-sky-600 hover:scale-110"
          title="Rotate clockwise (])"
          type="button"
        >
          <RotateCw className="h-5 w-5" />
        </button>
        <div className="relative">
          <div className="rounded-lg bg-neutral-900/80 px-2.5 py-1.5 backdrop-blur-sm">
            <span className="font-mono text-sm font-bold text-sky-300">{Math.round(rotation)}°</span>
          </div>
        </div>
        <button
          onClick={() => onRotationChange(-5)}
          className="group flex h-11 w-11 items-center justify-center rounded-xl bg-sky-700/80 text-white shadow-lg transition-all hover:bg-sky-600 hover:scale-110"
          title="Rotate counter-clockwise ([)"
          type="button"
        >
          <RotateCw className="h-5 w-5 scale-x-[-1]" />
        </button>
      </div>
    </div>
  )
}
