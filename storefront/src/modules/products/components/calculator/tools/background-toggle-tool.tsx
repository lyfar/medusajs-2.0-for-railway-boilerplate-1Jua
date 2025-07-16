"use client"

import clsx from "clsx"
import { Eye, Sun, Moon } from "lucide-react"

interface BackgroundToggleToolProps {
  backgroundMode: 'auto' | 'light' | 'dark'
  onBackgroundModeChange: (mode: 'auto' | 'light' | 'dark') => void
  isImageDark: boolean
  isAnalyzing: boolean
}

export default function BackgroundToggleTool({ 
  backgroundMode, 
  onBackgroundModeChange, 
  isImageDark, 
  isAnalyzing 
}: BackgroundToggleToolProps) {
  const cycleBackgroundMode = () => {
    const modes: Array<'auto' | 'light' | 'dark'> = ['auto', 'light', 'dark']
    const currentIndex = modes.indexOf(backgroundMode)
    const nextIndex = (currentIndex + 1) % modes.length
    onBackgroundModeChange(modes[nextIndex])
  }

  return (
    <>
      <div className="flex flex-col gap-1">
        <button
          onClick={cycleBackgroundMode}
          className={clsx("w-10 h-10 rounded-lg flex items-center justify-center transition-colors", {
            "bg-blue-600 hover:bg-blue-500 text-white": backgroundMode === 'auto',
            "bg-yellow-600 hover:bg-yellow-500 text-white": backgroundMode === 'light',
            "bg-purple-600 hover:bg-purple-500 text-white": backgroundMode === 'dark',
          })}
          title={`Background: ${backgroundMode} - Click to cycle`}
        >
          {backgroundMode === 'auto' && <Eye className="w-4 h-4" />}
          {backgroundMode === 'light' && <Sun className="w-4 h-4" />}
          {backgroundMode === 'dark' && <Moon className="w-4 h-4" />}
        </button>
        <div className="text-xs text-neutral-400 text-center">
          {backgroundMode === 'auto' ? 'Auto' : backgroundMode === 'light' ? 'Light' : 'Dark'}
        </div>
      </div>

      {/* Color Analysis Indicator */}
      {backgroundMode === 'auto' && (
        <>
          <div className="w-8 h-px bg-neutral-600"></div>
          <div className="flex flex-col items-center gap-1">
            <div className={clsx("w-6 h-6 rounded-full border-2 flex items-center justify-center", {
              "bg-white border-neutral-600": isImageDark,
              "bg-neutral-800 border-neutral-500": !isImageDark,
            })}>
              {isAnalyzing && (
                <div className="w-3 h-3 border border-neutral-500 border-t-transparent rounded-full animate-spin"></div>
              )}
            </div>
            <div className="text-xs text-neutral-400 text-center">
              {isAnalyzing ? 'Scan' : isImageDark ? 'Dark' : 'Light'}
            </div>
          </div>
        </>
      )}
    </>
  )
} 