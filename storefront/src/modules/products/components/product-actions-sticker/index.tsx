"use client"

import { Button } from "@medusajs/ui"
import clsx from "clsx"
import { Transition } from "@headlessui/react"
import { useParams } from "next/navigation"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { 
  Shapes, 
  Layers, 
  Ruler, 
  Package, 
  Scroll, 
  ScanLine,
  ChevronRight,
  Check,
  Save
} from "lucide-react"

import { addStickerToCart } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import { Shape } from "../calculator/shape-selector"
import { useShapeStickerPricing } from "@lib/hooks/use-shape-sticker-pricing"
import { DesignDraftState, getDesignFilesFromState } from "../calculator/utils/design-storage"
import { Dimensions, Material, Format, Peeling } from "../calculator/types"
import { getPresignedUploadUrl, uploadFileToPresignedUrl } from "@lib/data/uploads"
import ImageDropZone, {
  ImageDropZoneHandle,
  type AutoConfigureSuggestion,
} from "../calculator/image-drop-zone"
import ShapeSelector from "../calculator/shape-selector"
import MaterialSelector from "../calculator/material-selector"
import FormatSelector from "../calculator/format-selector"
import PeelingSelector from "../calculator/peeling-selector"
import SizeInput from "../calculator/size-input"
import QuantitySelector from "../calculator/quantity-selector"
import {
  applyOrientationToDimensions,
  deriveOrientation,
  supportsOrientation,
  type Orientation,
} from "../calculator/orientation"

type ProductActionsStickerProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  disabled?: boolean
}

type CrackPatternOptions = {
  width?: number
  height?: number
  seed: number
}

const createPseudoRandom = (seed: number) => {
  let state = Math.floor(Math.abs(seed) * 1_000_000) || 1
  return () => {
    state = (state * 48271) % 0x7fffffff
    return state / 0x7fffffff
  }
}

