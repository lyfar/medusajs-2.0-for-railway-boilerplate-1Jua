'use client'

import { AlertCircle } from "lucide-react"

interface ResolutionWarningProps {
  warning: {
    detectedPpi: number
    recommended: number
  }
}

export function ResolutionWarning({ warning }: ResolutionWarningProps) {
  return (
    <div className="mt-3 flex items-center justify-center gap-2 text-xs text-amber-200">
      <AlertCircle className="h-3.5 w-3.5 text-amber-300" />
      <p className="text-center">
        <span className="font-medium text-amber-100">
          Low resolution (~{Math.round(warning.detectedPpi)} PPI).
        </span>{" "}
        Recommended {warning.recommended} PPI for best print quality.
      </p>
    </div>
  )
}
