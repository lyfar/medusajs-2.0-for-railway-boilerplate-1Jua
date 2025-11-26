'use client'

import { AlertCircle } from "lucide-react"

interface ErrorBannerProps {
  message: string | null
}

export function ErrorBanner({ message }: ErrorBannerProps) {
  if (!message) return null

  return (
    <div className="animate-in fade-in slide-in-from-top-2 mx-auto max-w-2xl">
      <div className="flex items-start gap-3 rounded-lg border border-red-500/50 bg-red-900/20 p-3 backdrop-blur-sm">
        <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-400" />
        <p className="text-sm text-red-400">{message}</p>
      </div>
    </div>
  )
}
