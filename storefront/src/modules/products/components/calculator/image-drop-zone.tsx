"use client"

import clsx from "clsx"
import {
  AlertCircle,
  Check,
  Info,
  RefreshCcw,
  Upload,
  Undo2,
  Redo2,
  MousePointerClick,
  ZoomIn,
  RotateCw,
  Move,
} from "lucide-react"
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
  type CSSProperties,
} from "react"
import { useDropzone } from "react-dropzone"

import { Shape } from "./shape-selector"
import { useImageUpload, useTransparencyCheck } from "./hooks"
import { getContainerStyles } from "./utils/shapeStyles"
import { DesignZoomTool } from "./tools"
import { Dimensions } from "./types"
import { DesignDraftState, StoredUploadPreviewKind, fileToDataUrl } from "./utils/design-storage"
import { SIZE_PRESETS, SizeDimensions, SizePresetKey } from "./size-presets"
import { supportsOrientation, deriveOrientation, type Orientation } from "./orientation"

interface ImageDropZoneProps {
  shape: Shape
  dimensions: Dimensions
  onDesignChange?: (state: DesignDraftState | null) => void
  disabled?: boolean
  compact?: boolean
  onAutoConfigure?: (suggestion: AutoConfigureSuggestion) => void
  orientation?: Orientation
  onOrientationChange?: (orientation: Orientation) => void
}

export interface ImageDropZoneHandle {
  saveDesign: () => Promise<void>
  isSavingDesign: boolean
  handleScaleChange: (delta: number) => void
  handleRotationChange: (delta: number) => void
  handleReset: () => void
}

export type AutoConfigureSuggestion = {
  shape: Shape
  dimensions: Dimensions
  presetKey?: SizePresetKey | "Custom"
  orientation?: Orientation
}

type UploadPreviewKind = StoredUploadPreviewKind

interface Point {
  x: number
  y: number
}

interface ImageMeta {
  width: number
  height: number
}

interface BaseTransform {
  pointerId: number
  target: Element
}

type ActiveTransform =
  | null
  | (BaseTransform & {
      type: "scale"
      initialScale: number
      initialDistance: number
    })
  | (BaseTransform & {
      type: "rotate"
      initialRotation: number
      initialAngle: number
    })

const ACCEPTED_FILE_TYPES: Record<string, string[]> = {
  "image/png": [".png"],
  "image/jpeg": [".jpg", ".jpeg"],
  "image/gif": [".gif"],
  "image/svg+xml": [".svg"],
  "application/pdf": [".pdf"],
  "application/postscript": [".ai", ".eps"],
  "application/illustrator": [".ai"],
}

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

const SIZE_TRANSITION =
  "width 240ms ease, height 240ms ease, border-radius 240ms ease, left 240ms ease, top 240ms ease"

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

const deriveAutoConfigureSuggestion = async (
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

const MIN_PPI_WARNING = 200
const PREFERRED_PPI = 300
const PDFJS_CDN_VERSION = "5.4.394"

let pdfjsLibLoader: Promise<any> | null = null

const loadPdfJsFromCdn = () =>
  new Promise<any>((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("PDF.js CDN fallback is only available in the browser"))
      return
    }

    const existing = (window as any).pdfjsLib
    if (existing) {
      if (existing.GlobalWorkerOptions) {
        existing.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${existing.version}/pdf.worker.min.js`
      }
      resolve(existing)
      return
    }

    const script = document.createElement("script")
    script.src = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_CDN_VERSION}/pdf.min.js`
    script.async = true
    script.onload = () => {
      const pdfjs = (window as any).pdfjsLib
      if (!pdfjs) {
        reject(new Error("PDF.js failed to load from CDN"))
        return
      }
      if (pdfjs.GlobalWorkerOptions) {
        pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`
      }
      resolve(pdfjs)
    }
    script.onerror = () => {
      reject(new Error("Unable to load PDF.js from CDN"))
    }

    document.head.appendChild(script)
  })

const loadPdfJs = async () => {
  if (!pdfjsLibLoader) {
    pdfjsLibLoader = import("pdfjs-dist/legacy/build/pdf.mjs")
      .then((module) => {
        const pdfjs = module
        if (pdfjs.GlobalWorkerOptions) {
          pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`
        }
        return pdfjs
      })
      .catch((error) => {
        console.warn("Local PDF.js import failed, falling back to CDN", error)
        pdfjsLibLoader = loadPdfJsFromCdn()
        return pdfjsLibLoader
      })
  }

  return pdfjsLibLoader
}

function preparePdfData(arrayBuffer: ArrayBuffer): Uint8Array | null {
  // Try to extract PDF data from potentially wrapped formats
  try {
    const bytes = new Uint8Array(arrayBuffer)
    // Look for PDF header "%PDF-"
    for (let i = 0; i < Math.min(1024, bytes.length - 5); i++) {
      if (
        bytes[i] === 0x25 && // %
        bytes[i + 1] === 0x50 && // P
        bytes[i + 2] === 0x44 && // D
        bytes[i + 3] === 0x46 && // F
        bytes[i + 4] === 0x2d // -
      ) {
        return bytes.slice(i)
      }
    }
  } catch (error) {
    console.error("Failed to prepare PDF data:", error)
  }
  return null
}

async function convertPdfToImage(file: File): Promise<string | null> {
  try {
    const arrayBuffer = await file.arrayBuffer()
    const { pdfjsLib, pdf } = await loadPdfDocument(arrayBuffer)
    const page = await pdf.getPage(1)
    const viewport = page.getViewport({ scale: 2 })
    const canvas = document.createElement("canvas")
    const context = canvas.getContext("2d")
    if (!context) return null

    canvas.width = viewport.width
    canvas.height = viewport.height

    await page.render({
      canvasContext: context,
      viewport,
    }).promise

    return canvas.toDataURL("image/png")
  } catch (error) {
    console.error("PDF conversion failed:", error)
    return null
  }
}

async function convertVectorToImage(_file: File): Promise<string | null> {
  // Vector conversion would require additional libraries
  // For now, return null to indicate unsupported
  console.warn("Vector file conversion not yet implemented")
  return null
}

