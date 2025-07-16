import { useState, useEffect, useCallback } from 'react'

interface UseTransparencyCheckProps {
  imageDataUrl: string | null
  fileType?: string
  shape?: string // Add shape to determine if we should be more aggressive with transparency detection
}

interface UseTransparencyCheckReturn {
  hasTransparency: boolean
  isChecking: boolean
  checkTransparency: (img: HTMLImageElement, fileType: string) => boolean
}

export function useTransparencyCheck({ 
  imageDataUrl, 
  fileType,
  shape
}: UseTransparencyCheckProps): UseTransparencyCheckReturn {
  const [hasTransparency, setHasTransparency] = useState(false)
  const [isChecking, setIsChecking] = useState(false)

  /**
   * Check if an image has transparency by analyzing alpha channel
   * Only works for PNG files as other formats don't support transparency
   */
  const checkTransparency = useCallback((img: HTMLImageElement, type: string): boolean => {
    // Only check PNG files for transparency
    if (type !== "image/png") {
      return false
    }

    try {
      const tempCanvas = document.createElement("canvas")
      tempCanvas.width = img.width
      tempCanvas.height = img.height
      const tempCtx = tempCanvas.getContext("2d")
      
      if (!tempCtx) {
        console.warn("Failed to get canvas context for transparency check")
        return false
      }

      tempCtx.drawImage(img, 0, 0)
      const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height)
      const { data } = imageData

      // Check alpha channel (every 4th value) for any transparency
      // Also check for semi-transparent pixels and edge transparency
      for (let i = 3; i < data.length; i += 4) {
        if (data[i] < 255) {
          return true
        }
      }

      // Additional check for edge transparency (common in die-cut images)
      const width = tempCanvas.width
      const height = tempCanvas.height
      
      // Check edges for transparency patterns
      for (let x = 0; x < width; x++) {
        const topPixel = (0 * width + x) * 4 + 3
        const bottomPixel = ((height - 1) * width + x) * 4 + 3
        if (data[topPixel] < 255 || data[bottomPixel] < 255) {
          return true
        }
      }
      
      for (let y = 0; y < height; y++) {
        const leftPixel = (y * width + 0) * 4 + 3
        const rightPixel = (y * width + (width - 1)) * 4 + 3
        if (data[leftPixel] < 255 || data[rightPixel] < 255) {
          return true
        }
      }

      return false
    } catch (error) {
      console.warn("Failed to check transparency:", error)
      return false
    }
  }, [])

  /**
   * Effect to automatically check transparency when image changes
   */
  useEffect(() => {
    if (!imageDataUrl || !fileType) {
      setHasTransparency(false)
      return
    }

    // For die-cut shapes, treat any PNG as potentially having custom shape
    // For other shapes, only check PNG files
    if (fileType !== "image/png") {
      setHasTransparency(false)
      return
    }

    // For die-cut shapes, be more aggressive about detecting custom shapes
    if (shape === "diecut" && fileType === "image/png") {
      // Assume die-cut PNGs should follow image shape unless proven otherwise
      setHasTransparency(true)
      setIsChecking(true)
    }

    setIsChecking(true)

    const img = new Image()
    img.onload = () => {
      try {
        const transparency = checkTransparency(img, fileType)
        setHasTransparency(transparency)
      } catch (error) {
        console.warn("Error during transparency check:", error)
        setHasTransparency(false)
      } finally {
        setIsChecking(false)
      }
    }

    img.onerror = () => {
      console.warn("Failed to load image for transparency check")
      setHasTransparency(false)
      setIsChecking(false)
    }

    img.src = imageDataUrl
  }, [imageDataUrl, fileType, checkTransparency])

  return {
    hasTransparency,
    isChecking,
    checkTransparency,
  }
} 