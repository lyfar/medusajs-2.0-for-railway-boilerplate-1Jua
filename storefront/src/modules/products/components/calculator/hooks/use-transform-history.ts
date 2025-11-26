'use client'

import { useCallback, useEffect, useRef, useState } from "react"

type Point = { x: number; y: number }

export interface TransformState {
  scale: number
  rotation: number
  position: Point
}

interface UseTransformHistoryProps {
  scale: number
  rotation: number
  position: Point
  setScale: (value: number | ((prev: number) => number)) => void
  setRotation: (value: number | ((prev: number) => number)) => void
  setPosition: (value: Point | ((prev: Point) => Point)) => void
  imageData: string | null
}

export function useTransformHistory({
  scale,
  rotation,
  position,
  setScale,
  setRotation,
  setPosition,
  imageData,
}: UseTransformHistoryProps) {
  const [history, setHistory] = useState<TransformState[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const historyIndexRef = useRef(-1)
  const isApplyingHistoryRef = useRef(false)

  useEffect(() => {
    historyIndexRef.current = historyIndex
  }, [historyIndex])

  useEffect(() => {
    if (!imageData) {
      setHistory([])
      setHistoryIndex(-1)
      historyIndexRef.current = -1
      return
    }

    if (isApplyingHistoryRef.current) return

    const timer = setTimeout(() => {
      const nextState: TransformState = { scale, rotation, position }
      setHistory((prev) => {
        const currentIndex = historyIndexRef.current
        const lastState = prev[currentIndex]

        if (
          lastState &&
          lastState.scale === nextState.scale &&
          lastState.rotation === nextState.rotation &&
          lastState.position.x === nextState.position.x &&
          lastState.position.y === nextState.position.y
        ) {
          return prev
        }

        const newHistory = prev.slice(0, currentIndex + 1)
        newHistory.push(nextState)

        if (newHistory.length > 50) {
          newHistory.shift()
        }

        const newIndex = newHistory.length - 1
        setHistoryIndex(newIndex)
        historyIndexRef.current = newIndex
        return newHistory
      })
    }, 300)

    return () => clearTimeout(timer)
  }, [scale, rotation, position, imageData])

  const resetHistory = useCallback((state: TransformState) => {
    setHistory([state])
    setHistoryIndex(0)
    historyIndexRef.current = 0
  }, [])

  const handleUndo = useCallback(() => {
    if (historyIndexRef.current <= 0 || history.length === 0) return

    const previousState = history[historyIndexRef.current - 1]
    if (!previousState) return

    isApplyingHistoryRef.current = true
    setScale(previousState.scale)
    setRotation(previousState.rotation)
    setPosition(previousState.position)

    setHistoryIndex((prev) => {
      const nextIndex = Math.max(0, prev - 1)
      historyIndexRef.current = nextIndex
      return nextIndex
    })

    setTimeout(() => {
      isApplyingHistoryRef.current = false
    }, 0)
  }, [history, setPosition, setRotation, setScale])

  const handleRedo = useCallback(() => {
    if (historyIndexRef.current >= history.length - 1) return

    const nextState = history[historyIndexRef.current + 1]
    if (!nextState) return

    isApplyingHistoryRef.current = true
    setScale(nextState.scale)
    setRotation(nextState.rotation)
    setPosition(nextState.position)

    setHistoryIndex((prev) => {
      const nextIndex = Math.min(history.length - 1, prev + 1)
      historyIndexRef.current = nextIndex
      return nextIndex
    })

    setTimeout(() => {
      isApplyingHistoryRef.current = false
    }, 0)
  }, [history, setPosition, setRotation, setScale])

  const hasHistory = history.length > 0

  return {
    canUndo: historyIndexRef.current > 0 && history.length > 1,
    canRedo: historyIndexRef.current < history.length - 1 && hasHistory,
    handleUndo,
    handleRedo,
    resetHistory,
  }
}