const loadPdfDocument = async (arrayBuffer: ArrayBuffer) => {
  const pdfjsLib = await loadPdfJs()
  const initialData = new Uint8Array(arrayBuffer)

  try {
    const pdf = await pdfjsLib.getDocument({ data: initialData }).promise
    return { pdfjsLib, pdf }
  } catch (initialError) {
    const extracted = preparePdfData(arrayBuffer)
    if (!extracted) {
      throw initialError
    }

    const pdf = await pdfjsLib.getDocument({ data: extracted }).promise
    return { pdfjsLib, pdf }
  }
}

const ImageDropZone = forwardRef<ImageDropZoneHandle, ImageDropZoneProps>(function ImageDropZone({
  shape,
  dimensions,
  onDesignChange,
  disabled,
  compact = false,
  onAutoConfigure,
  orientation,
  onOrientationChange,
}, ref) {
  const [imageData, setImageData] = useState<string | null>(null)
  const [fileType, setFileType] = useState<string | null>(null)
  const [previewKind, setPreviewKind] = useState<UploadPreviewKind>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isImageDark, setIsImageDark] = useState(false)
  const [editorError, setEditorError] = useState<string | null>(null)
  const [resolutionWarning, setResolutionWarning] = useState<
    | null
    | {
        detectedPpi: number
        recommended: number
      }
  >(null)
  const [isSavingDesign, setIsSavingDesign] = useState(false)
  const [isImageSelected, setIsImageSelected] = useState(false)

  const [scale, setScale] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [position, setPosition] = useState<Point>({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [showKeyboardHints, setShowKeyboardHints] = useState(false)
  const dragStateRef = useRef<{ start: Point; startPosition: Point } | null>(null)
  const pinchStateRef = useRef<{ initialDistance: number; initialScale: number } | null>(null)
  const activeTransformRef = useRef<ActiveTransform>(null)
  
  // Undo/Redo history
  interface TransformState {
    scale: number
    rotation: number
    position: Point
  }
  const [history, setHistory] = useState<TransformState[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const isApplyingHistoryRef = useRef(false)

  const containerRef = useRef<HTMLDivElement | null>(null)
  const imageWrapperRef = useRef<HTMLDivElement | null>(null)
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 })
  const imageMetaRef = useRef<ImageMeta | null>(null)
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
    if (!designState) {
      if (hasHydratedFromDraft.current) {
        setImageData(null)
        setPreviewKind(null)
        setFileType(null)
        setScale(1)
        setRotation(0)
        setPosition({ x: 0, y: 0 })
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

    setIsImageSelected(true)

    hasHydratedFromDraft.current = true
  }, [designState])

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

  const { checkTransparency } = useTransparencyCheck({
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
  }, [])

  useEffect(() => {
    if (!imageData) {
      imageMetaRef.current = null
      setResolutionWarning(null)
      setIsImageDark(false)
      return
    }

    let cancelled = false

    const analyze = async () => {
      const meta = await analyzeImage(imageData, dimensions, shape, setResolutionWarning, setIsImageDark)
      if (!cancelled) {
        imageMetaRef.current = meta
      }
    }

    analyze()

    return () => {
      cancelled = true
    }
  }, [imageData, dimensions, shape])

  const shapeStyles = useMemo(
    () => getContainerStyles(shape, dimensions, compact, !!imageData),
    [shape, dimensions, compact, imageData]
  )

  // Calculate sticker area size (needed for renderSize calculation)
  const stickerAreaSize = useMemo(() => {
    const containerW = containerSize.width || 0
    const containerH = containerSize.height || 0
    if (!containerW || !containerH) return { width: 0, height: 0 }

    const pxW = shapeStyles.pixelWidth || containerW
    const pxH = shapeStyles.pixelHeight || containerH
    const ratio = pxH / pxW || 1

    let w = Math.min(pxW, containerW)
    let h = w * ratio
    if (h > containerH) {
      h = Math.min(pxH, containerH)
      w = h / ratio
    }
    return { width: Math.max(1, Math.round(w)), height: Math.max(1, Math.round(h)) }
  }, [shapeStyles.pixelWidth, shapeStyles.pixelHeight, containerSize.width, containerSize.height])

  const stickerBorderRadius = useMemo(() => {
    switch (shape) {
      case "circle":
        return "9999px"
      case "square":
      case "rectangle":
        return "12px"
      default:
        return "16px"
    }
  }, [shape])
  const derivedOrientation = useMemo(() => deriveOrientation(shape, dimensions), [shape, dimensions])
  const orientationSupported = supportsOrientation(shape, dimensions)
  const canAdjustOrientation = orientationSupported && typeof onOrientationChange === "function"
  const activeOrientation = orientation ?? derivedOrientation
  const hasZoomControls = Boolean(imageData && stickerAreaSize.width > 0 && stickerAreaSize.height > 0)
  const shouldShowControlPanel = hasZoomControls || canAdjustOrientation

  const renderSize = useMemo(() => {
    if (!imageData || !imageMetaRef.current || !stickerAreaSize.width || !stickerAreaSize.height) {
      return { width: 0, height: 0 }
    }

    const { width: naturalWidth, height: naturalHeight } = imageMetaRef.current
    // Fit image within sticker area while maintaining aspect ratio
    const scaleToFit = Math.min(stickerAreaSize.width / naturalWidth, stickerAreaSize.height / naturalHeight)
    baseScaleRef.current = scaleToFit

    return {
      width: naturalWidth * scaleToFit,
      height: naturalHeight * scaleToFit,
    }
  }, [imageData, stickerAreaSize.width, stickerAreaSize.height])

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
        "pointer-events-auto absolute h-3 w-3 rounded-full border transition-colors duration-150",
        isImageOverflowing
          ? "border-white/80 bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.4)]"
          : "border-white bg-sky-400 shadow-sm"
      ),
    [isImageOverflowing]
  )

  const rotationHandleClass = useMemo(
    () =>
      clsx(
        "pointer-events-auto absolute h-4 w-4 rounded-full border shadow transition-colors duration-150",
        isImageOverflowing
          ? "border-white/80 bg-amber-400"
          : "border-white bg-sky-400"
      ),
    [isImageOverflowing]
  )


  useEffect(() => {
    // Only reset transformations when a completely new image is uploaded
    // Don't reset when:
    // 1. The design has been saved (designState?.edited exists)
    // 2. We're hydrating from saved state (hasHydratedFromDraft.current is true)
    const isNewImage = imageData && imageData !== previousImageDataRef.current
    const hasSavedDesign = designState?.edited
    const isHydrating = hasHydratedFromDraft.current
    
    if (isNewImage && !hasSavedDesign && !isHydrating) {
      // Only reset for genuinely new uploads
      setScale(1)
      setRotation(0)
      setPosition({ x: 0, y: 0 })
      // Reset history for new image
      setHistory([{ scale: 1, rotation: 0, position: { x: 0, y: 0 } }])
      setHistoryIndex(0)
    }
    
    previousImageDataRef.current = imageData
  }, [imageData, renderSize.width, renderSize.height, designState?.edited])

  // Record transform changes to history with debounce
  useEffect(() => {
    if (!imageData || isApplyingHistoryRef.current) return

    const timer = setTimeout(() => {
      setHistory(prevHistory => {
        const currentIndex = historyIndex
        const lastState = prevHistory[currentIndex]
        
        // Only add to history if there's an actual change
        if (lastState && 
            lastState.scale === scale && 
            lastState.rotation === rotation && 
            lastState.position.x === position.x && 
            lastState.position.y === position.y) {
          return prevHistory
        }

        const currentState: TransformState = { scale, rotation, position }
        
        // Remove any history after current index and add new state
        const newHistory = prevHistory.slice(0, currentIndex + 1)
        newHistory.push(currentState)
        
        // Limit history to 50 states
        if (newHistory.length > 50) {
          newHistory.shift()
          // Index stays the same after shift
          return newHistory
        } else {
          setHistoryIndex(newHistory.length - 1)
          return newHistory
        }
      })
    }, 300) // Debounce by 300ms to batch rapid changes

    return () => clearTimeout(timer)
  }, [scale, rotation, position, imageData, historyIndex])

  // Undo function
  const handleUndo = useCallback(() => {
    if (historyIndex > 0 && history.length > 0) {
      isApplyingHistoryRef.current = true
      const previousState = history[historyIndex - 1]
      if (previousState) {
        setScale(previousState.scale)
        setRotation(previousState.rotation)
        setPosition(previousState.position)
        setHistoryIndex(historyIndex - 1)
      }
      setTimeout(() => {
        isApplyingHistoryRef.current = false
      }, 0)
    }
  }, [history, historyIndex])

  // Redo function
  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      isApplyingHistoryRef.current = true
      const nextState = history[historyIndex + 1]
      if (nextState) {
        setScale(nextState.scale)
        setRotation(nextState.rotation)
        setPosition(nextState.position)
        setHistoryIndex(historyIndex + 1)
      }
      setTimeout(() => {
        isApplyingHistoryRef.current = false
      }, 0)
    }
  }, [history, historyIndex])

  const dropzoneStyle = useMemo<CSSProperties>(() => {
    return {
      width: "100%",
      height: "100%",
      minHeight: compact ? 220 : 320,
      margin: "0 auto",
      position: "relative",
      overflow: "hidden",
      touchAction: isTouchDevice ? "none" : "auto",
    }
  }, [compact, isTouchDevice])

  const stickerBoundaryInnerStyle = useMemo<CSSProperties>(() => {
    // The dashed outline that represents the sticker area; drawn inside the sticker area box.
    const base: CSSProperties = {
      position: "absolute",
      inset: compact ? "10px" : "14px",
      border: "2px dashed rgba(255,255,255,0.35)",
      pointerEvents: "none",
      borderRadius: stickerBorderRadius,
      transition: SIZE_TRANSITION,
    }
    if (shape === "diecut") {
      return {
        ...base,
        border: "2px dashed rgba(255,255,255,0.45)",
      }
    }
    return base
  }, [shape, compact, stickerBorderRadius])

  // Bleed/safe zone visualization inside the sticker area
  const BLEED_CM = 0.3 // 3mm bleed recommended
  const bleedStyles = useMemo(() => {
    if (!stickerAreaSize.width || !stickerAreaSize.height) return null

    // Determine selected cm dimensions by shape
    let widthCm = 0
    let heightCm = 0
    if (shape === "circle") {
      const d = dimensions.diameter || 0
      widthCm = d
      heightCm = d
    } else if (shape === "square") {
      const w = dimensions.width || 0
      widthCm = w
      heightCm = w
    } else {
      widthCm = dimensions.width || 0
      heightCm = dimensions.height || 0
    }

    // px per cm for current overlay
    const pxPerCmX = widthCm ? stickerAreaSize.width / widthCm : 0
    const pxPerCmY = heightCm ? stickerAreaSize.height / heightCm : 0
    const insetX = Math.max(0, Math.min(stickerAreaSize.width / 3, BLEED_CM * pxPerCmX))
    const insetY = Math.max(0, Math.min(stickerAreaSize.height / 3, BLEED_CM * pxPerCmY))

    const inner: CSSProperties = {
      position: "absolute",
      left: insetX,
      right: insetX,
      top: insetY,
      bottom: insetY,
      border: "2px dashed rgba(251, 191, 36, 0.85)", // amber-400
      pointerEvents: "none",
      borderRadius: stickerBorderRadius,
      transition: SIZE_TRANSITION,
    }

    const outer: CSSProperties = {
      position: "absolute",
      inset: 0,
      border: "2px solid rgba(255,255,255,0.5)",
      pointerEvents: "none",
      borderRadius: stickerBorderRadius,
      transition: SIZE_TRANSITION,
    }

    return { inner, outer }
  }, [shape, dimensions, stickerAreaSize.width, stickerAreaSize.height, stickerBorderRadius])

  const getWrapperCenter = useCallback(() => {
    const rect = imageWrapperRef.current?.getBoundingClientRect()
    if (!rect) {
      return null
    }
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    }
  }, [])

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

  const startScaleHandleDrag = useCallback(
    (event: React.PointerEvent<HTMLButtonElement>) => {
      if (!imageData) return
      event.preventDefault()
      event.stopPropagation()
      const center = getWrapperCenter()
      if (!center) {
        return
      }

      const element = event.currentTarget
      if (element.setPointerCapture) {
        element.setPointerCapture(event.pointerId)
      }

      const initialDistance = Math.hypot(event.clientX - center.x, event.clientY - center.y) || 1

      activeTransformRef.current = {
        type: "scale",
        initialScale: scale,
        initialDistance,
        pointerId: event.pointerId,
        target: element,
      }

      setIsImageSelected(true)
    },
    [getWrapperCenter, imageData, scale]
  )

  const startRotateHandleDrag = useCallback(
    (event: React.PointerEvent<HTMLButtonElement>) => {
      if (!imageData) return
      event.preventDefault()
      event.stopPropagation()
      const center = getWrapperCenter()
      if (!center) {
        return
      }

      const element = event.currentTarget
      if (element.setPointerCapture) {
        element.setPointerCapture(event.pointerId)
      }

      const initialAngle = Math.atan2(event.clientY - center.y, event.clientX - center.x)

      activeTransformRef.current = {
        type: "rotate",
        initialRotation: rotation,
        initialAngle,
        pointerId: event.pointerId,
        target: element,
      }

      setIsImageSelected(true)
    },
    [getWrapperCenter, imageData, rotation]
  )

  const startDrag = useCallback((point: Point) => {
    if (!imageData) return
    setIsDragging(true)
    dragStateRef.current = {
      start: point,
      startPosition: position,
    }
  }, [imageData, position])

  const updateDrag = useCallback((point: Point) => {
    if (!imageData || !dragStateRef.current || !isDragging) return

    const deltaX = point.x - dragStateRef.current.start.x
    const deltaY = point.y - dragStateRef.current.start.y

    setPosition({
      x: dragStateRef.current.startPosition.x + deltaX,
      y: dragStateRef.current.startPosition.y + deltaY,
    })
  }, [imageData, isDragging])

  const endDrag = useCallback(() => {
    dragStateRef.current = null
    setIsDragging(false)
  }, [])

  const handleMouseDown = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (event.button !== 0 || !imageData) return
    event.preventDefault()
    setIsImageSelected(true)
    startDrag({ x: event.clientX, y: event.clientY })
  }, [imageData, startDrag])

  useEffect(() => {
    const handleMove = (event: MouseEvent) => {
      if (isDragging) {
        updateDrag({ x: event.clientX, y: event.clientY })
      }
    }
    const handleUp = () => {
      endDrag()
    }

    document.addEventListener("mousemove", handleMove)
    document.addEventListener("mouseup", handleUp)
    return () => {
      document.removeEventListener("mousemove", handleMove)
      document.removeEventListener("mouseup", handleUp)
    }
  }, [isDragging, updateDrag, endDrag])

  const handleTouchStart = useCallback((event: React.TouchEvent<HTMLDivElement>) => {
    if (!imageData) return
    setIsImageSelected(true)
    if (event.touches.length === 1) {
      const touch = event.touches[0]
      startDrag({ x: touch.clientX, y: touch.clientY })
    } else if (event.touches.length === 2) {
      const [t1, t2] = Array.from(event.touches)
      pinchStateRef.current = {
        initialDistance: distanceBetweenTouches(t1, t2),
        initialScale: scale,
      }
    }
  }, [imageData, startDrag, scale])

  const handleTouchMove = useCallback((event: React.TouchEvent<HTMLDivElement>) => {
    if (!imageData) return

    if (event.touches.length === 1 && isDragging) {
      const touch = event.touches[0]
      updateDrag({ x: touch.clientX, y: touch.clientY })
    } else if (event.touches.length === 2 && pinchStateRef.current) {
      event.preventDefault()
      const [t1, t2] = Array.from(event.touches)
      const distance = distanceBetweenTouches(t1, t2)
      const nextScale =
        (pinchStateRef.current.initialScale * distance) /
        (pinchStateRef.current.initialDistance || distance)
      setScale(clamp(nextScale, 0.5, 3))
    }
  }, [imageData, isDragging, updateDrag])

  const handleTouchEnd = useCallback(() => {
    pinchStateRef.current = null
    endDrag()
  }, [endDrag])

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      const active = activeTransformRef.current
      if (!active || event.pointerId !== active.pointerId) {
        return
      }

      const center = getWrapperCenter()
      if (!center) {
        return
      }

      event.preventDefault()

      if (active.type === "scale") {
        const distance = Math.hypot(event.clientX - center.x, event.clientY - center.y)
        if (!distance || !active.initialDistance) {
          return
        }
        const ratio = distance / active.initialDistance
        const nextScale = clamp(active.initialScale * ratio, 0.5, 3)
        setScale(nextScale)
      } else if (active.type === "rotate") {
        const currentAngle = Math.atan2(event.clientY - center.y, event.clientX - center.x)
        const delta = currentAngle - active.initialAngle
        let next = active.initialRotation + (delta * 180) / Math.PI
        if (next > 180) {
          next -= 360
        } else if (next <= -180) {
          next += 360
        }
        setRotation(Math.max(-180, Math.min(180, next)))
      }
    }

    const handlePointerUp = (event: PointerEvent) => {
      const active = activeTransformRef.current
      if (!active || event.pointerId !== active.pointerId) {
        return
      }

      if (active.target?.releasePointerCapture) {
        active.target.releasePointerCapture(active.pointerId)
      }

      activeTransformRef.current = null
    }

    document.addEventListener("pointermove", handlePointerMove, { passive: false })
    document.addEventListener("pointerup", handlePointerUp)
    document.addEventListener("pointercancel", handlePointerUp)

    return () => {
      document.removeEventListener("pointermove", handlePointerMove)
      document.removeEventListener("pointerup", handlePointerUp)
      document.removeEventListener("pointercancel", handlePointerUp)
    }
  }, [getWrapperCenter])

  const onFileDrop = useCallback(
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
          previewDataUrl = await fileToDataUrl(file)
          nextPreviewKind = "bitmap"
          setEditorError(null)
        } else if (mimeType === "application/pdf") {
          const previewImage = await convertPdfToImage(file)
          if (previewImage) {
            previewDataUrl = previewImage
            nextPreviewKind = "pdf"
            setEditorError(null)
          } else {
            nextPreviewKind = "unsupported"
            setEditorError("Could not generate a preview for this PDF, but the file was stored.")
          }
        } else if (mimeType.includes("illustrator") || mimeType.includes("postscript")) {
          const previewImage = await convertVectorToImage(file)
          if (previewImage) {
            previewDataUrl = previewImage
            nextPreviewKind = "vector"
            setEditorError(null)
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
            (file.type || "").toLowerCase().startsWith("image/") || file.type === "image/svg+xml" ? previewDataUrl ?? undefined : undefined,
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
    [disabled, clearError, saveOriginalAsset, shape, dimensions, onAutoConfigure, checkTransparency]
  )

  const handleReset = useCallback(() => {
    if (!imageData) {
      return
    }
    setScale(1)
    setRotation(0)
    setPosition({ x: 0, y: 0 })
    setEditorError(null)
  }, [imageData])

  // Keyboard shortcuts
  useEffect(() => {
    if (!imageData) return

    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return
      }

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
      const modKey = isMac ? event.metaKey : event.ctrlKey

      // Undo: Ctrl/Cmd + Z
      if (modKey && event.key === 'z' && !event.shiftKey) {
        event.preventDefault()
        handleUndo()
      }
      // Redo: Ctrl/Cmd + Shift + Z or Ctrl/Cmd + Y
      else if ((modKey && event.shiftKey && event.key === 'z') || (modKey && event.key === 'y')) {
        event.preventDefault()
        handleRedo()
      }
      // Reset: R
      else if (event.key === 'r' || event.key === 'R') {
        event.preventDefault()
        handleReset()
      }
      // Zoom in: + or =
      else if (event.key === '+' || event.key === '=') {
        event.preventDefault()
        handleScaleChange(0.1)
      }
      // Zoom out: -
      else if (event.key === '-') {
        event.preventDefault()
        handleScaleChange(-0.1)
      }
      // Rotate left: [
      else if (event.key === '[') {
        event.preventDefault()
        handleRotationChange(-5)
      }
      // Rotate right: ]
      else if (event.key === ']') {
        event.preventDefault()
        handleRotationChange(5)
      }
      // Arrow keys for fine positioning
      else if (event.key.startsWith('Arrow')) {
        event.preventDefault()
        const step = event.shiftKey ? 10 : 1
        switch (event.key) {
          case 'ArrowUp':
            setPosition(p => ({ ...p, y: p.y - step }))
            break
          case 'ArrowDown':
            setPosition(p => ({ ...p, y: p.y + step }))
            break
          case 'ArrowLeft':
            setPosition(p => ({ ...p, x: p.x - step }))
            break
          case 'ArrowRight':
            setPosition(p => ({ ...p, x: p.x + step }))
            break
        }
      }
      // Show keyboard hints: ?
      else if (event.key === '?' && event.shiftKey) {
        event.preventDefault()
        setShowKeyboardHints(prev => !prev)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [imageData, handleUndo, handleRedo, handleReset, handleScaleChange, handleRotationChange])

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

      const img = await loadImage(imageData)
      const { width: naturalWidth, height: naturalHeight } = imageMetaRef.current

      const targetWidth = shapeStyles.pixelWidth || containerSize.width
      const targetHeight = shapeStyles.pixelHeight || containerSize.height
      const exportScale = 2
      const canvasWidth = Math.max(1, Math.round(targetWidth * exportScale))
      const canvasHeight = Math.max(1, Math.round(targetHeight * exportScale))
      const offscreen = document.createElement("canvas")
      offscreen.width = canvasWidth
      offscreen.height = canvasHeight
      const context = offscreen.getContext("2d")
      if (!context) {
        throw new Error("Unable to acquire canvas context")
      }

      context.scale(exportScale, exportScale)

      const workingWidth = canvasWidth / exportScale
      const workingHeight = canvasHeight / exportScale
      context.clearRect(0, 0, workingWidth, workingHeight)

      context.save()

      if (shape === "circle") {
        const radius = Math.min(workingWidth, workingHeight) / 2
        context.beginPath()
        context.arc(workingWidth / 2, workingHeight / 2, radius, 0, Math.PI * 2)
        context.closePath()
        context.clip()
      } else if (shape === "square" || shape === "rectangle") {
        const cornerRadius = shape === "rectangle" ? workingWidth * 0.035 : workingWidth * 0.01
        createRoundedRectPath(context, 0, 0, workingWidth, workingHeight, cornerRadius)
        context.clip()
      }

      context.fillStyle = isImageDark ? "#ffffff" : "#14161b"
      context.fillRect(0, 0, workingWidth, workingHeight)

      const baseScale = baseScaleRef.current || (renderSize.width && naturalWidth ? renderSize.width / naturalWidth : 1)
      const finalScale = baseScale * scale
      const destWidth = naturalWidth * finalScale
      const destHeight = naturalHeight * finalScale

      // Scale position from sticker area pixels to export dimensions
      const positionScaleX = stickerAreaSize.width > 0 ? targetWidth / stickerAreaSize.width : 1
      const positionScaleY = stickerAreaSize.height > 0 ? targetHeight / stickerAreaSize.height : 1
      const scaledPositionX = position.x * positionScaleX
      const scaledPositionY = position.y * positionScaleY

      context.translate(workingWidth / 2 + scaledPositionX, workingHeight / 2 + scaledPositionY)
      context.rotate((rotation * Math.PI) / 180)
      context.drawImage(img, -destWidth / 2, -destHeight / 2, destWidth, destHeight)

      context.restore()

      const blob = await new Promise<Blob | null>((resolve) => offscreen.toBlob(resolve, "image/png"))
      if (!blob) {
        throw new Error("Failed to export edited design")
      }

      await saveEditedAsset({
        blob,
        fileName: "sticker-design.png",
        mimeType: "image/png",
        transformations: {
          scale,
          rotation,
          position,
        },
      })
    } catch (error) {
      console.error("Failed to export edited design:", error)
      setEditorError("We couldn't save the edited design. Please try again.")
    } finally {
      setIsSavingDesign(false)
    }
  }, [
    imageData,
    containerSize.width,
    containerSize.height,
    stickerAreaSize.width,
    stickerAreaSize.height,
    renderSize.width,
    position,
    rotation,
    scale,
    isImageDark,
    shape,
    shapeStyles.pixelWidth,
    shapeStyles.pixelHeight,
    saveEditedAsset,
  ])

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

  const canUndo = historyIndex > 0 && history.length > 1
  const canRedo = historyIndex < history.length - 1

  // Expose functions to parent via ref
  useImperativeHandle(ref, () => ({
    saveDesign: handleSaveEditedDesign,
    isSavingDesign,
    handleScaleChange,
    handleRotationChange,
    handleReset,
  }), [handleSaveEditedDesign, isSavingDesign, handleScaleChange, handleRotationChange, handleReset])

  return (
    <div className="flex h-full flex-col">
      {/* Top Bar - Fixed Info and Toolbar */}
      <div className="relative z-10 space-y-3">
        {/* Info Bar */}
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
          <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
            <div className="rounded-full bg-neutral-800/90 px-4 py-2 text-sm font-semibold text-neutral-200 shadow-lg backdrop-blur-sm">
              {shape === "circle"
                ? `⌀ ${dimensions.diameter}cm`
                : `${dimensions.width}cm × ${dimensions.height}cm`}
            </div>
            {imageData && !isTouchDevice && (
              <button
                onClick={() => setShowKeyboardHints(!showKeyboardHints)}
                className="group flex items-center gap-1.5 rounded-full bg-indigo-900/40 px-3 py-2 text-xs font-medium text-indigo-300 shadow-md transition-all hover:bg-indigo-900/60"
                title="Show keyboard shortcuts"
              >
                <MousePointerClick className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Shortcuts</span>
                <span className="text-[10px] opacity-70">?</span>
              </button>
            )}
          </div>
          
          {/* Action Buttons - Top Right */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => open()}
              disabled={disabled || isUploading}
              className={clsx(
                "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium shadow-md transition-all duration-200 min-h-[44px]",
                disabled || isUploading
                  ? "cursor-not-allowed bg-neutral-800/40 text-neutral-500"
                  : "bg-neutral-800/80 text-neutral-200 hover:bg-neutral-700/90 active:scale-95"
              )}
              title={imageData ? "Replace image" : "Upload image"}
            >
              <Upload className="h-4 w-4" />
              <span className="hidden sm:inline">{imageData ? "Replace" : "Upload"}</span>
            </button>
            
            {imageData && (
              <>
                <button
                  type="button"
                  onClick={handleUndo}
                  disabled={!canUndo}
                  title="Undo"
                  className={clsx(
                    "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium shadow-md transition-all duration-200 min-h-[44px]",
                    !canUndo
                      ? "cursor-not-allowed bg-neutral-800/40 text-neutral-500"
                      : "bg-neutral-800/80 text-neutral-200 hover:bg-neutral-700/90 active:scale-95"
                  )}
                >
                  <Undo2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Undo</span>
                </button>
                <button
                  type="button"
                  onClick={handleRedo}
                  disabled={!canRedo}
                  title="Redo"
                  className={clsx(
                    "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium shadow-md transition-all duration-200 min-h-[44px]",
                    !canRedo
                      ? "cursor-not-allowed bg-neutral-800/40 text-neutral-500"
                      : "bg-neutral-800/80 text-neutral-200 hover:bg-neutral-700/90 active:scale-95"
                  )}
                >
                  <Redo2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Redo</span>
                </button>
              </>
            )}
            
            <button
              type="button"
              onClick={handleReset}
              disabled={!imageData}
              title="Reset"
              className={clsx(
                "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium shadow-md transition-all duration-200 min-h-[44px]",
                !imageData
                  ? "cursor-not-allowed bg-neutral-800/40 text-neutral-500"
                  : "bg-neutral-800/80 text-neutral-200 hover:bg-neutral-700/90 active:scale-95"
              )}
            >
              <RefreshCcw className="h-4 w-4" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          </div>
        </div>

        {/* Format Support Info */}
        <div className="flex items-center justify-center gap-2 rounded-lg bg-neutral-900/40 px-4 py-2 text-xs text-neutral-400">
          <Info className="h-3.5 w-3.5 text-neutral-500" />
          <span>PNG, JPG, SVG, AI, PDF (300 DPI+)</span>
        </div>

        {resolutionWarning && imageData && (
          <div className="mt-3 flex items-center justify-center gap-2 text-xs text-amber-200">
            <AlertCircle className="h-3.5 w-3.5 text-amber-300" />
            <p className="text-center">
              <span className="font-medium text-amber-100">
                Low resolution (~{Math.round(resolutionWarning.detectedPpi)} PPI).
              </span>{" "}
              Recommended {resolutionWarning.recommended} PPI for best print quality.
            </p>
          </div>
        )}

        {/* Error Messages - Top */}
        {(uploadError || editorError) && (
          <div className="animate-in fade-in slide-in-from-top-2 mx-auto max-w-2xl">
            <div className="flex items-start gap-3 rounded-lg border border-red-500/50 bg-red-900/20 p-3 backdrop-blur-sm">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-400" />
              <p className="text-sm text-red-400">{uploadError ?? editorError}</p>
            </div>
          </div>
        )}
      </div>

      {/* Main Canvas Area - Flex Grow */}
      <div className="relative flex flex-1 gap-3 pt-4 md:gap-4">
        {/* Zoom/Rotation + Orientation Controls - Left Side (desktop) */}
        {shouldShowControlPanel && (
          <div className="hidden w-24 flex-shrink-0 md:flex">
            <div className="sticky top-4 flex h-fit w-full flex-col gap-4 rounded-2xl border border-neutral-700 bg-neutral-800/80 p-3 shadow-xl backdrop-blur-sm">
              {hasZoomControls && (
                <DesignZoomTool
                  scale={scale}
                  rotation={rotation}
                  onScaleChange={handleScaleChange}
                  onRotationChange={handleRotationChange}
                />
              )}
              {canAdjustOrientation && (
                <OrientationToggle
                  current={activeOrientation}
                  onChange={onOrientationChange}
                  layout="vertical"
                />
              )}
            </div>
          </div>
        )}


        {/* Canvas Container */}
        <div className="relative flex w-full flex-1 flex-col items-center justify-center p-4">
          <div
            {...getRootProps()}
            ref={containerRef}
            style={dropzoneStyle}
            className={clsx(
              "relative h-full w-full transition-all duration-300 ease-in-out",
              {
                "ring-4 ring-indigo-500/20": isDragActive,
              }
            )}
            onWheel={(event) => {
              if (!imageData || (!event.ctrlKey && !event.metaKey)) return
              event.preventDefault()
              const zoomFactor = 1 + -event.deltaY / 600
              setScale((prev) => clamp(prev * zoomFactor, 0.5, 3))
            }}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <input {...getInputProps()} />

            {/* Sticker area overlay: reflects selected size */}
            {stickerAreaSize.width > 0 && stickerAreaSize.height > 0 && (
              <div
                className="pointer-events-none absolute left-1/2 top-1/2 z-[3]"
                style={{
                  width: stickerAreaSize.width,
                  height: stickerAreaSize.height,
                  transform: "translate(-50%, -50%)",
                  transition: "width 240ms ease, height 240ms ease",
                }}
              >
                {/* Outer cut/trim line */}
                {bleedStyles && <div style={bleedStyles.outer} />}
                {/* Inner safe/bleed margin indicator */}
                {bleedStyles && <div style={bleedStyles.inner} />}
              </div>
            )}

            {imageData && renderSize.width > 0 && renderSize.height > 0 ? (
              <div
                className="absolute left-1/2 top-1/2 z-[1]"
                style={{
                  width: renderSize.width,
                  height: renderSize.height,
                  transform: `translate(-50%, -50%) translate(${position.x}px, ${position.y}px)`
                }}
              >
                <div
                  ref={imageWrapperRef}
                  className="relative h-full w-full"
                  style={{
                    transform: `rotate(${rotation}deg) scale(${scale})`,
                    transformOrigin: "center",
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imageData}
                    alt="Artwork preview"
                    draggable={false}
                    className="h-full w-full select-none object-contain"
                    style={{
                      userSelect: "none",
                      pointerEvents: "none",
                    }}
                  />

                  {isImageSelected && (
                    <>
                      <div
                        className={selectionBorderClass}
                        style={{
                          borderRadius: "0px",
                          borderWidth: `${2 * controlScaleCompensation}px`,
                        }}
                      />
                      {cornerHandles.map(({ key, style, cursor }) => (
                        <button
                          key={key}
                          type="button"
                          aria-label="Resize design"
                          className={handleAccentClass}
                          style={{
                            ...style,
                            cursor,
                            transform: `translate(-50%, -50%) scale(${controlScaleCompensation})`,
                          }}
                          onPointerDown={startScaleHandleDrag}
                        />
                      ))}
                      <div className="pointer-events-none absolute left-1/2 top-0 flex -translate-x-1/2 -translate-y-full items-center justify-center">
                        <span
                          className="block bg-sky-300/70"
                          style={{
                            width: "1px",
                            height: `${24 * controlScaleCompensation}px`,
                          }}
                        />
                      </div>
                      <button
                        type="button"
                        aria-label="Rotate design"
                        className={rotationHandleClass}
                        style={{
                          cursor: "grab",
                          left: "50%",
                          top: 0,
                          transform: `translate(-50%, -120%) scale(${controlScaleCompensation})`,
                        }}
                        onPointerDown={startRotateHandleDrag}
                      />
                    </>
                  )}
                </div>
              </div>
            ) : previewKind === "unsupported" ? (
              <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
                <div className="rounded-full bg-amber-900/30 p-4">
                  <AlertCircle className="h-8 w-8 text-amber-400" />
                </div>
                <div className="space-y-2">
                  <p className="text-base font-semibold text-neutral-200">Preview unavailable</p>
                  <p className="text-sm text-neutral-400">
                    The original file has been uploaded, but we can&apos;t preview this format.
                  </p>
                </div>
              </div>
            ) : (
              <div
                className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center"
                role="button"
                tabIndex={canBrowse ? 0 : -1}
                onClick={() => {
                  if (canBrowse) open()
                }}
                onKeyDown={(event) => {
                  if (!canBrowse) return
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault()
                    open()
                  }
                }}
              >
                {isProcessing ? (
                  <>
                    <div className="relative">
                      <div className="h-16 w-16 animate-spin rounded-full border-4 border-neutral-700 border-t-indigo-500"></div>
                      <Upload className="absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 text-indigo-400" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-base font-semibold text-neutral-200">Preparing preview…</p>
                      <p className="text-sm text-neutral-400">Converting your file for editing</p>
                    </div>
                  </>
                ) : isDragActive ? (
                  <>
                    <div className="rounded-full bg-indigo-900/30 p-6">
                      <Upload className="h-12 w-12 text-indigo-400" />
                    </div>
                    <p className="text-lg font-semibold text-indigo-200">Drop your file here</p>
                  </>
                ) : (
                  <>
                    <div className="rounded-full bg-neutral-800/50 p-6">
                      <Upload className="h-12 w-12 text-neutral-500" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-base font-semibold text-neutral-200">
                        {isTouchDevice ? "Tap to upload your artwork" : "Drag & drop your artwork here"}
                      </p>
                      <p className="text-sm text-neutral-400">
                        {isTouchDevice ? "Supported formats: PNG, JPG, SVG, AI, PDF" : "or click to browse files"}
                      </p>
                    </div>
                    <div className="mt-2 rounded-lg border border-neutral-700 bg-neutral-800/50 px-4 py-2 text-xs text-neutral-400">
                      High-resolution PNG, JPG, SVG, AI, or PDF files (300 DPI+) yield the sharpest stickers.
                    </div>
                  </>
                )}
              </div>
            )}
        </div>

        {canAdjustOrientation && (
          <div className="mt-6 flex items-center justify-center gap-2 md:hidden">
            <span className="text-xs font-medium text-neutral-400">Orientation:</span>
            <OrientationToggle
              current={activeOrientation}
              onChange={onOrientationChange}
              layout="horizontal"
            />
          </div>
        )}
      </div>

    </div>

      {uploadSuccess && imageData && (
        <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center animate-in fade-in duration-300">
          <div className="rounded-xl border border-emerald-500/50 bg-emerald-900/95 p-5 shadow-2xl backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 shadow-lg">
                <Check className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="font-semibold text-emerald-50">Design saved!</p>
                <p className="text-sm text-emerald-100/80">
                  Your edited artwork is stored locally and will upload when you add it to the cart.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts Modal */}
      {showKeyboardHints && imageData && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setShowKeyboardHints(false)}
        >
          <div 
            className="w-full max-w-lg rounded-xl border border-neutral-700 bg-neutral-900 p-6 shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-xl font-bold text-white">
                <MousePointerClick className="h-5 w-5 text-indigo-400" />
                Keyboard Shortcuts
              </h3>
              <button
                onClick={() => setShowKeyboardHints(false)}
                className="rounded-lg p-1.5 text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-white"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-neutral-300">Transform</h4>
                <div className="grid gap-2">
                  <ShortcutItem keys={["Drag"]} description="Move artwork" />
                  <ShortcutItem keys={["Ctrl", "Scroll"]} description="Zoom in/out" />
                  <ShortcutItem keys={["+"]} description="Zoom in" />
                  <ShortcutItem keys={["-"]} description="Zoom out" />
                  <ShortcutItem keys={["["]} description="Rotate left" />
                  <ShortcutItem keys={["]"]} description="Rotate right" />
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-neutral-300">Position</h4>
                <div className="grid gap-2">
                  <ShortcutItem keys={["↑", "↓", "←", "→"]} description="Move 1px" />
                  <ShortcutItem keys={["Shift", "↑", "↓", "←", "→"]} description="Move 10px" />
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-neutral-300">History</h4>
                <div className="grid gap-2">
                  <ShortcutItem keys={["Ctrl", "Z"]} description="Undo" />
                  <ShortcutItem keys={["Ctrl", "Shift", "Z"]} description="Redo" />
                  <ShortcutItem keys={["Ctrl", "Y"]} description="Redo (alternative)" />
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-neutral-300">Other</h4>
                <div className="grid gap-2">
                  <ShortcutItem keys={["R"]} description="Reset layout" />
                  <ShortcutItem keys={["?"]} description="Show this help" />
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-lg bg-indigo-950/30 border border-indigo-800/30 p-3 text-xs text-indigo-200">
              💡 Tip: Use keyboard shortcuts for faster and more precise editing!
            </div>
          </div>
        </div>
      )}
    </div>
  )
})

