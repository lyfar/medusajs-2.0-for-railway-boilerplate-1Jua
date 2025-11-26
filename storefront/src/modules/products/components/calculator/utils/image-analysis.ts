import { Shape } from "../shape-selector"
import { Dimensions } from "../types"
import { loadImage } from "./image-loading"

export const MIN_PPI_WARNING = 200
export const PREFERRED_PPI = 300

export interface ImageMeta {
  width: number
  height: number
}

export interface ResolutionWarning {
  detectedPpi: number
  recommended: number
}

export interface ImageAnalysisResult {
  meta: ImageMeta | null
  isDark: boolean
  resolutionWarning: ResolutionWarning | null
}

export async function analyzeImageDataUrl(
  dataUrl: string,
  dimensions: Dimensions,
  shape: Shape
): Promise<ImageAnalysisResult> {
  try {
    const img = await loadImage(dataUrl)
    const meta = { width: img.naturalWidth || img.width, height: img.naturalHeight || img.height }
    const resolutionWarning = evaluateResolution(img, dimensions, shape)
    const isDark = isPredominantlyDarkImage(img)

    return { meta, isDark, resolutionWarning }
  } catch (error) {
    console.error("Failed to analyze image", error)
    return { meta: null, isDark: false, resolutionWarning: null }
  }
}

export function evaluateResolution(
  img: HTMLImageElement,
  dimensions: Dimensions,
  shape: Shape
): ResolutionWarning | null {
  let widthCm: number
  let heightCm: number

  if (shape === "circle" && dimensions.diameter) {
    widthCm = dimensions.diameter
    heightCm = dimensions.diameter
  } else {
    widthCm = dimensions.width || 0
    heightCm = dimensions.height || 0
  }

  if (!widthCm || !heightCm) {
    return null
  }

  const widthInches = widthCm / 2.54
  const heightInches = heightCm / 2.54
  const widthPpi = img.naturalWidth / widthInches
  const heightPpi = img.naturalHeight / heightInches
  const detectedPpi = Math.min(widthPpi, heightPpi)

  if (detectedPpi < MIN_PPI_WARNING) {
    return { detectedPpi, recommended: PREFERRED_PPI }
  }

  return null
}

export function isPredominantlyDarkImage(img: HTMLImageElement): boolean {
  const canvas = document.createElement("canvas")
  const context = canvas.getContext("2d")
  if (!context) {
    return false
  }

  canvas.width = img.naturalWidth || img.width
  canvas.height = img.naturalHeight || img.height
  if (!canvas.width || !canvas.height) {
    return false
  }

  context.drawImage(img, 0, 0, canvas.width, canvas.height)
  const { data } = context.getImageData(0, 0, canvas.width, canvas.height)

  let totalBrightness = 0
  let pixelCount = 0
  for (let i = 0; i < data.length; i += 40) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    const a = data[i + 3]
    if (a > 50) {
      const brightness = 0.299 * r + 0.587 * g + 0.114 * b
      totalBrightness += brightness
      pixelCount++
    }
  }

  const averageBrightness = pixelCount > 0 ? totalBrightness / pixelCount : 255
  return averageBrightness < 128
}
