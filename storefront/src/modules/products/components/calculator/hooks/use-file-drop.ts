'use client'

import { useCallback } from "react"

import { convertPdfToImage, convertVectorToImage } from "../utils/file-previews"
import { deriveAutoConfigureSuggestion, type AutoConfigureSuggestion } from "../utils/auto-configure"
import { generatePreviewDataUrl, type StoredUploadPreviewKind } from "../utils/design-storage"
import type { Dimensions } from "../types"
import type { Shape } from "../shape-selector"

type UploadPreviewKind = StoredUploadPreviewKind

interface UseFileDropProps {
  disabled?: boolean
  clearError: () => void
  setEditorError: (value: string | null) => void
  setIsProcessing: (value: boolean) => void
  setImageData: (value: string | null) => void
  setPreviewKind: (value: UploadPreviewKind) => void
  setFileType: (value: string | null) => void
  checkTransparency: (img: HTMLImageElement, type: string) => boolean
  onAutoConfigure?: (suggestion: AutoConfigureSuggestion) => void
  shape: Shape
  dimensions: Dimensions
  saveOriginalAsset: (args: {
    file: File
    originalDataUrl?: string
    previewDataUrl: string | null
    previewKind: UploadPreviewKind
    shape: Shape
    dimensions: Dimensions
  }) => Promise<void>
  setIsImageSelected: (value: boolean) => void
}

export function useFileDrop({
  disabled,
  clearError,
  setEditorError,
  setIsProcessing,
  setImageData,
  setPreviewKind,
  setFileType,
  checkTransparency,
  onAutoConfigure,
  shape,
  dimensions,
  saveOriginalAsset,
  setIsImageSelected,
}: UseFileDropProps) {
  return useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0]
      if (!file || disabled) {
        return
      }

      clearError()
      setEditorError(null)
      setIsProcessing(true)

      let previewDataUrl: string | null = null
      let nextPreviewKind: UploadPreviewKind = null

      try {
        const mimeType = (file.type || "").toLowerCase()
        setFileType(file.type)

        if (mimeType.startsWith("image/") || mimeType === "image/svg+xml") {
          previewDataUrl = await generatePreviewDataUrl(file)
          nextPreviewKind = "bitmap"
        } else if (mimeType === "application/pdf") {
          const previewImage = await convertPdfToImage(file)
          if (previewImage) {
            previewDataUrl = previewImage
            nextPreviewKind = "pdf"
          } else {
            nextPreviewKind = "unsupported"
            setEditorError("Could not generate a preview for this PDF, but the file was stored.")
          }
        } else if (mimeType.includes("illustrator") || mimeType.includes("postscript")) {
          const previewImage = await convertVectorToImage(file)
          if (previewImage) {
            previewDataUrl = previewImage
            nextPreviewKind = "vector"
          } else {
            nextPreviewKind = "unsupported"
            setEditorError("Could not generate a preview for this file, but the original was stored.")
          }
        } else {
          nextPreviewKind = "unsupported"
          setEditorError("Unsupported file type. Please upload PNG, JPG, SVG, AI, or PDF.")
        }

        if (previewDataUrl) {
          setImageData(previewDataUrl)
          setPreviewKind(nextPreviewKind)
        } else {
          setImageData(null)
          setPreviewKind("unsupported")
        }

        let autoSuggestion: AutoConfigureSuggestion | null = null
        if (previewDataUrl) {
          autoSuggestion = await deriveAutoConfigureSuggestion(
            previewDataUrl,
            file.type || "",
            checkTransparency
          )
          if (autoSuggestion) {
            onAutoConfigure?.(autoSuggestion)
          }
        }

        const targetShape = autoSuggestion?.shape ?? shape
        const targetDimensions = autoSuggestion?.dimensions ?? dimensions

        await saveOriginalAsset({
          file,
          originalDataUrl:
            (file.type || "").toLowerCase().startsWith("image/") || file.type === "image/svg+xml"
              ? previewDataUrl ?? undefined
              : undefined,
          previewDataUrl: previewDataUrl ?? null,
          previewKind: nextPreviewKind,
          shape: targetShape,
          dimensions: targetDimensions,
        })
        setIsImageSelected(true)
      } catch (error) {
        console.error("File drop failed:", error)
        const message =
          error instanceof Error ? error.message : "File processing failed. Please try again."
        setEditorError(message)
        if (!previewDataUrl) {
          setImageData(null)
          setPreviewKind("unsupported")
        }
      } finally {
        setIsProcessing(false)
      }
    },
    [
      disabled,
      clearError,
      setEditorError,
      setIsProcessing,
      setImageData,
      setPreviewKind,
      setFileType,
      checkTransparency,
      onAutoConfigure,
      shape,
      dimensions,
      saveOriginalAsset,
      setIsImageSelected,
    ]
  )
}
