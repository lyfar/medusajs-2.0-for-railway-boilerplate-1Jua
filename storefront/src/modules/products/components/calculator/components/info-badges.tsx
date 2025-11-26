'use client'

import clsx from "clsx"
import { MousePointerClick } from "lucide-react"

import { Shape } from "../shape-selector"
import { Dimensions } from "../types"

interface InfoBadgesProps {
  shape: Shape
  dimensions: Dimensions
  imageData: string | null
  hasUnsavedChanges: boolean
  isTouchDevice: boolean
  showKeyboardHints: boolean
  onToggleShortcuts: () => void
}

export function InfoBadges({
  shape,
  dimensions,
  imageData,
  hasUnsavedChanges,
  isTouchDevice,
  showKeyboardHints,
  onToggleShortcuts,
}: InfoBadgesProps) {
  const sizeLabel =
    shape === "circle"
      ? `⌀ ${dimensions.diameter}cm`
      : `${dimensions.width}cm × ${dimensions.height}cm`

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
      <div className="rounded-full bg-neutral-800/90 px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm font-semibold text-neutral-200 shadow-lg backdrop-blur-sm">
        {sizeLabel}
      </div>
      {imageData && (
        <span
          className={clsx(
            "rounded-full px-2.5 py-1 text-[10px] sm:text-xs font-semibold shadow-sm",
            hasUnsavedChanges
              ? "bg-amber-500/20 text-amber-100 ring-1 ring-amber-400/60"
              : "bg-emerald-500/20 text-emerald-100 ring-1 ring-emerald-400/60"
          )}
        >
          {hasUnsavedChanges ? "Unsaved" : "Saved"}
        </span>
      )}
      {imageData && !isTouchDevice && (
        <button
          onClick={onToggleShortcuts}
          className={clsx(
            "group flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium shadow-md transition-all",
            showKeyboardHints
              ? "bg-indigo-900/80 text-indigo-50"
              : "bg-indigo-900/40 text-indigo-300 hover:bg-indigo-900/60"
          )}
          title="Show keyboard shortcuts"
        >
          <MousePointerClick className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Shortcuts</span>
          <span className="text-[10px] opacity-70">?</span>
        </button>
      )}
    </div>
  )
}
