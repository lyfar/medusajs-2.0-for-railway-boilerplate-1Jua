'use client'

import { useMemo, useRef, useState } from "react"

import { getContainerStyles } from "../utils/shapeStyles"
import { deriveOrientation, supportsOrientation, type Orientation } from "../orientation"
import type { Dimensions } from "../types"
import type { Shape } from "../shape-selector"

export type StickerCanvasShapeStyles = ReturnType<typeof getContainerStyles>

export function useStickerCanvas(shape: Shape, dimensions: Dimensions, compact: boolean, imageData: string | null) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const imageWrapperRef = useRef<HTMLDivElement | null>(null)
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 })

  const shapeStyles = useMemo(
    () => getContainerStyles(shape, dimensions, compact, !!imageData),
    [shape, dimensions, compact, imageData]
  )

  const stickerBorderRadius = useMemo(() => {
    switch (shape) {
      case "circle":
        return "9999px"
      case "square":
      case "rectangle":
        return "12px"
      default:
        return "16px"
    }
  }, [shape])

  const derivedOrientation = useMemo(() => deriveOrientation(shape, dimensions), [shape, dimensions])
  const orientationSupported = supportsOrientation(shape, dimensions)

  const stickerAreaSize = useMemo(() => {
    const containerW = containerSize.width || 0
    const containerH = containerSize.height || 0
    if (!containerW || !containerH) return { width: 0, height: 0 }

    const pxW = shapeStyles.pixelWidth || containerW
    const pxH = shapeStyles.pixelHeight || containerH
    const ratio = pxH / pxW || 1

    let w = Math.min(pxW, containerW)
    let h = w * ratio
    if (h > containerH) {
      h = Math.min(pxH, containerH)
      w = h / ratio
    }
    return { width: Math.max(1, Math.round(w)), height: Math.max(1, Math.round(h)) }
  }, [shapeStyles.pixelWidth, shapeStyles.pixelHeight, containerSize.width, containerSize.height])

  const isOrientationAdjustable = orientationSupported

  return {
    containerRef,
    imageWrapperRef,
    containerSize,
    setContainerSize,
    shapeStyles,
    stickerBorderRadius,
    stickerAreaSize,
    derivedOrientation,
    isOrientationAdjustable,
  }
}