const generateCrackPattern = ({ width = 960, height = 960, seed }: CrackPatternOptions) => {
  if (typeof document === "undefined") {
    return null
  }

  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext("2d")
  if (!context) {
    return null
  }

  const rand = createPseudoRandom(seed)

  context.fillStyle = "#14161b"
  context.fillRect(0, 0, width, height)
  context.lineCap = "round"

  const centersCount = 2 + Math.floor(rand() * 2)
  const crackLayers: Array<{ cx: number; cy: number; angles: number[] }> = []

  for (let i = 0; i < centersCount; i++) {
    const cx = width * (0.25 + rand() * 0.5)
    const cy = height * (0.25 + rand() * 0.5)
    const radialCount = 4 + Math.floor(rand() * 4)
    const radialAngles: number[] = []

    const baseStroke = 0.8 + rand() * 0.4
    context.strokeStyle = `rgba(83, 87, 96, ${0.45 + rand() * 0.2})`

    for (let r = 0; r < radialCount; r++) {
      const baseAngle = (r * (Math.PI * 2)) / radialCount
      const jitter = (rand() - 0.5) * (Math.PI / radialCount)
      const angle = baseAngle + jitter
      radialAngles.push(angle)

      const segments = 5 + Math.floor(rand() * 4)
      let currentX = cx
      let currentY = cy
      const maxLength = width * (0.32 + rand() * 0.28)

      context.beginPath()
      context.moveTo(cx, cy)
      for (let s = 1; s <= segments; s++) {
        const progress = s / segments
        const bend = (rand() - 0.5) * 0.4
        const localAngle = angle + bend * progress
        const length = maxLength * progress * (0.8 + rand() * 0.4)
        currentX = cx + Math.cos(localAngle) * length
        currentY = cy + Math.sin(localAngle) * length
        context.lineTo(currentX, currentY)
      }
      context.lineWidth = baseStroke + rand() * 0.4
      context.stroke()
    }

    crackLayers.push({ cx, cy, angles: radialAngles })
  }

  crackLayers.forEach(({ cx, cy, angles }) => {
    const ringCount = 2 + Math.floor(rand() * 2)
    for (let ring = 0; ring < ringCount; ring++) {
      const radius = width * (0.14 + rand() * 0.18) * (0.8 + ring * 0.25)
      context.beginPath()
      angles.forEach((angle, index) => {
        const jitter = (rand() - 0.5) * (Math.PI / angles.length)
        const distance = radius * (0.9 + rand() * 0.2)
        const x = cx + Math.cos(angle + jitter) * distance
        const y = cy + Math.sin(angle + jitter) * distance
        if (index === 0) {
          context.moveTo(x, y)
        } else {
          context.lineTo(x, y)
        }
      })
      context.closePath()
      context.strokeStyle = `rgba(70, 73, 80, ${0.3 + rand() * 0.18})`
      context.lineWidth = 0.6 + rand() * 0.4
      context.stroke()
    }
  })

  const area = width * height
  const baseDensity = 0.000018
  const crackCount = Math.floor(baseDensity * area)

  for (let i = 0; i < crackCount; i++) {
    const startX = rand() * width
    const startY = rand() * height
    const angle = rand() * Math.PI * 2
    const length = width * (0.04 + rand() * 0.08)
    const deviation = (rand() - 0.5) * 0.6
    const endX = startX + Math.cos(angle + deviation) * length
    const endY = startY + Math.sin(angle + deviation) * length

    context.beginPath()
    context.moveTo(startX, startY)
    context.lineTo(endX, endY)
    context.strokeStyle = `rgba(76, 80, 88, ${0.25 + rand() * 0.18})`
    context.lineWidth = 0.5 + rand() * 0.6
    context.stroke()
  }

  context.globalCompositeOperation = "lighter"
  crackLayers.forEach(({ cx, cy, angles }) => {
    angles.forEach((angle) => {
      const highlightLength = width * (0.22 + rand() * 0.16)
      const targetX = cx + Math.cos(angle) * highlightLength
      const targetY = cy + Math.sin(angle) * highlightLength
      context.beginPath()
      context.moveTo(cx, cy)
      context.lineTo(targetX, targetY)
      context.strokeStyle = `rgba(184, 192, 214, ${0.06 + rand() * 0.04})`
      context.lineWidth = 1 + rand() * 0.6
      context.stroke()
    })
  })
  context.globalCompositeOperation = "source-over"

  return canvas.toDataURL("image/png")
}

const defaultDimensions: Record<Shape, Dimensions> = {
  rectangle: { width: 10, height: 6 },
  square: { width: 8, height: 8 },
  circle: { diameter: 10 },
  diecut: { width: 10, height: 6 },
}

type Step = 'shape' | 'material' | 'size' | 'quantity' | 'format' | 'peeling'

const STEPS: { id: Step; label: string; icon: React.ElementType }[] = [
  { id: 'shape', label: 'Shape', icon: Shapes },
  { id: 'material', label: 'Material', icon: Layers },
  { id: 'size', label: 'Size', icon: Ruler },
  { id: 'quantity', label: 'Quantity', icon: Package },
  { id: 'format', label: 'Format', icon: Scroll },
  { id: 'peeling', label: 'Peeling', icon: ScanLine },
]

