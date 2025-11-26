'use client'

import { useCallback, useEffect, useRef, useState } from "react"

import { clamp } from "../utils/math"

export type Point = { x: number; y: number }

type ActiveTransform =
  | null
  | {
      type: "scale"
      initialScale: number
      initialDistance: number
      pointerId: number
      target: Element
    }
  | {
      type: "rotate"
      initialRotation: number
      initialAngle: number
      pointerId: number
      target: Element
    }

interface UseImageTransformsProps {
  imageData: string | null
  getWrapperCenter: () => { x: number; y: number } | null
  setIsImageSelected: (value: boolean) => void
}

export function useImageTransforms({
  imageData,
  getWrapperCenter,
  setIsImageSelected,
}: UseImageTransformsProps) {
  const [scale, setScale] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [position, setPosition] = useState<Point>({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)

  const dragStateRef = useRef<{ start: Point; startPosition: Point } | null>(null)
  const pinchStateRef = useRef<{ initialDistance: number; initialScale: number } | null>(null)
  const activeTransformRef = useRef<ActiveTransform>(null)

  const startDrag = useCallback(
    (point: Point) => {
      if (!imageData) return
      setIsDragging(true)
      dragStateRef.current = {
        start: point,
        startPosition: position,
      }
    },
    [imageData, position]
  )

  const updateDrag = useCallback(
    (point: Point) => {
      if (!imageData || !dragStateRef.current || !isDragging) return

      const deltaX = point.x - dragStateRef.current.start.x
      const deltaY = point.y - dragStateRef.current.start.y

      setPosition({
        x: dragStateRef.current.startPosition.x + deltaX,
        y: dragStateRef.current.startPosition.y + deltaY,
      })
    },
    [imageData, isDragging]
  )

  const endDrag = useCallback(() => {
    dragStateRef.current = null
    setIsDragging(false)
  }, [])

  const handleMouseDown = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (event.button !== 0 || !imageData) return
      event.preventDefault()
      setIsImageSelected(true)
      startDrag({ x: event.clientX, y: event.clientY })
    },
    [imageData, setIsImageSelected, startDrag]
  )

  useEffect(() => {
    const handleMove = (event: MouseEvent) => {
      if (isDragging) {
        updateDrag({ x: event.clientX, y: event.clientY })
      }
    }
    const handleUp = () => {
      endDrag()
    }

    document.addEventListener("mousemove", handleMove)
    document.addEventListener("mouseup", handleUp)
    return () => {
      document.removeEventListener("mousemove", handleMove)
      document.removeEventListener("mouseup", handleUp)
    }
  }, [isDragging, updateDrag, endDrag])

  const handleTouchStart = useCallback(
    (event: React.TouchEvent<HTMLDivElement>) => {
      if (!imageData) return
      setIsImageSelected(true)
      if (event.touches.length === 1) {
        const touch = event.touches[0]
        startDrag({ x: touch.clientX, y: touch.clientY })
      } else if (event.touches.length === 2) {
        const [t1, t2] = Array.from(event.touches)
        pinchStateRef.current = {
          initialDistance: distanceBetweenTouches(t1, t2),
          initialScale: scale,
        }
      }
    },
    [imageData, setIsImageSelected, startDrag, scale]
  )

  const handleTouchMove = useCallback(
    (event: React.TouchEvent<HTMLDivElement>) => {
      if (!imageData) return

      if (event.touches.length === 1 && isDragging) {
        const touch = event.touches[0]
        updateDrag({ x: touch.clientX, y: touch.clientY })
      } else if (event.touches.length === 2 && pinchStateRef.current) {
        event.preventDefault()
        const [t1, t2] = Array.from(event.touches)
        const distance = distanceBetweenTouches(t1, t2)
        const nextScale =
          (pinchStateRef.current.initialScale * distance) /
          (pinchStateRef.current.initialDistance || distance)
        setScale(clamp(nextScale, 0.5, 3))
      }
    },
    [imageData, isDragging, updateDrag]
  )

  const handleTouchEnd = useCallback(() => {
    pinchStateRef.current = null
    endDrag()
  }, [endDrag])

  const startScaleHandleDrag = useCallback(
    (event: React.PointerEvent<HTMLButtonElement>) => {
      if (!imageData) return
      event.preventDefault()
      event.stopPropagation()
      const center = getWrapperCenter()
      if (!center) {
        return
      }

      const element = event.currentTarget
      if (element.setPointerCapture) {
        element.setPointerCapture(event.pointerId)
      }

      const initialDistance = Math.hypot(event.clientX - center.x, event.clientY - center.y) || 1

      activeTransformRef.current = {
        type: "scale",
        initialScale: scale,
        initialDistance,
        pointerId: event.pointerId,
        target: element,
      }

      setIsImageSelected(true)
    },
    [getWrapperCenter, imageData, scale, setIsImageSelected]
  )

  const startRotateHandleDrag = useCallback(
    (event: React.PointerEvent<HTMLButtonElement>) => {
      if (!imageData) return
      event.preventDefault()
      event.stopPropagation()
      const center = getWrapperCenter()
      if (!center) {
        return
      }

      const element = event.currentTarget
      if (element.setPointerCapture) {
        element.setPointerCapture(event.pointerId)
      }

      const initialAngle = Math.atan2(event.clientY - center.y, event.clientX - center.x)

      activeTransformRef.current = {
        type: "rotate",
        initialRotation: rotation,
        initialAngle,
        pointerId: event.pointerId,
        target: element,
      }

      setIsImageSelected(true)
    },
    [getWrapperCenter, imageData, rotation, setIsImageSelected]
  )

  const handlePointerMove = useCallback(
    (event: PointerEvent) => {
      const active = activeTransformRef.current
      if (!active || event.pointerId !== active.pointerId) {
        return
      }

      const center = getWrapperCenter()
      if (!center) {
        return
      }

      event.preventDefault()

      if (active.type === "scale") {
        const distance = Math.hypot(event.clientX - center.x, event.clientY - center.y)
        if (!distance || !active.initialDistance) {
          return
        }
        const ratio = distance / active.initialDistance
        const nextScale = clamp(active.initialScale * ratio, 0.5, 3)
        setScale(nextScale)
      } else if (active.type === "rotate") {
        const currentAngle = Math.atan2(event.clientY - center.y, event.clientX - center.x)
        const delta = currentAngle - active.initialAngle
        let next = active.initialRotation + (delta * 180) / Math.PI
        if (next > 180) {
          next -= 360
        } else if (next <= -180) {
          next += 360
        }
        setRotation(Math.max(-180, Math.min(180, next)))
      }
    },
    [getWrapperCenter]
  )

  useEffect(() => {
    const handlePointerUp = (event: PointerEvent) => {
      const active = activeTransformRef.current
      if (!active || event.pointerId !== active.pointerId) {
        return
      }

      if (active.target?.releasePointerCapture) {
        active.target.releasePointerCapture(active.pointerId)
      }

      activeTransformRef.current = null
    }

    document.addEventListener("pointermove", handlePointerMove, { passive: false })
    document.addEventListener("pointerup", handlePointerUp)
    document.addEventListener("pointercancel", handlePointerUp)

    return () => {
      document.removeEventListener("pointermove", handlePointerMove)
      document.removeEventListener("pointerup", handlePointerUp)
      document.removeEventListener("pointercancel", handlePointerUp)
    }
  }, [handlePointerMove])

  return {
    scale,
    setScale,
    rotation,
    setRotation,
    position,
    setPosition,
    handleMouseDown,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    startScaleHandleDrag,
    startRotateHandleDrag,
  }
}

function distanceBetweenTouches(t1: React.Touch, t2: React.Touch) {
  const dx = t1.clientX - t2.clientX
  const dy = t1.clientY - t2.clientY
  return Math.hypot(dx, dy)
}
