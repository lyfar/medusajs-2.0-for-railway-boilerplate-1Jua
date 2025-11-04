import { CSSProperties } from 'react'
import { Shape } from '../shape-selector'

export interface Dimensions {
  width?: number
  height?: number
  diameter?: number
}

export type ContainerStyles = CSSProperties & {
  position: 'relative'
}

export interface ShapeStyleConfig {
  containerStyles: ContainerStyles
  clipPath?: string
  borderRadius?: string
  pixelWidth: number
  pixelHeight: number
}

/**
 * Calculate optimal container dimensions based on shape and dimensions
 */
export function getContainerStyles(
  shape: Shape,
  dimensions: Dimensions,
  compact: boolean = false,
  hasImage: boolean = false
): ShapeStyleConfig {
  const fallback = {
    width: dimensions.width ?? dimensions.diameter ?? 10,
    height: dimensions.height ?? dimensions.diameter ?? 10,
  }

  let widthCm: number
  let heightCm: number

  switch (shape) {
    case "circle":
      widthCm = heightCm = dimensions.diameter ?? Math.max(fallback.width, fallback.height)
      break
    case "square":
      widthCm = heightCm = dimensions.width ?? fallback.width
      break
    case "rectangle":
    case "diecut":
      widthCm = dimensions.width ?? fallback.width
      heightCm = dimensions.height ?? fallback.height
      break
    default:
      widthCm = fallback.width
      heightCm = fallback.height
  }

  // Prevent zero dimensions
  widthCm = Math.max(widthCm, 1)
  heightCm = Math.max(heightCm, 1)

  const aspectRatio = widthCm / heightCm
  const maxBounding = compact ? 280 : 500
  const minBounding = compact ? 180 : 280

  let pixelWidth: number
  let pixelHeight: number

  // For square and circle, ALWAYS enforce equal dimensions regardless of input
  if (shape === "circle" || shape === "square") {
    // Use the larger dimension or diameter for sizing
    const baseDimension = shape === "circle" 
      ? (dimensions.diameter || 10)
      : Math.max(widthCm, heightCm)
    
    // Calculate size based on the base dimension but cap it
    const scaleFactor = Math.min(maxBounding / baseDimension, maxBounding / 10)
    const size = Math.min(Math.max(baseDimension * 40, minBounding), maxBounding)
    
    pixelWidth = size
    pixelHeight = size
  } else {
    // For rectangles, maintain aspect ratio but constrain to screen
    const scaleFactor = Math.min(
      maxBounding / Math.max(widthCm, heightCm),
      500 / Math.max(widthCm, heightCm)
    )
    
    pixelWidth = widthCm * scaleFactor
    pixelHeight = heightCm * scaleFactor
    
    // Ensure minimums
    if (pixelWidth < minBounding * 0.5) {
      const scale = (minBounding * 0.5) / pixelWidth
      pixelWidth = minBounding * 0.5
      pixelHeight = pixelHeight * scale
    }
    if (pixelHeight < minBounding * 0.5) {
      const scale = (minBounding * 0.5) / pixelHeight
      pixelHeight = minBounding * 0.5
      pixelWidth = pixelWidth * scale
    }
    
    // Cap maximums
    if (pixelWidth > 600) {
      const scale = 600 / pixelWidth
      pixelWidth = 600
      pixelHeight = pixelHeight * scale
    }
    if (pixelHeight > 500) {
      const scale = 500 / pixelHeight
      pixelHeight = 500
      pixelWidth = pixelWidth * scale
    }
  }

  pixelWidth = Math.round(pixelWidth)
  pixelHeight = Math.round(pixelHeight)

  const containerStyles: ContainerStyles = {
    width: shape === "circle" || shape === "square" ? `${pixelWidth}px` : "100%",
    height: shape === "circle" || shape === "square" ? `${pixelHeight}px` : "auto",
    maxWidth: `${pixelWidth}px`,
    maxHeight: `${pixelHeight}px`,
    minWidth: "0px",
    aspectRatio: shape === "circle" || shape === "square" ? "1 / 1" : `${pixelWidth} / ${pixelHeight}`,
    position: "relative",
    overflow: "hidden",
    flexShrink: 0,
  }

  // Generate shape-specific styles
  let clipPath: string | undefined
  let borderRadius: string | undefined

  switch (shape) {
    case "circle":
      borderRadius = "50%"
      break
    case "rectangle":
    case "square":
      borderRadius = "12px"
      break
    case "diecut":
      // For die-cut, only show star placeholder when no image is uploaded
      // Once an image is uploaded, let the image's natural transparency define the shape
      if (!hasImage) {
        clipPath = "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)"
      }
      break
  }

  return {
    containerStyles,
    clipPath,
    borderRadius,
    pixelWidth,
    pixelHeight,
  }
}

/**
 * Get safety margin styles based on shape
 */
export function getSafetyMarginStyles(shape: Shape) {
  const baseStyle = {
    border: "2px dashed #fbbf24", // amber-400
    width: "calc(100% - 16px)",
    height: "calc(100% - 16px)",
    position: "absolute" as const,
    top: "8px",
    left: "8px",
    zIndex: 9,
    pointerEvents: "none" as const,
    borderRadius: shape === "circle" ? "50%" : "8px",
    boxShadow: "0 0 0 2px rgba(251, 191, 36, 0.3)",
  }

  switch (shape) {
    case "circle":
      return {
        ...baseStyle,
        borderRadius: "50%",
        width: "calc(100% - 12px)",
        height: "calc(100% - 12px)",
        top: "6px",
        left: "6px",
      }
    case "rectangle":
    case "square":
      return {
        ...baseStyle,
        borderRadius: "8px",
        width: "calc(100% - 12px)",
        height: "calc(100% - 12px)",
        top: "6px",
        left: "6px",
      }
    case "diecut":
      // For die-cut, the safety margin is implied within the outline,
      // so we don't render a separate visible margin.
      return { display: "none" }
    default:
      return {}
  }
}

/**
 * Get cut line styles based on shape
 */
export function getCutLineStyles(shape: Shape) {
  switch (shape) {
    case "circle":
      return {
        border: "3px dashed #ef4444",
        borderRadius: "50%",
      }
    case "rectangle":
    case "square":
      return {
        border: "3px dashed #ef4444",
        borderRadius: "12px",
      }
    case "diecut":
      return {
        // In die-cut, the outline itself is the cutline
        border: "none",
      }
    default:
      return {
        border: "none",
      }
  }
} 