export default function ProductActionsSticker({
  product,
  region: _region,
  disabled,
}: ProductActionsStickerProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [patternSeed] = useState(() => Math.random())
  const [backgroundPattern, setBackgroundPattern] = useState<string | null>(null)
  const [shape, setShape] = useState<Shape>("rectangle")
  const [material, setMaterial] = useState<Material>("vinyl")
  const [format, setFormat] = useState<Format>("sheets")
  const [peeling, setPeeling] = useState<Peeling>("easy_peel")
  const [dimensions, setDimensions] = useState<Dimensions>(defaultDimensions.rectangle)
  const [orientation, setOrientation] = useState<Orientation>(
    deriveOrientation("rectangle", defaultDimensions.rectangle)
  )
  const [quantity, setQuantity] = useState(500)
  const [designDraft, setDesignDraft] = useState<DesignDraftState | null>(null)
  const [editorState, setEditorState] = useState<{ hasImage: boolean; hasUnsavedChanges: boolean }>({
    hasImage: false,
    hasUnsavedChanges: false,
  })
  const [designError, setDesignError] = useState<string | null>(null)
  const [activeStep, setActiveStep] = useState<Step>('shape')
  
  const countryCode = useParams().countryCode as string
  void _region

  const imageDropZoneRef = useRef<ImageDropZoneHandle>(null)
  const { calculatePricing, lastPricing } = useShapeStickerPricing()
  const hasHydratedFromDraftRef = useRef(false)
  const skipDefaultDimensionsRef = useRef(false)

  const selectedVariant = product.variants?.[0]

  useEffect(() => {
    const pattern = generateCrackPattern({ seed: patternSeed })
    if (pattern) {
      setBackgroundPattern(pattern)
    }
  }, [patternSeed])

  useEffect(() => {
    if (skipDefaultDimensionsRef.current) {
      skipDefaultDimensionsRef.current = false
      return
    }

    setDimensions(defaultDimensions[shape])
    const nextOrientation = deriveOrientation(shape, defaultDimensions[shape])
    setOrientation(nextOrientation)
  }, [shape])

  useEffect(() => {
    if (!selectedVariant?.id) return

    calculatePricing(quantity, shape, dimensions, selectedVariant.id, material)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedVariant?.id, quantity, shape, dimensions, material])

  const inStock = useMemo(() => {
    if (selectedVariant && !selectedVariant.manage_inventory) {
      return true
    }
    if (selectedVariant?.allow_backorder) {
      return true
    }
    if (
      selectedVariant?.manage_inventory &&
      (selectedVariant?.inventory_quantity || 0) > 0
    ) {
      return true
    }
    return false
  }, [selectedVariant])

  const designReady = useMemo(
    () => Boolean(designDraft?.original && designDraft?.edited),
    [designDraft]
  )
  const designLockedIn = useMemo(
    () => designReady && !editorState.hasUnsavedChanges,
    [designReady, editorState.hasUnsavedChanges]
  )

  const actionsRef = useRef<HTMLDivElement>(null)

  const canAdjustOrientation = supportsOrientation(shape, dimensions)

  const isSavingDesign = imageDropZoneRef.current?.isSavingDesign

  // Standard CTA disabled state (logic for desktop and base constraints)
  const isCtaDisabled = useMemo(() => {
    if (!selectedVariant || !inStock || !!disabled || isAdding || isSavingDesign) {
      return true
    }
    if (!designLockedIn && editorState.hasImage) {
       return true
    }
    return false
  }, [selectedVariant, inStock, disabled, isAdding, isSavingDesign, designLockedIn, editorState.hasImage])

  // Mobile click disabled state
  const isMobileCtaDisabled = useMemo(() => {
    return isCtaDisabled // Base constraints
  }, [isCtaDisabled])

  const primaryCtaLabel = useMemo(() => {
    if (!selectedVariant) return "Select variant"
    if (!inStock) return "Out of stock"
    if (isSavingDesign) return "Saving design..."
    return "Add to cart"
  }, [selectedVariant, inStock, isSavingDesign])

  const desktopCtaLabel = useMemo(() => {
    if (lastPricing) {
      return `Add to cart • $${lastPricing.totalPrice.toFixed(2)}`
    }
    return "Add to cart"
  }, [lastPricing])

  const mobileCtaLabel = useMemo(() => {
    if (lastPricing) {
      return `Add • $${lastPricing.totalPrice.toFixed(2)}`
    }
    return "Add to cart"
  }, [lastPricing])

  const desktopInlineStatus = useMemo(() => {
    if (designError) {
      return { text: designError, className: "text-ui-fg-error" }
    }
    return null
  }, [designError])

  const ctaClasses = useMemo(
    () =>
      clsx(
        "h-12 px-6 min-w-[240px] max-w-[320px] w-auto flex-shrink-0 self-center rounded-rounded text-sm font-semibold sm:h-14 sm:text-base transition-colors",
        isCtaDisabled
          ? !designLockedIn && editorState.hasImage
            ? "bg-neutral-900 text-white border border-neutral-800 cursor-not-allowed" // Dimmed state for unsaved changes, price visible
            : "bg-neutral-800 text-neutral-500 border border-neutral-700" // Standard disabled state
          : "bg-emerald-500 text-white hover:bg-emerald-400 border border-emerald-500 shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400"
      ),
    [isCtaDisabled, designLockedIn, editorState.hasImage]
  )

  const SaveDesignButton = () => {
    if (!editorState.hasImage || !editorState.hasUnsavedChanges) return null

    return (
      <Button
        onClick={handleSaveDesign}
        disabled={isSavingDesign}
        className="h-12 w-12 rounded-full p-0 flex items-center justify-center bg-neutral-800 text-white border border-neutral-700 shadow-lg active:scale-95 transition-all hover:bg-neutral-700 flex-shrink-0"
        variant="secondary"
      >
        {isSavingDesign ? (
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
        ) : (
          <Save className="w-5 h-5" />
        )}
      </Button>
    )
  }

  const AddToCartButton = () => (
    <Button
      onClick={handleButtonClick}
      disabled={isCtaDisabled}
      variant="primary"
      className={ctaClasses}
      isLoading={isAdding || isSavingDesign}
      data-testid="add-product-button"
    >
      <div className="flex w-full flex-col items-center text-center leading-tight">
        <span className="text-sm font-semibold sm:text-base">{desktopCtaLabel}</span>
        {desktopInlineStatus && (
          <span className={clsx("text-[11px] font-medium", desktopInlineStatus.className)}>
            {desktopInlineStatus.text}
          </span>
        )}
      </div>
    </Button>
  )

  const uploadDesignAssets = useCallback(async (draft: DesignDraftState) => {
    if (!draft.original || !draft.edited) {
      throw new Error("Please upload and save your design before adding it to the cart.")
    }

    const uploadSingle = async (file: File) => {
      const { upload_url, file_key } = await getPresignedUploadUrl(file.name, file.type)
      await uploadFileToPresignedUrl(upload_url, file)

      const publicBase = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || ""
      const publicUrl = publicBase ? `${publicBase}/${file_key}` : upload_url.split("?")[0]

      return { fileKey: file_key, publicUrl }
    }

    const { original, edited } = await getDesignFilesFromState(draft)

    const originalUpload = await uploadSingle(original)
    const editedUpload = await uploadSingle(edited)

    return { original: originalUpload, edited: editedUpload }
  }, [])

  const handleDesignChange = useCallback(
    (draft: DesignDraftState | null) => {
      setDesignDraft(draft)

      if (draft) {
        setDesignError(null)

        if (!hasHydratedFromDraftRef.current) {
          if (draft.shape && draft.shape !== shape) {
            skipDefaultDimensionsRef.current = true
            setShape(draft.shape as Shape)
          }

          if (draft.dimensions) {
            skipDefaultDimensionsRef.current = true
            setDimensions(draft.dimensions as Dimensions)
            setOrientation(deriveOrientation(draft.shape ?? shape, draft.dimensions as Dimensions))
          }

          hasHydratedFromDraftRef.current = true
        }
      } else {
        hasHydratedFromDraftRef.current = false
      }
    },
    [shape]
  )

  const handleEditorStateChange = useCallback(
    (state: { hasImage: boolean; hasUnsavedChanges: boolean }) => {
      setEditorState(state)
      if (!state.hasUnsavedChanges) {
        setDesignError(null)
      }
    },
    []
  )

  const handleAutoConfigure = useCallback(
    (suggestion: AutoConfigureSuggestion) => {
      if (!suggestion) {
        return
      }

      skipDefaultDimensionsRef.current = true
      setShape(suggestion.shape)
      setDimensions(suggestion.dimensions)
      setOrientation(suggestion.orientation ?? deriveOrientation(suggestion.shape, suggestion.dimensions))
    },
    [setShape, setDimensions]
  )

  const handleDimensionsChange = useCallback(
    (nextDimensions: Dimensions) => {
      if (supportsOrientation(shape, nextDimensions)) {
        setDimensions(applyOrientationToDimensions(nextDimensions, orientation))
        setOrientation(orientation)
      } else {
        setDimensions(nextDimensions)
        setOrientation(deriveOrientation(shape, nextDimensions))
      }
    },
    [shape, orientation]
  )

  const handleOrientationChange = useCallback(
    (nextOrientation: Orientation) => {
      if (!supportsOrientation(shape, dimensions)) {
        return
      }
      setOrientation(nextOrientation)
      setDimensions((prev) => applyOrientationToDimensions(prev, nextOrientation))
      skipDefaultDimensionsRef.current = true
    },
    [shape, dimensions]
  )

  const handleOrientationToggle = useCallback(() => {
    if (!canAdjustOrientation) {
      return
    }
    const nextOrientation: Orientation = orientation === "portrait" ? "landscape" : "portrait"
    handleOrientationChange(nextOrientation)
  }, [canAdjustOrientation, orientation, handleOrientationChange])

  const handleSaveDesign = async () => {
    if (imageDropZoneRef.current) {
      await imageDropZoneRef.current.saveDesign()
    }
  }

  const handleButtonClick = async () => {
    if (!designLockedIn) {
      const message = designReady
        ? "Save your latest edits before adding to cart."
        : "Please save your design before adding to cart."
      setDesignError(message)
      return
    }

    await handleAddToCart()
  }

  const handleAddToCart = async () => {
    if (!selectedVariant?.id || !designDraft) {
      setDesignError("Please complete your design before adding to the cart.")
      return null
    }

    setIsAdding(true)
    setDesignError(null)

    try {
      let pricingForCart = lastPricing
      if (!pricingForCart) {
        pricingForCart = await calculatePricing(quantity, shape, dimensions, selectedVariant.id, material)
        if (!pricingForCart) {
          setDesignError("Pricing is still being calculated. Please try again in a moment.")
          setIsAdding(false)
          return null
        }
      }

      const uploads = await uploadDesignAssets(designDraft)

      await addStickerToCart({
        variantId: selectedVariant.id,
        quantity,
        countryCode,
        metadata: {
          file_key: uploads.edited.fileKey,
          design_url: uploads.edited.publicUrl,
          original_file_key: uploads.original.fileKey,
          original_design_url: uploads.original.publicUrl,
          design_storage_id: designDraft.id,
          shape,
          dimensions,
          material,
          format,
          peeling,
          orientation,
          transformations: designDraft.lastTransformations ?? designDraft.transformations,
          pricing: {
            unitPrice: pricingForCart.unitPrice,
            totalPrice: pricingForCart.totalPrice,
            basePrice: pricingForCart.basePrice,
            scalingFactor: pricingForCart.scalingFactor,
            area: pricingForCart.area,
          },
        },
      })
    } catch (error) {
      console.error("Error adding to cart:", error)
      setDesignError(
        error instanceof Error ? error.message : "Failed to add sticker to cart. Please try again."
      )
    } finally {
      setIsAdding(false)
    }
  }

  const handleMobileStepChange = (step: Step) => {
    setActiveStep(step)
  }

  return (
    <div
      className="lg:relative lg:w-full lg:bg-ui-bg-base lg:h-auto lg:overflow-visible lg:min-h-0 fixed inset-0 z-[40] bg-[#14161b] overflow-hidden pt-[var(--header-height,64px)] lg:pt-0"
      ref={actionsRef}
    >
      <div className="flex flex-col h-full lg:min-h-screen lg:h-[calc(100vh-4rem)] lg:flex-row">
        
        {/* Canvas Section */}
        {/* Mobile: Flex-1 to take available space, sticky top behavior is implicit in flex col */}
        <div
          className="relative flex-1 w-full lg:min-h-[calc(100vh-4rem)] lg:h-full lg:w-2/3 lg:border-r lg:border-ui-border-subtle lg:overflow-y-auto transition-all duration-300"
          style={{
            backgroundColor: "#14161b",
            backgroundImage: backgroundPattern ? `url("${backgroundPattern}")` : "none",
            backgroundSize: backgroundPattern ? "720px 720px" : undefined,
            backgroundRepeat: backgroundPattern ? "repeat" : undefined,
            backgroundPosition: backgroundPattern ? "center" : undefined,
          }}
        >
          <div className="absolute inset-0 flex flex-col sm:p-6 sm:pb-20 lg:static lg:h-full lg:p-8 lg:pb-12 justify-center">
            <div className="flex-1 min-h-0 flex flex-col justify-center lg:h-full lg:w-full">
              <ImageDropZone
                ref={imageDropZoneRef}
                shape={shape}
                dimensions={dimensions}
                onDesignChange={handleDesignChange}
                onEditStateChange={handleEditorStateChange}
                disabled={!!disabled || isAdding}
                compact={false}
                onAutoConfigure={handleAutoConfigure}
                orientation={orientation}
                onOrientationChange={supportsOrientation(shape, dimensions) ? handleOrientationChange : undefined}
              />
            </div>
          </div>
        </div>

        {/* Mobile Controls Area - Fixed Height Bottom Sheet */}
        <div className="flex flex-col bg-[#09090b] border-t border-white/10 lg:hidden z-50 pb-[env(safe-area-inset-bottom)] shrink-0">
          {/* Tab Bar */}
          <div className="flex items-center w-full border-b border-white/5 overflow-x-auto no-scrollbar">
            {STEPS.map((step) => {
              const Icon = step.icon
              const isActive = activeStep === step.id
              
              return (
                <button
                  key={step.id}
                  onClick={() => setActiveStep(step.id)}
                  className={clsx(
                    "flex-1 flex flex-col items-center justify-center gap-1 py-3 relative min-w-[70px]",
                    isActive ? "text-white" : "text-zinc-500"
                  )}
                >
                  <Icon className={clsx("w-5 h-5", isActive ? "text-white" : "text-current")} />
                  <span className="text-[10px] font-medium capitalize truncate w-full px-1 text-center">{step.label}</span>
                  {isActive && (
                    <div className="absolute bottom-0 w-full h-0.5 bg-white/20">
                      <div className="mx-auto w-8 h-full bg-white rounded-full" />
                    </div>
                  )}
                </button>
              )
            })}
          </div>

          {/* Active Step Content */}
          <div className="relative bg-zinc-950/50 min-h-[110px] flex flex-col justify-center transition-[height] duration-200 ease-in-out">
            <div className="w-full px-4">
               {activeStep === 'shape' && (
                 <ShapeSelector selectedShape={shape} onShapeChange={setShape} layout="horizontal" />
               )}
               {activeStep === 'material' && (
                 <MaterialSelector selectedMaterial={material} onMaterialChange={setMaterial} layout="horizontal" />
               )}
               {activeStep === 'size' && (
                 <SizeInput shape={shape} dimensions={dimensions} onSizeChange={handleDimensionsChange} layout="horizontal" />
               )}
               {activeStep === 'quantity' && (
                 <QuantitySelector quantity={quantity} onQuantityChange={setQuantity} layout="horizontal" />
               )}
               {activeStep === 'format' && (
                 <FormatSelector selectedFormat={format} onFormatChange={setFormat} layout="horizontal" />
               )}
               {activeStep === 'peeling' && (
                 <PeelingSelector selectedPeeling={peeling} onPeelingChange={setPeeling} layout="horizontal" />
               )}
            </div>
          </div>

          {/* Mobile Action Bar */}
          <div className="p-3 border-t border-white/10 bg-[#09090b] flex flex-col gap-2">
            {designError && (
              <div className="text-[11px] font-medium text-red-400 px-2 leading-tight text-center">
                {designError}
              </div>
            )}
            <div className="flex justify-center items-center gap-3">
              <SaveDesignButton />
              <AddToCartButton />
            </div>
          </div>
        </div>

        {/* Desktop Controls (Sidebar) - Hidden on Mobile */}
        <div className="hidden lg:flex w-full flex-col border-t border-ui-border-subtle bg-ui-bg-base lg:sticky lg:top-0 lg:h-full lg:w-1/3 lg:border-l lg:border-t-0 lg:border-ui-border-subtle lg:bg-transparent z-20 relative">
          <div className="flex-1 overflow-y-auto p-4 pt-6 pb-32 sm:p-6 sm:pt-8 sm:pb-48 lg:p-8 lg:pb-12">
            <div className="space-y-8">
              <section id="shape" className="space-y-4 scroll-mt-24 block">
                <h3 className="text-xs font-bold uppercase tracking-wider text-ui-fg-muted">Shape</h3>
                <ShapeSelector selectedShape={shape} onShapeChange={setShape} />
              </section>

              <section id="material" className="space-y-4 scroll-mt-24 block">
                <h3 className="text-xs font-bold uppercase tracking-wider text-ui-fg-muted">Material / effects</h3>
                <MaterialSelector selectedMaterial={material} onMaterialChange={setMaterial} />
              </section>

              <section id="size" className="space-y-4 scroll-mt-24 block">
                <h3 className="text-xs font-bold uppercase tracking-wider text-ui-fg-muted">Size</h3>
                <SizeInput shape={shape} dimensions={dimensions} onSizeChange={handleDimensionsChange} />
              </section>

              <section id="quantity" className="space-y-4 scroll-mt-24 block">
                <h3 className="text-xs font-bold uppercase tracking-wider text-ui-fg-muted">Quantity</h3>
                <QuantitySelector quantity={quantity} onQuantityChange={setQuantity} />
              </section>

              <section id="format" className="space-y-4 scroll-mt-24 block">
                <h3 className="text-xs font-bold uppercase tracking-wider text-ui-fg-muted">Format</h3>
                <FormatSelector selectedFormat={format} onFormatChange={setFormat} />
              </section>

              <section id="peeling" className="space-y-4 scroll-mt-24 block">
                <h3 className="text-xs font-bold uppercase tracking-wider text-ui-fg-muted">Peeling option</h3>
                <PeelingSelector selectedPeeling={peeling} onPeelingChange={setPeeling} />
              </section>
            </div>
          </div>

          {/* Footer Desktop */}
          <div className="lg:sticky lg:bottom-0 lg:left-0 lg:right-0 lg:border-0 lg:bg-transparent lg:p-0">
            <div className="fixed bottom-0 left-0 right-0 z-50 px-3 pb-4 pt-3 border-t border-white/10 bg-black/80 backdrop-blur-xl sm:sticky sm:bottom-0 sm:left-0 sm:right-0 sm:z-40 sm:border-0 sm:bg-transparent sm:px-4 sm:py-4 sm:shadow-none lg:static lg:z-auto lg:px-0 lg:py-4 lg:shadow-none">
              <div className="flex w-full flex-col items-center gap-2">
                <div className="flex w-full items-center justify-center gap-3">
                  <SaveDesignButton />
                  <AddToCartButton />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
