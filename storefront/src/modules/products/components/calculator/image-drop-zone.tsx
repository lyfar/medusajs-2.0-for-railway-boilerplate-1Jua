"use client"

import clsx from "clsx"
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
  Fragment,
  type CSSProperties,
  type WheelEvent,
} from "react"
import { useDropzone } from "react-dropzone"

import { Shape } from "./shape-selector"
import { useImageUpload, useTransparencyCheck } from "./hooks"
import { useTransformHistory } from "./hooks/use-transform-history"
import { useImageTransforms } from "./hooks/use-image-transforms"
import { useStickerCanvas } from "./hooks/use-sticker-canvas"
import { useKeyboardShortcuts } from "./hooks/use-keyboard-shortcuts"
import { useImageMeta } from "./hooks/use-image-meta"
import { useFileDrop } from "./hooks/use-file-drop"
import { useDesignHydration } from "./hooks/use-design-hydration"
import { useBleedGuides } from "./hooks/use-bleed-guides"
import { Dimensions, type Material } from "./types"
import { DesignDraftState, StoredUploadPreviewKind } from "./utils/design-storage"
import { type Orientation } from "./orientation"
import { KeyboardShortcutsModal } from "./components/keyboard-shortcuts-modal"
import { SaveSuccessOverlay } from "./components/save-success-overlay"
import { MobileSaveOverlay } from "./components/mobile-save-overlay"
import { OrientationToggle } from "./components/orientation-toggle"
import { CanvasToolbar } from "./components/canvas-toolbar"
import { InfoBadges } from "./components/info-badges"
import { FormatSupportInfo } from "./components/format-support-info"
import { ResolutionWarning } from "./components/resolution-warning"
import { ErrorBanner } from "./components/error-banner"
import { CanvasStage } from "./components/canvas-stage"
import { ZoomOverlay } from "./components/zoom-overlay"
import { ACCEPTED_FILE_TYPES } from "./utils/file-types"
import { exportDesign } from "./utils/export-design"
import { clamp } from "./utils/math"

interface ImageDropZoneProps {
  shape: Shape
  dimensions: Dimensions
  onDesignChange?: (state: DesignDraftState | null) => void
  onEditStateChange?: (state: { hasImage: boolean; hasUnsavedChanges: boolean }) => void
  disabled?: boolean
  compact?: boolean
  onAutoConfigure?: (suggestion: AutoConfigureSuggestion) => void
  orientation?: Orientation
  onOrientationChange?: (orientation: Orientation) => void
  material?: Material
}

export interface ImageDropZoneHandle {
  saveDesign: () => Promise<void>
  isSavingDesign: boolean
  handleScaleChange: (delta: number) => void
  handleRotationChange: (delta: number) => void
  handleReset: () => void
  openFileDialog: () => void
}

type UploadPreviewKind = StoredUploadPreviewKind

export type AutoConfigureSuggestion = {
  shape: Shape
  dimensions: Dimensions
  presetKey?: string | "Custom"
  orientation?: Orientation
}

const SIZE_TRANSITION =
  "width 240ms ease, height 240ms ease, border-radius 240ms ease, left 240ms ease, top 240ms ease"

