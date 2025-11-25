"use client"

import { Button } from "@medusajs/ui"
import clsx from "clsx"
import { Popover, Transition } from "@headlessui/react"
import { useParams } from "next/navigation"
import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react"
import { CheckCircle2 } from "lucide-react"

import { addStickerToCart } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import { Shape } from "../calculator/shape-selector"
import { useShapeStickerPricing } from "@lib/hooks/use-shape-sticker-pricing"
import { DesignDraftState, createFileFromStoredAsset, getDesignFilesFromState } from "../calculator/utils/design-storage"
import { Dimensions, Material, Format, Peeling } from "../calculator/types"
import MobileControlRail from "../calculator/mobile-control-rail"
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

  const formattedShape = useMemo(() => {
    return shape.charAt(0).toUpperCase() + shape.slice(1)
  }, [shape])

  const formattedSize = useMemo(() => {
    if (dimensions.diameter) {
      return `${dimensions.diameter} cm`
    }
    if (dimensions.width && dimensions.height) {
      return `${dimensions.width} × ${dimensions.height} cm`
    }
    return null
  }, [dimensions.diameter, dimensions.width, dimensions.height])

  const formattedOrientation = useMemo(() => {
    if (!orientation) return null
    return orientation.charAt(0).toUpperCase() + orientation.slice(1)
  }, [orientation])

  const isSavingDesign = imageDropZoneRef.current?.isSavingDesign

  // Standard CTA disabled state (logic for desktop and base constraints)
  // Note: For mobile, we might allow clicking even if !designReady to show a toast
  const isCtaDisabled = useMemo(() => {
    if (!selectedVariant || !inStock || !!disabled || isAdding || isSavingDesign) {
      return true
    }
    return false
  }, [selectedVariant, inStock, disabled, isAdding, isSavingDesign])

  // Mobile click disabled state: same as above, but we DON'T disable for !designReady
  // so we can capture the click and show a message
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
      return `Add to cart • $${lastPricing.totalPrice.toFixed(2)}`
    }
    return primaryCtaLabel
  }, [lastPricing, primaryCtaLabel])

  const desktopInlineStatus = useMemo(() => {
    if (designError) {
      return { text: designError, className: "text-ui-fg-error" }
    }
    if (!designReady) {
      return { text: "Save your design first", className: "text-amber-200" }
    }
    if (editorState.hasUnsavedChanges) {
      return { text: "Save edits to unlock", className: "text-amber-200" }
    }
    return null
  }, [designError, designReady, editorState.hasUnsavedChanges])

  const desktopCtaClasses = useMemo(
    () =>
      clsx(
        "h-12 px-6 min-w-[240px] max-w-[320px] w-auto flex-shrink-0 self-center rounded-rounded text-sm font-semibold sm:h-14 sm:text-base transition-colors",
        isCtaDisabled
          ? "bg-neutral-800 text-neutral-500 border border-neutral-700"
          : "bg-emerald-500 text-white hover:bg-emerald-400 border border-emerald-500 shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400"
      ),
    [isCtaDisabled]
  )

  const mobileCtaClasses = useMemo(
    () =>
      clsx(
        "h-14 flex-1 text-base font-semibold transition-all rounded-2xl active:scale-98",
        !isMobileCtaDisabled
          ? designLockedIn
            ? "!bg-emerald-500 hover:!bg-emerald-400 focus-visible:!ring-emerald-500 text-white shadow-lg"
            : "!bg-emerald-500/40 text-white/70 shadow-none ring-1 ring-emerald-400/40" // Dimmed state
          : ""
      ),
    [designLockedIn, isMobileCtaDisabled]
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

  return (
    <div
      className="relative w-full bg-ui-bg-base pb-24 sm:pb-28 lg:pb-0 lg:min-h-[calc(100vh-4rem)] lg:max-h-[calc(100vh-4rem)] lg:overflow-hidden"
      ref={actionsRef}
    >
      <div className="flex min-h-screen flex-col lg:h-[calc(100vh-4rem)] lg:flex-row">
        <div
          className="relative flex flex-1 min-h-[60vh] lg:min-h-[calc(100vh-4rem)] lg:h-full lg:w-2/3 lg:border-r lg:border-ui-border-subtle lg:overflow-y-auto"
          style={{
            backgroundColor: "#14161b",
            backgroundImage: backgroundPattern ? `url("${backgroundPattern}")` : "none",
            backgroundSize: backgroundPattern ? "720px 720px" : undefined,
            backgroundRepeat: backgroundPattern ? "repeat" : undefined,
            backgroundPosition: backgroundPattern ? "center" : undefined,
          }}
        >
          <div className="relative flex h-full w-full flex-col p-4 pb-12 sm:p-6 sm:pb-20 lg:min-h-0 lg:p-8 lg:pb-12">
            <div className="flex-1">
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

        <div className="flex w-full flex-col border-t border-ui-border-subtle bg-ui-bg-base lg:sticky lg:top-0 lg:h-full lg:w-1/3 lg:border-l lg:border-t-0 lg:border-ui-border-subtle lg:bg-transparent">
          <div className="flex-1 overflow-y-auto p-4 pt-4 pb-36 sm:p-6 sm:pt-8 sm:pb-48 lg:p-8 lg:pb-12">
            <div className="space-y-8">
              <section id="shape" className="hidden space-y-4 scroll-mt-24 sm:block">
                <h3 className="text-sm font-medium text-ui-fg-muted">Shape</h3>
                <ShapeSelector selectedShape={shape} onShapeChange={setShape} />
              </section>

              <section id="material" className="hidden space-y-4 scroll-mt-24 sm:block">
                <h3 className="text-sm font-medium text-ui-fg-muted">Material / effects</h3>
                <MaterialSelector selectedMaterial={material} onMaterialChange={setMaterial} />
              </section>

              <section id="size" className="hidden space-y-4 scroll-mt-24 sm:block">
                <h3 className="text-sm font-medium text-ui-fg-muted">Size</h3>
                <SizeInput shape={shape} dimensions={dimensions} onSizeChange={handleDimensionsChange} />
              </section>

              <section id="quantity" className="hidden space-y-4 scroll-mt-24 sm:block">
                <h3 className="text-sm font-medium text-ui-fg-muted">Quantity</h3>
                <QuantitySelector quantity={quantity} onQuantityChange={setQuantity} />
              </section>

              <section id="format" className="hidden space-y-4 scroll-mt-24 sm:block">
                <h3 className="text-sm font-medium text-ui-fg-muted">Format</h3>
                <FormatSelector selectedFormat={format} onFormatChange={setFormat} />
              </section>

              <section id="peeling" className="hidden space-y-4 scroll-mt-24 sm:block">
                <h3 className="text-sm font-medium text-ui-fg-muted">Peeling option</h3>
                <PeelingSelector selectedPeeling={peeling} onPeelingChange={setPeeling} />
              </section>
            </div>
          </div>

          <div className="lg:sticky lg:bottom-0 lg:left-0 lg:right-0 lg:border-0 lg:bg-transparent lg:p-0">
            <div className="fixed bottom-0 left-0 right-0 z-50 px-3 pb-4 pt-3 sm:sticky sm:bottom-0 sm:left-0 sm:right-0 sm:z-40 sm:border-0 sm:bg-transparent sm:px-4 sm:py-4 sm:shadow-none lg:static lg:z-auto lg:px-0 lg:py-4 lg:shadow-none">
              {/* Desktop layout */}
              <div className="hidden w-full flex-col items-center gap-2 sm:flex">
                <Button
                  onClick={handleButtonClick}
                  disabled={isCtaDisabled}
                  variant="primary"
                  className={desktopCtaClasses}
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
              </div>

              {/* Mobile compact summary */}
              <div className="relative flex flex-col gap-3 sm:hidden">
                <div className="rounded-3xl px-4">
                  <MobileControlRail
                    shape={shape}
                    dimensions={dimensions}
                    quantity={quantity}
                    material={material}
                    format={format}
                    peeling={peeling}
                    onShapeChange={setShape}
                    onSizeChange={handleDimensionsChange}
                    onQuantityChange={setQuantity}
                    onMaterialChange={setMaterial}
                    onFormatChange={setFormat}
                    onPeelingChange={setPeeling}
                    orientation={orientation}
                    onOrientationToggle={canAdjustOrientation ? handleOrientationToggle : undefined}
                    canAdjustOrientation={canAdjustOrientation}
                  />
                  <div className="mt-3 flex flex-col gap-2">
                    <div className="flex items-center">
                    <Button
                      onClick={handleButtonClick}
                      disabled={isMobileCtaDisabled}
                      variant="primary"
                      className={mobileCtaClasses}
                      isLoading={isAdding || isSavingDesign}
                      data-testid="mobile-add-product-button"
                    >
                      {mobileCtaLabel}
                    </Button>
                    </div>
                  </div>
                  {!designLockedIn && (
                    <p className="text-center text-[11px] font-medium text-amber-200">
                      Save your design inside the canvas to enable checkout.
                    </p>
                  )}
                  {!designDraft?.original && (
                    <p className="text-center text-[11px] font-medium text-indigo-200">
                      Upload artwork above to activate all controls.
                    </p>
                  )}
                </div>
                {designError && (
                  <div className="flex items-center gap-1.5 text-xs text-ui-fg-error">
                    <div className="h-1 w-1 flex-shrink-0 rounded-full bg-ui-fg-error"></div>
                    <span className="line-clamp-1">{designError}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="h-[130px] sm:hidden" aria-hidden="true" />
      </div>
    </div>
  )
}
