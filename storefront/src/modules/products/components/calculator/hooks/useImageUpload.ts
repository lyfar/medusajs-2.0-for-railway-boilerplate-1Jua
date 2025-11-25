import { useCallback, useEffect, useRef, useState } from "react"

import {
  blobToDataUrl,
  clearDesignAssets,
  clearDesignState,
  DesignDraftState,
  fileToDataUrl,
  generateDesignId,
  generatePreviewDataUrl,
  readDesignState,
  shouldEmbedInlineAsset,
  StoredDimensions,
  StoredUploadPreviewKind,
  storeDesignAssetBlob,
  updateDesignState,
} from "../utils/design-storage"
import { Shape } from "../shape-selector"
import { Dimensions } from "../types"

export type UploadState = "idle" | "uploading" | "success" | "error"

interface SaveOriginalPayload {
  file: File
  originalDataUrl?: string
  previewDataUrl: string | null
  previewKind: StoredUploadPreviewKind
  shape: Shape
  dimensions: Dimensions
}

interface SaveEditedPayload {
  blob: Blob
  fileName: string
  mimeType: string
  transformations: {
    scale: number
    rotation: number
    position: { x: number; y: number }
  }
}

interface UseImageUploadProps {
  disabled?: boolean
  onDesignStateChange?: (state: DesignDraftState | null) => void
}

interface UseImageUploadReturn {
  uploadState: UploadState
  uploadError: string | null
  uploadSuccess: boolean
  isUploading: boolean
  designState: DesignDraftState | null
  saveOriginalAsset: (payload: SaveOriginalPayload) => Promise<void>
  saveEditedAsset: (payload: SaveEditedPayload) => Promise<void>
  clearError: () => void
  clearSuccess: () => void
  clearDesign: () => void
}

const SUCCESS_RESET_DELAY = 2500

export function useImageUpload({
  disabled,
  onDesignStateChange,
}: UseImageUploadProps): UseImageUploadReturn {
  const [uploadState, setUploadState] = useState<UploadState>("idle")
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [designState, setDesignState] = useState<DesignDraftState | null>(() => readDesignState())

  const successTimeoutRef = useRef<number | null>(null)

  const isUploading = uploadState === "uploading"

  useEffect(() => {
    onDesignStateChange?.(designState ?? null)
  }, [designState, onDesignStateChange])

  useEffect(() => {
    return () => {
      if (successTimeoutRef.current) {
        window.clearTimeout(successTimeoutRef.current)
        successTimeoutRef.current = null
      }
    }
  }, [])

  const scheduleSuccessReset = useCallback(() => {
    if (successTimeoutRef.current) {
      window.clearTimeout(successTimeoutRef.current)
    }

    successTimeoutRef.current = window.setTimeout(() => {
      setUploadSuccess(false)
      setUploadState("idle")
      successTimeoutRef.current = null
    }, SUCCESS_RESET_DELAY)
  }, [])

  const clearError = useCallback(() => {
    setUploadError(null)
    if (uploadState === "error") {
      setUploadState("idle")
    }
  }, [uploadState])

  const clearSuccess = useCallback(() => {
    if (successTimeoutRef.current) {
      window.clearTimeout(successTimeoutRef.current)
      successTimeoutRef.current = null
    }
    setUploadSuccess(false)
    if (uploadState === "success") {
      setUploadState("idle")
    }
  }, [uploadState])

  const handleDesignUpdate = useCallback((updater: (prev: DesignDraftState | null) => DesignDraftState | null) => {
    const next = updateDesignState(updater)
    setDesignState(next ?? null)
    return next
  }, [])

  const saveOriginalAsset = useCallback(
    async ({
      file,
      originalDataUrl,
      previewDataUrl,
      previewKind,
      shape,
      dimensions,
    }: SaveOriginalPayload) => {
      if (disabled) {
        return
      }

      setUploadError(null)
      setUploadState("uploading")

      try {
        const designId = designState?.id ?? generateDesignId()
        const inlineDataUrl =
          typeof originalDataUrl === "string"
            ? originalDataUrl
            : shouldEmbedInlineAsset(file)
              ? await fileToDataUrl(file)
              : undefined
        const previewUrl =
          typeof previewDataUrl === "string"
            ? previewDataUrl
            : await generatePreviewDataUrl(file)
        const storageInfo = await storeDesignAssetBlob(designId, "original", file)

        const nextState = handleDesignUpdate((prev) => {
          const id = prev?.id ?? designId
          return {
            id,
            original: {
              name: file.name,
              type: file.type,
              dataUrl: inlineDataUrl,
              lastModified: file.lastModified,
              size: file.size,
              storageKey: storageInfo.storageKey,
              storageDriver: storageInfo.storageDriver,
            },
            // Reset edited design because original artwork changed
            edited: undefined,
            previewKind,
            previewDataUrl: previewUrl ?? inlineDataUrl ?? undefined,
            transformations: {
              scale: 1,
              rotation: 0,
              position: { x: 0, y: 0 },
            },
            lastTransformations: undefined,
            shape,
            dimensions: { ...dimensions } as StoredDimensions,
            updatedAt: Date.now(),
          }
        })

        setDesignState(nextState ?? null)
        setUploadState("idle")
      } catch (error) {
        console.error("Failed to store original sticker design", error)
        const message =
          error instanceof Error ? error.message : "Unable to store original file locally"
        setUploadError(message)
        setUploadState("error")
        throw error
      }
    },
    [designState, disabled, handleDesignUpdate]
  )

  const saveEditedAsset = useCallback(
    async ({ blob, fileName, mimeType, transformations }: SaveEditedPayload) => {
      if (disabled) {
        return
      }

      setUploadError(null)
      setUploadState("uploading")

      try {
        const designId = designState?.id ?? generateDesignId()
        const storageInfo = await storeDesignAssetBlob(designId, "edited", blob)
        const inlineDataUrl = shouldEmbedInlineAsset(blob) ? await blobToDataUrl(blob) : undefined
        const nextState = handleDesignUpdate((prev) => {
          if (!prev?.original) {
            throw new Error("Upload artwork before saving your edited design.")
          }

          const id = prev.id ?? designId
          return {
            ...prev,
            id,
            edited: {
              name: fileName,
              type: mimeType,
              dataUrl: inlineDataUrl,
              lastModified: Date.now(),
              size: blob.size || inlineDataUrl?.length,
              storageKey: storageInfo.storageKey,
              storageDriver: storageInfo.storageDriver,
            },
            // Keep the original image as preview and maintain transformations
            // The edited (rendered) image is stored for cart upload only
            previewDataUrl: prev.previewDataUrl,
            transformations: transformations,
            lastTransformations: transformations,
            updatedAt: Date.now(),
          }
        })

        setDesignState(nextState ?? null)
        setUploadState("success")
        setUploadSuccess(true)
        scheduleSuccessReset()
      } catch (error) {
        console.error("Failed to store edited design", error)
        const message =
          error instanceof Error ? error.message : "Unable to store edited design locally"
        setUploadError(message)
        setUploadState("error")
        throw error
      }
    },
    [designState, disabled, handleDesignUpdate, scheduleSuccessReset]
  )

  const clearDesign = useCallback(() => {
    const designId = designState?.id
    clearDesignState()
    setDesignState(null)
    if (designId) {
      void clearDesignAssets(designId)
    }
  }, [designState?.id])

  return {
    uploadState,
    uploadError,
    uploadSuccess,
    isUploading,
    designState,
    saveOriginalAsset,
    saveEditedAsset,
    clearError,
    clearSuccess,
    clearDesign,
  }
}
