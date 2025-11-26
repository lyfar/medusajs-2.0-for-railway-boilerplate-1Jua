'use client'

import { MousePointerClick } from "lucide-react"
import clsx from "clsx"

type Shortcut = { keys: string[]; description: string }

interface KeyboardShortcutsModalProps {
  open: boolean
  onClose: () => void
}

const transformShortcuts: Shortcut[] = [
  { keys: ["Drag"], description: "Move artwork" },
  { keys: ["Ctrl", "Scroll"], description: "Zoom in/out" },
  { keys: ["+"], description: "Zoom in" },
  { keys: ["-"], description: "Zoom out" },
  { keys: ["["], description: "Rotate left" },
  { keys: ["]"], description: "Rotate right" },
]

const positionShortcuts: Shortcut[] = [
  { keys: ["↑", "↓", "←", "→"], description: "Move 1px" },
  { keys: ["Shift", "↑", "↓", "←", "→"], description: "Move 10px" },
]

const historyShortcuts: Shortcut[] = [
  { keys: ["Ctrl", "Z"], description: "Undo" },
  { keys: ["Ctrl", "Shift", "Z"], description: "Redo" },
  { keys: ["Ctrl", "Y"], description: "Redo (alternative)" },
]

const otherShortcuts: Shortcut[] = [
  { keys: ["R"], description: "Reset layout" },
  { keys: ["?"], description: "Show this help" },
]

const sections = [
  { title: "Transform", items: transformShortcuts },
  { title: "Position", items: positionShortcuts },
  { title: "History", items: historyShortcuts },
  { title: "Other", items: otherShortcuts },
]

export function KeyboardShortcutsModal({ open, onClose }: KeyboardShortcutsModalProps) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-xl border border-neutral-700 bg-neutral-900 p-6 shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-xl font-bold text-white">
            <MousePointerClick className="h-5 w-5 text-indigo-400" />
            Keyboard Shortcuts
          </h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-white"
            aria-label="Close keyboard shortcuts"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          {sections.map((section) => (
            <div key={section.title} className="space-y-2">
              <h4 className="text-sm font-semibold text-neutral-300">{section.title}</h4>
              <div className="grid gap-2">
                {section.items.map((item) => (
                  <ShortcutItem key={item.description} {...item} />
                ))}
              </div>
            </div>
          ))}

          <div className="mt-6 rounded-lg border border-indigo-800/30 bg-indigo-950/30 p-3 text-xs text-indigo-200">
            💡 Tip: Use keyboard shortcuts for faster and more precise editing!
          </div>
        </div>
      </div>
    </div>
  )
}

function ShortcutItem({ keys, description }: Shortcut) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-neutral-800/50 px-3 py-2">
      <div className="flex items-center gap-1.5">
        {keys.map((key, index) => (
          <span key={`${key}-${index}`} className="flex items-center gap-1">
            {index > 0 && <span className="text-xs text-neutral-600">+</span>}
            <kbd className="min-w-[28px] rounded bg-neutral-700 px-2 py-1 text-center text-xs font-semibold text-neutral-200 shadow-sm">
              {key}
            </kbd>
          </span>
        ))}
      </div>
      <span className="text-sm text-neutral-400">{description}</span>
    </div>
  )
}
