import { Shape } from "../shape-selector"
import { Dimensions } from "../types"
import { SIZE_PRESETS, SizeDimensions, SizePresetKey } from "../size-presets"
import { loadImage } from "./image-loading"

const PRESET_MATCH_TOLERANCE = 0.08
const SQUARE_THRESHOLD = 0.05
const CUSTOM_BASE_AREA_CM2 = 60
const ROUND_STEP = 0.5

const shapePriorityDefault: Record<Shape, number> = {
  square: 0,
  rectangle: 1,
  diecut: 2,
  circle: 3,
}

const shapePriorityTransparent: Record<Shape, number> = {
  circle: 0,
  diecut: 1,
  square: 2,
  rectangle: 3,
}

export type AutoConfigureSuggestion = {
  shape: Shape
  dimensions: Dimensions
  presetKey?: SizePresetKey | "Custom"
  orientation?: "landscape" | "portrait"
}

const getNormalizedRatio = (width: number, height: number) => {
  const larger = Math.max(width, height)
  const smaller = Math.max(1, Math.min(width, height))
  return larger / smaller
}

const getPresetRatio = (dimensions: SizeDimensions) => {
  if (dimensions.diameter) {
    return 1
  }
  if (!dimensions.width || !dimensions.height) {
    return null
  }
  const larger = Math.max(dimensions.width, dimensions.height)
  const smaller = Math.max(0.1, Math.min(dimensions.width, dimensions.height))
  return larger / smaller
}

const orientDimensions = (
  dimensions: SizeDimensions,
  isLandscape: boolean
): Dimensions => {
  if (dimensions.diameter) {
    return { diameter: dimensions.diameter }
  }

  if (!dimensions.width || !dimensions.height) {
    return {}
  }

  const presetIsLandscape = dimensions.width >= dimensions.height
  if (presetIsLandscape === isLandscape) {
    return { width: dimensions.width, height: dimensions.height }
  }

  return { width: dimensions.height, height: dimensions.width }
}

const roundDimension = (value: number) => {
  const rounded = Math.round((value / ROUND_STEP)) * ROUND_STEP
  return Math.min(50, Math.max(1, Number(rounded.toFixed(2))))
}

const computeCustomSuggestion = (
  width: number,
  height: number,
  hasTransparency: boolean
): AutoConfigureSuggestion => {
  const normalizedRatio = getNormalizedRatio(width, height)
  const isLandscape = width >= height
  const nearSquare = Math.abs(normalizedRatio - 1) <= SQUARE_THRESHOLD

  if (hasTransparency && nearSquare) {
    const diameter = roundDimension(Math.sqrt((CUSTOM_BASE_AREA_CM2 * 4) / Math.PI))
    return {
      shape: "circle",
      dimensions: { diameter },
      presetKey: "Custom",
      orientation: "portrait",
    }
  }

  const baseShape: Shape = hasTransparency
    ? (nearSquare ? "circle" : "diecut")
    : (nearSquare ? "square" : "rectangle")

  if (baseShape === "circle") {
    const diameter = roundDimension(Math.sqrt((CUSTOM_BASE_AREA_CM2 * 4) / Math.PI))
    return {
      shape: "circle",
      dimensions: { diameter },
      presetKey: "Custom",
      orientation: "landscape",
    }
  }

  const longSide = Math.sqrt(CUSTOM_BASE_AREA_CM2 * normalizedRatio)
  const shortSide = CUSTOM_BASE_AREA_CM2 / longSide

  const roundedLong = roundDimension(longSide)
  const roundedShort = roundDimension(shortSide)

  const dimensions = isLandscape
    ? { width: roundedLong, height: roundedShort }
    : { width: roundedShort, height: roundedLong }

  return {
    shape: baseShape,
    dimensions,
    presetKey: "Custom",
    orientation: isLandscape ? "landscape" : "portrait",
  }
}

const computePresetSuggestion = (
  width: number,
  height: number,
  hasTransparency: boolean
): AutoConfigureSuggestion | null => {
  const isLandscape = width >= height
  const normalizedRatio = getNormalizedRatio(width, height)
  const priorities = hasTransparency ? shapePriorityTransparent : shapePriorityDefault

  let bestSuggestion: AutoConfigureSuggestion | null = null
  let bestDiff = Number.POSITIVE_INFINITY
  let bestPriority = Number.POSITIVE_INFINITY

  const shapeEntries = Object.entries(SIZE_PRESETS) as Array<[
    Shape,
    Record<SizePresetKey, SizeDimensions>
  ]>

  for (const [shape, presets] of shapeEntries) {
    const priority = priorities[shape] ?? Number.MAX_SAFE_INTEGER
    const presetEntries = Object.entries(presets) as Array<[SizePresetKey, SizeDimensions]>

    for (const [presetKey, presetDimensions] of presetEntries) {
      const presetRatio = getPresetRatio(presetDimensions)
      if (!presetRatio) {
        continue
      }

      const diff = Math.abs(normalizedRatio - presetRatio)
      if (diff > PRESET_MATCH_TOLERANCE) {
        continue
      }

      if (
        !bestSuggestion ||
        diff < bestDiff - 0.01 ||
        (Math.abs(diff - bestDiff) <= 0.01 && priority < bestPriority)
      ) {
        bestDiff = diff
        bestPriority = priority
        bestSuggestion = {
          shape,
          dimensions: orientDimensions(presetDimensions, isLandscape),
          presetKey,
          orientation: isLandscape ? "landscape" : "portrait",
        }
      }
    }
  }

  return bestSuggestion
}

export const deriveAutoConfigureSuggestion = async (
  dataUrl: string,
  fileType: string,
  checkTransparency: (img: HTMLImageElement, type: string) => boolean
): Promise<AutoConfigureSuggestion | null> => {
  try {
    const img = await loadImage(dataUrl)
    const naturalWidth = img.naturalWidth || img.width
    const naturalHeight = img.naturalHeight || img.height
    if (!naturalWidth || !naturalHeight) {
      return null
    }

    const hasTransparency = checkTransparency(img, fileType)
    const presetMatch = computePresetSuggestion(naturalWidth, naturalHeight, hasTransparency)
    if (presetMatch) {
      return presetMatch
    }

    return computeCustomSuggestion(naturalWidth, naturalHeight, hasTransparency)
  } catch (error) {
    console.warn("Failed to derive auto configuration from image", error)
    return null
  }
}