const ImageDropZone = forwardRef<ImageDropZoneHandle, ImageDropZoneProps>(function ImageDropZone({
  shape,
  dimensions,
  onDesignChange,
  onEditStateChange,
  disabled,
  compact = false,
  onAutoConfigure,
  orientation,
  onOrientationChange,
  material,
}, ref) {
  const [imageData, setImageData] = useState<string | null>(null)
  const [fileType, setFileType] = useState<string | null>(null)
  const [previewKind, setPreviewKind] = useState<UploadPreviewKind>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [editorError, setEditorError] = useState<string | null>(null)
  const [isSavingDesign, setIsSavingDesign] = useState(false)
  const [isImageSelected, setIsImageSelected] = useState(false)
  const [showKeyboardHints, setShowKeyboardHints] = useState(false)
  const hasSeededHistoryRef = useRef(false)

  const {
    containerRef,
    imageWrapperRef,
    containerSize,
    setContainerSize,
    shapeStyles,
    stickerBorderRadius,
    stickerAreaSize,
    derivedOrientation,
    isOrientationAdjustable,
  } = useStickerCanvas(shape, dimensions, compact, imageData)

  const {
    imageMetaRef,
    imageMetaVersion,
    resolutionWarning,
    isImageDark,
  } = useImageMeta(imageData, dimensions, shape)
  const baseScaleRef = useRef(1)
  const previousImageDataRef = useRef<string | null>(null)

  const {
    uploadError,
    uploadSuccess,
    isUploading,
    designState,
    saveOriginalAsset,
    saveEditedAsset,
    clearError,
  } = useImageUpload({
    disabled,
    onDesignStateChange: onDesignChange,
  })
  const hasHydratedFromDraft = useRef(false)
  const [isTouchDevice, setIsTouchDevice] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") {
      return
    }
    const touch =
      "ontouchstart" in window ||
      (navigator.maxTouchPoints ?? 0) > 0 ||
      window.matchMedia("(pointer: coarse)").matches
    setIsTouchDevice(touch)
  }, [])

  const { checkTransparency, hasTransparency } = useTransparencyCheck({
    imageDataUrl: imageData,
    fileType: fileType || undefined,
    shape,
  })

  const cornerHandles = useMemo(
    () => [
      { key: "top-left", style: { top: 0, left: 0 }, cursor: "nwse-resize" as const },
      { key: "top-right", style: { top: 0, right: 0 }, cursor: "nesw-resize" as const },
      { key: "bottom-left", style: { bottom: 0, left: 0 }, cursor: "nesw-resize" as const },
      { key: "bottom-right", style: { bottom: 0, right: 0 }, cursor: "nwse-resize" as const },
    ],
    []
  )

  useEffect(() => {
    const element = containerRef.current
    if (!element) return

    const updateSize = () => {
      const rect = element.getBoundingClientRect()
      setContainerSize({ width: rect.width, height: rect.height })
    }

    updateSize()
    const observer = new ResizeObserver(updateSize)
    observer.observe(element)

    return () => observer.disconnect()
  }, [containerRef, setContainerSize])

  const {
    scale,
    setScale,
    rotation,
    setRotation,
    position,
    setPosition,
    handleMouseDown,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    startScaleHandleDrag,
    startRotateHandleDrag,
  } = useImageTransforms({
    imageData,
    getWrapperCenter: () => {
      const rect = imageWrapperRef.current?.getBoundingClientRect()
      if (!rect) return null
      return {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      }
    },
    setIsImageSelected,
  })

  // Reset position when container size changes significantly (e.g., mobile <-> desktop)
  const previousContainerSizeRef = useRef({ width: 0, height: 0 })
  useEffect(() => {
    const prev = previousContainerSizeRef.current
    const curr = containerSize

    // Update the ref immediately
    previousContainerSizeRef.current = curr

    // Skip if initial load
    if (prev.width === 0 || prev.height === 0) return

    // Check if size changed significantly (more than 30% change in either dimension)
    // This is typical for orientation change or mobile->desktop resizing
    const widthRatio = Math.abs(curr.width - prev.width) / prev.width
    const heightRatio = Math.abs(curr.height - prev.height) / prev.height
    
    if (widthRatio > 0.3 || heightRatio > 0.3) {
      // Reset position to center
      setPosition({ x: 0, y: 0 })
      // Also reset scale if it's very zoomed out/in to ensure visibility
      if (scale < 0.8 || scale > 1.5) {
        setScale(1)
      }
    }
  }, [containerSize, setPosition, scale, setScale])


  const {
    canUndo,
    canRedo,
    handleUndo,
    handleRedo,
    resetHistory,
  } = useTransformHistory({
    scale,
    rotation,
    position,
    setScale,
    setRotation,
    setPosition,
    imageData,
  })

  useDesignHydration({
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
  })

    const dropzoneStyle = useMemo<CSSProperties>(() => {
    return {
      width: "100%",
      height: "100%",
      minHeight: compact ? 220 : 150,
      margin: "0 auto",
      position: "relative",
      overflow: "hidden",
      touchAction: isTouchDevice ? "none" : "auto",
    }
  }, [compact, isTouchDevice])

  const bleedStyles = useBleedGuides({
    stickerAreaSize,
    shape,
    dimensions,
    stickerBorderRadius,
    material,
  })

  const renderSize = useMemo(() => {
    if (!imageData || !stickerAreaSize.width || !stickerAreaSize.height) {
      return { width: 0, height: 0 }
    }

    const naturalWidth = imageMetaRef.current?.width ?? stickerAreaSize.width
    const naturalHeight = imageMetaRef.current?.height ?? stickerAreaSize.height
    if (!naturalWidth || !naturalHeight) {
      return { width: 0, height: 0 }
    }

    const scaleToFit = Math.min(stickerAreaSize.width / naturalWidth, stickerAreaSize.height / naturalHeight)
    baseScaleRef.current = scaleToFit

    return {
      width: naturalWidth * scaleToFit,
      height: naturalHeight * scaleToFit,
    }
  }, [imageData, stickerAreaSize.width, stickerAreaSize.height, imageMetaVersion])

  const isImageOverflowing = useMemo(() => {
    if (!stickerAreaSize.width || !stickerAreaSize.height || !renderSize.width || !renderSize.height) {
      return false
    }

    const stickerHalfWidth = stickerAreaSize.width / 2
    const stickerHalfHeight = stickerAreaSize.height / 2
    const scaledWidth = renderSize.width * scale
    const scaledHeight = renderSize.height * scale

    const rad = (rotation * Math.PI) / 180
    const cos = Math.cos(rad)
    const sin = Math.sin(rad)

    const rotatedHalfWidth = Math.abs(scaledWidth * cos) / 2 + Math.abs(scaledHeight * sin) / 2
    const rotatedHalfHeight = Math.abs(scaledWidth * sin) / 2 + Math.abs(scaledHeight * cos) / 2

    return (
      Math.abs(position.x) + rotatedHalfWidth > stickerHalfWidth ||
      Math.abs(position.y) + rotatedHalfHeight > stickerHalfHeight
    )
  }, [
    renderSize.width,
    renderSize.height,
    position.x,
    position.y,
    scale,
    rotation,
    stickerAreaSize.width,
    stickerAreaSize.height,
  ])

  const controlScaleCompensation = 1 / Math.max(scale, 0.001)
  const selectionBorderClass = useMemo(
    () =>
      clsx(
        "pointer-events-none absolute inset-0 border transition-all duration-200",
        isImageOverflowing
          ? "border-amber-400/90 shadow-[0_0_22px_rgba(251,191,36,0.35)]"
          : "border-sky-400/80"
      ),
    [isImageOverflowing]
  )

  const handleAccentClass = useMemo(
    () =>
      clsx(
        "pointer-events-auto absolute h-3.5 w-3.5 rounded-full border border-white/70 bg-neutral-900/90 shadow-sm transition-all duration-150 ring-2",
        isImageOverflowing
          ? "ring-amber-400/80 hover:ring-amber-300"
          : "ring-sky-400/70 hover:ring-sky-300"
      ),
    [isImageOverflowing]
  )

  const rotationHandleClass = handleAccentClass

  const canAdjustOrientation = isOrientationAdjustable && typeof onOrientationChange === "function"
  const activeOrientation = orientation ?? derivedOrientation
  const lastSavedTransform = useMemo(
    () => designState?.lastTransformations ?? designState?.transformations ?? null,
    [designState?.lastTransformations, designState?.transformations]
  )
  const hasZoomControls = Boolean(imageData && stickerAreaSize.width > 0 && stickerAreaSize.height > 0)
  const hasUnsavedChanges = useMemo(() => {
    if (!imageData) return false
    if (designState?.original && !designState?.edited) {
      return true
    }
    if (!lastSavedTransform) {
      return true
    }

    // Check if shape or dimensions changed from the saved state
    if (designState?.shape && designState.shape !== shape) {
      return true
    }
    if (designState?.dimensions) {
      const d = designState.dimensions
      if (
        d.width !== dimensions.width ||
        d.height !== dimensions.height ||
        d.diameter !== dimensions.diameter
      ) {
        return true
      }
    }

    const dx = (lastSavedTransform.position?.x ?? 0) - position.x
    const dy = (lastSavedTransform.position?.y ?? 0) - position.y
    const positionDelta = Math.hypot(dx, dy)
    return (
      Math.abs(lastSavedTransform.scale - scale) > 0.005 ||
      Math.abs(lastSavedTransform.rotation - rotation) > 0.5 ||
      positionDelta > 0.5
    )
  }, [
    designState?.edited,
    designState?.original,
    designState?.shape,
    designState?.dimensions,
    imageData,
    lastSavedTransform,
    position.x,
    position.y,
    rotation,
    scale,
    shape,
    dimensions,
  ])

  useEffect(() => {
    onEditStateChange?.({
      hasImage: Boolean(imageData),
      hasUnsavedChanges,
    })
  }, [hasUnsavedChanges, imageData, onEditStateChange])

  const handleScaleChange = useCallback((delta: number) => {
    setScale((prev) => clamp(prev + delta, 0.5, 3))
  }, [])

  const handleRotationChange = useCallback((delta: number) => {
    setRotation((prev) => {
      let next = prev + delta
      if (next > 180) {
        next -= 360
      } else if (next <= -180) {
        next += 360
      }
      return Math.max(-180, Math.min(180, next))
    })
  }, [])

  const handleWheelZoom = useCallback((event: WheelEvent<HTMLDivElement>) => {
    if (!imageData || (!event.ctrlKey && !event.metaKey)) return
    event.preventDefault()
    const zoomFactor = 1 + -event.deltaY / 600
    setScale((prev) => clamp(prev * zoomFactor, 0.5, 3))
  }, [imageData])

  const handleReset = useCallback(() => {
    if (!imageData) {
      return
    }
    const baseState = { scale: 1, rotation: 0, position: { x: 0, y: 0 } }
    setScale(baseState.scale)
    setRotation(baseState.rotation)
    setPosition(baseState.position)
    resetHistory(baseState)
    setEditorError(null)
  }, [imageData, resetHistory])

  useKeyboardShortcuts({
    imageData,
    handleUndo,
    handleRedo,
    handleReset,
    handleScaleChange,
    handleRotationChange,
    setPosition,
    setShowKeyboardHints,
  })

  const handleSaveEditedDesign = useCallback(async () => {
    if (!imageData || !imageMetaRef.current) {
      setEditorError("Upload your artwork before saving the design.")
      return
    }

    if (!containerSize.width || !containerSize.height || !stickerAreaSize.width || !stickerAreaSize.height) {
      setEditorError("The preview area is not ready yet. Please try again in a moment.")
      return
    }

    try {
      setIsSavingDesign(true)
      await exportDesign({
        imageData,
        imageMeta: imageMetaRef.current,
        containerSize,
        stickerAreaSize,
        renderSize,
        position,
        rotation,
        scale,
        isImageDark,
        shape,
        dimensions,
        shapeStyles,
        saveEditedAsset,
      })
    } catch (error) {
      console.error("Failed to export edited design:", error)
      setEditorError("We couldn't save the edited design. Please try again.")
    } finally {
      setIsSavingDesign(false)
    }
  }, [
    imageData,
    imageMetaRef,
    containerSize,
    stickerAreaSize,
    renderSize,
    position,
    rotation,
    scale,
    isImageDark,
    shape,
    shapeStyles,
    saveEditedAsset,
  ])

  const onFileDrop = useFileDrop({
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
  })

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop: onFileDrop,
    accept: ACCEPTED_FILE_TYPES,
    multiple: false,
    disabled: disabled || isUploading,
    noClick: isTouchDevice ? false : Boolean(imageData),
    noKeyboard: isTouchDevice || Boolean(imageData),
    noDrag: isTouchDevice,
  })

  const canBrowse = !(disabled || isUploading)

  useImperativeHandle(ref, () => ({
    saveDesign: handleSaveEditedDesign,
    isSavingDesign,
    handleScaleChange,
    handleRotationChange,
    handleReset,
    openFileDialog: open,
  }), [handleSaveEditedDesign, isSavingDesign, handleScaleChange, handleRotationChange, handleReset, open])

  useEffect(() => {
    if (!imageData) {
      hasSeededHistoryRef.current = false
      return
    }
    if (hasSeededHistoryRef.current) return

    const initialState = designState?.transformations ?? { scale, rotation, position }
    resetHistory(initialState)
    hasSeededHistoryRef.current = true
  }, [imageData, designState?.transformations, resetHistory, scale, rotation, position])

  return (
    <Fragment>
      <div className="flex h-full flex-col">
        <div className="relative z-10 space-y-3 p-4 pb-0 sm:p-0">
          <div className="flex flex-row items-center justify-between gap-2 sm:flex-row sm:justify-between sm:gap-3">
            <InfoBadges
              shape={shape}
              dimensions={dimensions}
              imageData={imageData}
              hasUnsavedChanges={hasUnsavedChanges}
              isTouchDevice={isTouchDevice}
              showKeyboardHints={showKeyboardHints}
              onToggleShortcuts={() => setShowKeyboardHints((prev) => !prev)}
            />

            <CanvasToolbar
              canBrowse={canBrowse}
              imageData={imageData}
              onUploadClick={() => open()}
              onUndo={handleUndo}
              onRedo={handleRedo}
              onSave={handleSaveEditedDesign}
              onReset={handleReset}
              canUndo={canUndo}
              canRedo={canRedo}
              isSavingDesign={isSavingDesign}
              hasUnsavedChanges={hasUnsavedChanges}
              designStateEdited={Boolean(designState?.edited)}
            />
          </div>

          <div className="hidden sm:block">
            <FormatSupportInfo />
          </div>

          {resolutionWarning && imageData && <ResolutionWarning warning={resolutionWarning} />}

          <ErrorBanner message={uploadError ?? editorError} />
        </div>

        <div className="relative flex flex-1 pt-2 md:pt-4 md:gap-4">
          <div className="relative flex w-full flex-1 flex-col items-center justify-center md:p-4">
            <ZoomOverlay
              visible={hasZoomControls}
              scale={scale}
              rotation={rotation}
              onScaleChange={handleScaleChange}
              onRotationChange={handleRotationChange}
            />

            <CanvasStage
              getRootProps={getRootProps}
              getInputProps={getInputProps}
              containerRef={containerRef}
              imageWrapperRef={imageWrapperRef}
              dropzoneStyle={dropzoneStyle}
              isDragActive={isDragActive}
              imageData={imageData}
              renderSize={renderSize}
              position={position}
              rotation={rotation}
              scale={scale}
              controlScaleCompensation={controlScaleCompensation}
              stickerAreaSize={stickerAreaSize}
              stickerBorderRadius={stickerBorderRadius}
              bleedStyles={bleedStyles}
              isImageSelected={isImageSelected}
              cornerHandles={cornerHandles}
              handleAccentClass={handleAccentClass}
              rotationHandleClass={rotationHandleClass}
              selectionBorderClass={selectionBorderClass}
              startScaleHandleDrag={startScaleHandleDrag}
              startRotateHandleDrag={startRotateHandleDrag}
              previewKind={previewKind}
              isProcessing={isProcessing}
              canBrowse={canBrowse}
              isTouchDevice={isTouchDevice}
              onBrowse={open}
              onWheelZoom={handleWheelZoom}
              onMouseDownCanvas={handleMouseDown}
              onTouchStartCanvas={handleTouchStart}
              onTouchMoveCanvas={handleTouchMove}
              onTouchEndCanvas={handleTouchEnd}
              hasTransparency={hasTransparency}
              isImageDark={isImageDark}
              forceCheckerboard={shape === "diecut"}
            />
          </div>

          {canAdjustOrientation && (
            <div className="z-20 hidden items-center justify-center pb-2 md:flex">
              <div className="rounded-full border border-neutral-700/50 bg-neutral-900/40 p-1.5 backdrop-blur-sm shadow-sm">
                <OrientationToggle
                  current={activeOrientation}
                  onChange={onOrientationChange}
                  layout="horizontal"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <SaveSuccessOverlay open={Boolean(uploadSuccess && imageData)} />
      <KeyboardShortcutsModal open={Boolean(showKeyboardHints && imageData)} onClose={() => setShowKeyboardHints(false)} />
    </Fragment>
  )
})

ImageDropZone.displayName = "ImageDropZone"

export default ImageDropZone
