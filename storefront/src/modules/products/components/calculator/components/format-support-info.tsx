'use client'

import { Info } from "lucide-react"

export function FormatSupportInfo() {
  return (
    <div className="flex items-center justify-center gap-2 rounded-lg bg-neutral-900/40 px-4 py-2 text-xs text-neutral-400">
      <Info className="h-3.5 w-3.5 text-neutral-500" />
      <span>PNG, JPG, WebP, TIFF, HEIC, SVG, AI/EPS, PDF (300 DPI+)</span>
    </div>
  )
}
