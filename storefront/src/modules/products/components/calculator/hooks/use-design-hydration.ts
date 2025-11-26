'use client'

import { useEffect } from "react"

import type { DesignDraftState } from "../utils/design-storage"
import type { Orientation } from "../orientation"
import type { Point } from "./use-image-transforms"

interface UseDesignHydrationProps {
  designState: DesignDraftState | null
  setImageData: (value: string | null) => void
  setPreviewKind: (value: DesignDraftState["previewKind"]) => void
  setFileType: (value: string | null) => void
  setScale: (value: number) => void
  setRotation: (value: number) => void
  setPosition: (value: Point) => void
  setIsImageSelected: (value: boolean) => void
  hasHydratedFromDraft: React.MutableRefObject<boolean>
  hasSeededHistoryRef: React.MutableRefObject<boolean>
  setOrientation?: (value: Orientation) => void
}

export function useDesignHydration({
  designState,
  setImageData,
  setPreviewKind,
  setFileType,
  setScale,
  setRotation,
  setPosition,
  setIsImageSelected,
  hasHydratedFromDraft,
  hasSeededHistoryRef,
  setOrientation,
}: UseDesignHydrationProps) {
  useEffect(() => {
    if (!designState) {
      if (hasHydratedFromDraft.current) {
        setImageData(null)
        setPreviewKind(null)
        setFileType(null)
        setScale(1)
        setRotation(0)
        setPosition({ x: 0, y: 0 })
        hasSeededHistoryRef.current = false
      }
      setIsImageSelected(false)
      return
    }

    const nextImage =
      designState.previewDataUrl ??
      designState.edited?.dataUrl ??
      designState.original?.dataUrl ??
      null

    if (nextImage) {
      setImageData(nextImage)
    }

    setPreviewKind(designState.previewKind ?? null)
    setFileType(designState.edited?.type ?? designState.original?.type ?? null)

    if (designState.transformations) {
      setScale(designState.transformations.scale)
      setRotation(designState.transformations.rotation)
      setPosition(designState.transformations.position)
    }

    if (setOrientation && designState.orientation) {
      setOrientation(designState.orientation)
    }

    setIsImageSelected(true)
    hasHydratedFromDraft.current = true
  }, [
    designState,
    hasHydratedFromDraft,
    hasSeededHistoryRef,
    setFileType,
    setImageData,
    setIsImageSelected,
    setOrientation,
    setPosition,
    setPreviewKind,
    setRotation,
    setScale,
  ])
}
