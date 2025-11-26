'use client'

import { Check } from "lucide-react"

interface SaveSuccessOverlayProps {
  open: boolean
}

export function SaveSuccessOverlay({ open }: SaveSuccessOverlayProps) {
  if (!open) return null

  return (
    <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center animate-in fade-in duration-300">
      <div className="rounded-xl border border-emerald-500/50 bg-emerald-900/95 p-5 shadow-2xl backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 shadow-lg">
            <Check className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="font-semibold text-emerald-50">Design saved!</p>
            <p className="text-sm text-emerald-100/80">
              Your edited artwork is stored locally and will upload when you add it to the cart.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
