"use client"

import clsx from "clsx"
import { Scissors } from "lucide-react"

interface CutlinesToggleToolProps {
  showCutlines: boolean
  onToggleCutlines: () => void
}

export default function CutlinesToggleTool({ showCutlines, onToggleCutlines }: CutlinesToggleToolProps) {
  return (
    <div className="flex flex-col gap-1">
      <button
        onClick={onToggleCutlines}
        className={clsx("w-10 h-10 rounded-lg flex items-center justify-center transition-colors", {
          "bg-red-600 hover:bg-red-500 text-white": showCutlines,
          "bg-neutral-700 hover:bg-neutral-600 text-neutral-400": !showCutlines,
        })}
        title={`${showCutlines ? 'Hide' : 'Show'} cut lines`}
      >
        <Scissors className="w-4 h-4" />
      </button>
      <div className="text-xs text-neutral-400 text-center">
        {showCutlines ? 'On' : 'Off'}
      </div>
    </div>
  )
} 