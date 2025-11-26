'use client'

import { Upload } from "lucide-react"

interface CanvasEmptyStateProps {
  isProcessing: boolean
  isDragActive: boolean
  canBrowse: boolean
  isTouchDevice: boolean
  onBrowse: () => void
}

export function CanvasEmptyState({ isProcessing, isDragActive, canBrowse, isTouchDevice, onBrowse }: CanvasEmptyStateProps) {
  if (isProcessing) {
    return (
      <>
        <div className="relative">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-neutral-700 border-t-indigo-500"></div>
          <Upload className="absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 text-indigo-400" />
        </div>
        <div className="space-y-1">
          <p className="text-base font-semibold text-neutral-200">Preparing preview…</p>
          <p className="text-sm text-neutral-400">Converting your file for editing</p>
        </div>
      </>
    )
  }

  if (isDragActive) {
    return (
      <>
        <div className="rounded-full bg-indigo-900/30 p-6">
          <Upload className="h-12 w-12 text-indigo-400" />
        </div>
        <p className="text-lg font-semibold text-indigo-200">Drop your file here</p>
      </>
    )
  }

  return (
    <div
      className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center"
      role="button"
      tabIndex={canBrowse ? 0 : -1}
      onClick={() => {
        if (canBrowse) onBrowse()
      }}
      onKeyDown={(event) => {
        if (!canBrowse) return
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault()
          onBrowse()
        }
      }}
    >
      <div className="rounded-full bg-neutral-800/50 p-6">
        <Upload className="h-12 w-12 text-neutral-500" />
      </div>
      <div className="space-y-2">
        <p className="text-base font-semibold text-neutral-200">
          {isTouchDevice ? "Tap to upload your artwork" : "Drag & drop your artwork here"}
        </p>
        <p className="text-sm text-neutral-400">
          {isTouchDevice ? "Supported formats: PNG, JPG, SVG, AI, PDF" : "or click to browse files"}
        </p>
      </div>
      <div className="mt-2 rounded-lg border border-neutral-700 bg-neutral-800/50 px-4 py-2 text-xs text-neutral-400">
        High-resolution PNG, JPG, SVG, AI, or PDF files (300 DPI+) yield the sharpest stickers.
      </div>
    </div>
  )
}