ImageDropZone.displayName = 'ImageDropZone'

export default ImageDropZone

// Helper component for keyboard shortcut display
function ShortcutItem({ keys, description }: { keys: string[]; description: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-neutral-800/50 px-3 py-2">
      <div className="flex items-center gap-1.5">
        {keys.map((key, index) => (
          <span key={index} className="flex items-center gap-1">
            {index > 0 && <span className="text-neutral-600 text-xs">+</span>}
            <kbd className="min-w-[28px] rounded bg-neutral-700 px-2 py-1 text-center text-xs font-semibold text-neutral-200 shadow-sm">
              {key}
            </kbd>
          </span>
        ))}
      </div>
      <span className="text-sm text-neutral-400">{description}</span>
    </div>
  )
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function distanceBetweenTouches(t1: React.Touch, t2: React.Touch) {
  const dx = t1.clientX - t2.clientX
  const dy = t1.clientY - t2.clientY
  return Math.hypot(dx, dy)
}

function createRoundedRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  const r = Math.max(0, Math.min(radius, width / 2, height / 2))
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + width - r, y)
  ctx.quadraticCurveTo(x + width, y, x + width, y + r)
  ctx.lineTo(x + width, y + height - r)
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height)
  ctx.lineTo(x + r, y + height)
  ctx.quadraticCurveTo(x, y + height, x, y + height - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

async function analyzeImage(
  dataUrl: string,
  dimensions: Dimensions,
  shape: Shape,
  setWarning: (value: { detectedPpi: number; recommended: number } | null) => void,
  setDark: (value: boolean) => void
): Promise<ImageMeta | null> {
  try {
    const img = await loadImage(dataUrl)
    evaluateResolution(img, dimensions, shape, setWarning)
    setDark(isPredominantlyDarkImage(img))
    return { width: img.naturalWidth || img.width, height: img.naturalHeight || img.height }
  } catch (error) {
    console.error("Failed to analyze image", error)
    setWarning(null)
    setDark(false)
    return null
  }
}

function evaluateResolution(
  img: HTMLImageElement,
  dimensions: Dimensions,
  shape: Shape,
  setWarning: (value: { detectedPpi: number; recommended: number } | null) => void
) {
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
    setWarning(null)
    return
  }

  const widthInches = widthCm / 2.54
  const heightInches = heightCm / 2.54
  const widthPpi = img.naturalWidth / widthInches
  const heightPpi = img.naturalHeight / heightInches
  const detectedPpi = Math.min(widthPpi, heightPpi)

  if (detectedPpi < MIN_PPI_WARNING) {
    setWarning({ detectedPpi, recommended: PREFERRED_PPI })
  } else {
    setWarning(null)
  }
}

