'use client'

import { useEffect } from "react"

type Point = { x: number; y: number }

interface UseKeyboardShortcutsProps {
  imageData: string | null
  handleUndo: () => void
  handleRedo: () => void
  handleReset: () => void
  handleScaleChange: (delta: number) => void
  handleRotationChange: (delta: number) => void
  setPosition: (updater: (p: Point) => Point) => void
  setShowKeyboardHints: (updater: (prev: boolean) => boolean) => void
}

export function useKeyboardShortcuts({
  imageData,
  handleUndo,
  handleRedo,
  handleReset,
  handleScaleChange,
  handleRotationChange,
  setPosition,
  setShowKeyboardHints,
}: UseKeyboardShortcutsProps) {
  useEffect(() => {
    if (!imageData) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return
      }

      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0
      const modKey = isMac ? event.metaKey : event.ctrlKey

      if (modKey && event.key === "z" && !event.shiftKey) {
        event.preventDefault()
        handleUndo()
      } else if ((modKey && event.shiftKey && event.key === "z") || (modKey && event.key === "y")) {
        event.preventDefault()
        handleRedo()
      } else if (event.key === "r" || event.key === "R") {
        event.preventDefault()
        handleReset()
      } else if (event.key === "+" || event.key === "=") {
        event.preventDefault()
        handleScaleChange(0.1)
      } else if (event.key === "-") {
        event.preventDefault()
        handleScaleChange(-0.1)
      } else if (event.key === "[") {
        event.preventDefault()
        handleRotationChange(-5)
      } else if (event.key === "]") {
        event.preventDefault()
        handleRotationChange(5)
      } else if (event.key.startsWith("Arrow")) {
        event.preventDefault()
        const step = event.shiftKey ? 10 : 1
        setPosition((p) => {
          switch (event.key) {
            case "ArrowUp":
              return { ...p, y: p.y - step }
            case "ArrowDown":
              return { ...p, y: p.y + step }
            case "ArrowLeft":
              return { ...p, x: p.x - step }
            case "ArrowRight":
              return { ...p, x: p.x + step }
            default:
              return p
          }
        })
      } else if (event.key === "?" && event.shiftKey) {
        event.preventDefault()
        setShowKeyboardHints((prev) => !prev)
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [imageData, handleUndo, handleRedo, handleReset, handleScaleChange, handleRotationChange, setPosition, setShowKeyboardHints])
}
