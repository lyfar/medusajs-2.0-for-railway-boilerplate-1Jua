'use client'

import { useEffect, useRef, useState } from "react"

import { analyzeImageDataUrl } from "../utils/image-analysis"
import type { Dimensions } from "../types"
import type { Shape } from "../shape-selector"

interface ImageMeta {
  width: number
  height: number
}

export function useImageMeta(imageData: string | null, dimensions: Dimensions, shape: Shape) {
  const imageMetaRef = useRef<ImageMeta | null>(null)
  const [imageMetaVersion, setImageMetaVersion] = useState(0)
  const [resolutionWarning, setResolutionWarning] = useState<
    | null
    | {
        detectedPpi: number
        recommended: number
      }
  >(null)
  const [isImageDark, setIsImageDark] = useState(false)

  useEffect(() => {
    if (!imageData) {
      imageMetaRef.current = null
      setResolutionWarning(null)
      setIsImageDark(false)
      setImageMetaVersion((v) => v + 1)
      return
    }

    let cancelled = false

    const analyze = async () => {
      const result = await analyzeImageDataUrl(imageData, dimensions, shape)
      if (!cancelled) {
        imageMetaRef.current = result.meta
        setResolutionWarning(result.resolutionWarning)
        setIsImageDark(result.isDark)
        setImageMetaVersion((v) => v + 1)
      }
    }

    analyze()

    return () => {
      cancelled = true
    }
  }, [imageData, dimensions, shape])

  return {
    imageMetaRef,
    imageMetaVersion,
    resolutionWarning,
    isImageDark,
    setResolutionWarning,
    setIsImageDark,
  }
}
