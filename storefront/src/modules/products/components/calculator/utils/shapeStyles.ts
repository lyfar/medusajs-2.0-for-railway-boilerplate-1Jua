import { Shape } from '../shape-selector'

export interface Dimensions {
  width?: number
  height?: number
  diameter?: number
}

export interface ContainerStyles {
  width: string
  height: string
  position: 'relative'
  overflow: 'visible'
}

export interface ShapeStyleConfig {
  containerStyles: ContainerStyles
  clipPath?: string
  borderRadius?: string
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
  // Fixed maximum dimensions for consistent layout
  const maxWidth = compact ? 200 : 400
  const maxHeight = compact ? 150 : 300
  const minSize = compact ? 100 : 150
  let width: number
  let height: number

  if (shape === "circle" && dimensions.diameter) {
    width = height = Math.min(
      maxWidth,
      maxHeight,
      Math.max(minSize, dimensions.diameter * (compact ? 15 : 25))
    )
  } else if (shape === "square") {
    width = height = Math.min(
      maxWidth,
      maxHeight,
      Math.max(minSize, (dimensions.width || 8) * (compact ? 15 : 25))
    )
  } else if (shape === "rectangle" || shape === "diecut") {
    if (dimensions.width && dimensions.height) {
      const aspectRatio = dimensions.width / dimensions.height

      // Calculate optimal size within constraints
      const baseWidth = Math.max(
        minSize,
        dimensions.width * (compact ? 15 : 25)
      )
      const baseHeight = Math.max(
        minSize,
        dimensions.height * (compact ? 15 : 25)
      )

      // Fit within container bounds
      width = Math.min(baseWidth, maxWidth, maxHeight * aspectRatio)
      height = width / aspectRatio

      if (height > maxHeight || height < minSize) {
        height = Math.min(
          maxHeight,
          Math.max(minSize, dimensions.height * (compact ? 15 : 25))
        )
        width = height * aspectRatio
        if (width > maxWidth) {
          width = maxWidth
          height = width / aspectRatio
        }
      }
    } else {
      width = Math.min(maxWidth, maxHeight)
      height = Math.min(maxWidth, maxHeight)
    }
  } else {
    width = Math.min(maxWidth, maxHeight)
    height = Math.min(maxWidth, maxHeight)
  }

  // Ensure minimum size and add responsive constraints
  width = Math.max(width, compact ? 100 : 150)
  height = Math.max(height, compact ? 100 : 150)

  const containerStyles: ContainerStyles = {
    width: `${width}px`,
    height: `${height}px`,
    position: "relative",
    overflow: "visible", // Allow outline to spill
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