async function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return await new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = dataUrl
  })
}

function isPredominantlyDarkImage(img: HTMLImageElement): boolean {
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
interface OrientationToggleProps {
  current: Orientation
  onChange?: (orientation: Orientation) => void
  className?: string
  layout?: "horizontal" | "vertical"
}

const OrientationToggle = ({ current, onChange, className, layout = "horizontal" }: OrientationToggleProps) => {
  const isVertical = layout === "vertical"

  return (
    <div
      className={clsx(
        "gap-3",
        isVertical ? "flex flex-col w-full" : "flex items-center justify-center",
        className
      )}
    >
      {(["portrait", "landscape"] as Orientation[]).map((option) => {
        const isSelected = current === option
        const isPortrait = option === "portrait"

        return (
          <button
            key={option}
            type="button"
            onClick={() => onChange?.(option)}
            disabled={!onChange}
            aria-label={option === "portrait" ? "Portrait orientation" : "Landscape orientation"}
            title={option === "portrait" ? "Portrait orientation" : "Landscape orientation"}
            className={clsx(
              "relative flex items-center justify-center rounded-md border text-[11px] font-medium uppercase tracking-wide transition",
              isVertical ? "h-11 w-full" : "h-12 w-12",
              isSelected
                ? "border-indigo-300 bg-indigo-800/60 text-indigo-100 shadow-md"
                : "border-neutral-600/70 bg-neutral-800/70 text-neutral-300 hover:border-neutral-500 hover:text-neutral-100",
              !onChange && "cursor-not-allowed opacity-60"
            )}
          >
            <div
              className={clsx(
                "pointer-events-none block rounded-[3px] border",
                isPortrait ? "h-7 w-3" : "h-3 w-7",
                isSelected ? "border-white/80 bg-white/20" : "border-neutral-200/60 bg-neutral-100/10"
              )}
            />
          </button>
        )
      })}
    </div>
  )
}
