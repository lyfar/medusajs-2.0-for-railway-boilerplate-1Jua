'use client'

import { DesignZoomTool } from "../tools"

interface ZoomOverlayProps {
  visible: boolean
  scale: number
  rotation: number
  onScaleChange: (delta: number) => void
  onRotationChange: (delta: number) => void
}

export function ZoomOverlay({
  visible,
  scale,
  rotation,
  onScaleChange,
  onRotationChange,
}: ZoomOverlayProps) {
  if (!visible) return null

  return (
    <div className="pointer-events-none absolute left-4 top-4 z-10 hidden md:block">
      <div className="pointer-events-auto flex h-fit w-full flex-col gap-4 rounded-2xl border border-neutral-700 bg-neutral-800/90 p-2 shadow-xl backdrop-blur-md">
        <DesignZoomTool
          scale={scale}
          rotation={rotation}
          onScaleChange={onScaleChange}
          onRotationChange={onRotationChange}
        />
      </div>
    </div>
  )
}
