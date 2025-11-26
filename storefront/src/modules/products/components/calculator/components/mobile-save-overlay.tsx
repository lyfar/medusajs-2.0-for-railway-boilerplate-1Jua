'use client'

import { Check } from "lucide-react"
import { OrientationToggle } from "./orientation-toggle"
import { Orientation } from "../orientation"

interface MobileSaveOverlayProps {
  visible: boolean
  canAdjustOrientation: boolean
  activeOrientation: Orientation
  onOrientationChange?: (orientation: Orientation) => void
  onSave: () => void
  isSaving: boolean
  hasUnsavedChanges: boolean
}

export function MobileSaveOverlay({
  visible,
  canAdjustOrientation,
  activeOrientation,
  onOrientationChange,
  onSave,
  isSaving,
  hasUnsavedChanges,
}: MobileSaveOverlayProps) {
  if (!visible) return null

  return (
    <div className="pointer-events-none absolute inset-x-4 bottom-8 z-50 flex justify-center">
      <div className="pointer-events-auto flex flex-col items-center gap-3">
        {canAdjustOrientation && (
          <div className="rounded-full border border-neutral-700 bg-neutral-900/80 p-1.5 shadow-lg backdrop-blur-sm">
            <OrientationToggle
              current={activeOrientation}
              onChange={onOrientationChange}
              layout="horizontal"
            />
          </div>
        )}
        <div className="flex items-center gap-2 rounded-full border border-indigo-500/50 bg-indigo-600 px-6 py-2 text-sm font-bold text-white shadow-lg transition-all active:scale-95 disabled:opacity-50">
          <button
            onClick={onSave}
            disabled={isSaving || !hasUnsavedChanges}
            className="flex items-center gap-2"
          >
            {isSaving ? "Saving..." : hasUnsavedChanges ? "Save design" : "Saved"}
          </button>
          {!hasUnsavedChanges && <Check className="h-4 w-4 text-white/80" />}
        </div>
        {hasUnsavedChanges && (
          <p className="text-center text-[12px] font-medium text-white/80">
            Save to lock changes before checkout.
          </p>
        )}
      </div>
    </div>
  )
}
