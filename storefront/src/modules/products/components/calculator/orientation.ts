import type { Shape } from "./shape-selector"
import type { Dimensions } from "./types"

export type Orientation = "portrait" | "landscape"

export const deriveOrientation = (shape: Shape, dimensions: Dimensions): Orientation => {
  if (shape === "circle") {
    return "landscape"
  }

  const { width, height } = dimensions

  if (!width || !height) {
    return "landscape"
  }

  if (Math.abs(width - height) < 0.1) {
    return "landscape"
  }

  return height > width ? "portrait" : "landscape"
}

export const supportsOrientation = (shape: Shape, dimensions: Dimensions): boolean => {
  if (shape === "circle" || shape === "square") {
    return false
  }

  const { width, height } = dimensions
  if (!width || !height) {
    return false
  }

  return Math.abs(width - height) >= 0.1
}

export const applyOrientationToDimensions = (
  dimensions: Dimensions,
  orientation: Orientation
): Dimensions => {
  const { width, height, diameter } = dimensions

  if (typeof diameter === "number") {
    return { diameter }
  }

  if (!width || !height) {
    return { width, height }
  }

  const shouldSwap = orientation === "portrait" ? width > height : height > width
  if (!shouldSwap) {
    return { width, height }
  }

  return { width: height, height: width }
}
