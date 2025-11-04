"use client"

import { Button } from "@medusajs/ui"
import { Popover, Transition } from "@headlessui/react"
import { useParams } from "next/navigation"
import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react"
import { CheckCircle2 } from "lucide-react"

import { addStickerToCart } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import { Shape } from "../calculator/shape-selector"
import { useShapeStickerPricing } from "@lib/hooks/use-shape-sticker-pricing"
import { DesignDraftState, createFileFromStoredAsset } from "../calculator/utils/design-storage"
import { Dimensions } from "../calculator/types"
import { getPresignedUploadUrl, uploadFileToPresignedUrl } from "@lib/data/uploads"
import ImageDropZone, {
  ImageDropZoneHandle,
  type AutoConfigureSuggestion,
} from "../calculator/image-drop-zone"
import ShapeSelector from "../calculator/shape-selector"
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
  const [dimensions, setDimensions] = useState<Dimensions>(defaultDimensions.rectangle)
  const [orientation, setOrientation] = useState<Orientation>(
    deriveOrientation("rectangle", defaultDimensions.rectangle)
  )
  const [quantity, setQuantity] = useState(500)
  const [designDraft, setDesignDraft] = useState<DesignDraftState | null>(null)
  const [designError, setDesignError] = useState<string | null>(null)
  const countryCode = useParams().countryCode as string
  void _region

  const imageDropZoneRef = useRef<ImageDropZoneHandle>(null)
  const { calculatePricing, lastPricing, isLoading: pricingLoading } = useShapeStickerPricing()
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

    calculatePricing(quantity, shape, dimensions, selectedVariant.id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedVariant?.id, quantity, shape, dimensions])

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

  const actionsRef = useRef<HTMLDivElement>(null)

  const regularPrice = useMemo(() => {
    if (!lastPricing) {
      return null
    }

    const raw = lastPricing.basePrice * lastPricing.scalingFactor
    return Math.round(raw * 100) / 100
  }, [lastPricing])

  const savings = useMemo(() => {
    if (!lastPricing || !regularPrice) {
      return 0
    }

    const diff = regularPrice - lastPricing.totalPrice
    return diff > 0 ? Math.round(diff * 100) / 100 : 0
  }, [lastPricing, regularPrice])

  const discountPercent = useMemo(() => {
    if (!regularPrice || savings <= 0) {
      return 0
    }

    return Math.round((savings / regularPrice) * 100)
  }, [regularPrice, savings])

  const perStickerPrice = useMemo(() => {
    if (!lastPricing || quantity <= 0) {
      return null
    }

    return lastPricing.totalPrice / quantity
  }, [lastPricing, quantity])

  const regularPerSticker = useMemo(() => {
    if (!regularPrice || quantity <= 0) {
      return null
    }

    return regularPrice / quantity
  }, [regularPrice, quantity])

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

    const originalFile = createFileFromStoredAsset(
      draft.original,
      draft.original.name || "design-original"
    )
    const editedFile = createFileFromStoredAsset(
      draft.edited,
      draft.edited.name || "design-edited"
    )

    const original = await uploadSingle(originalFile)
    const edited = await uploadSingle(editedFile)

    return { original, edited }
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

  const handleButtonClick = async () => {
    if (!designReady) {
      await imageDropZoneRef.current?.saveDesign()
      return
    }

    await handleAddToCart()
  }

  const handleAddToCart = async () => {
    if (!selectedVariant?.id || !lastPricing || !designDraft) {
      setDesignError("Please complete your design before adding to the cart.")
      return null
    }

    setIsAdding(true)
    setDesignError(null)

    try {
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
          transformations: designDraft.lastTransformations ?? designDraft.transformations,
          pricing: {
            unitPrice: lastPricing.unitPrice,
            totalPrice: lastPricing.totalPrice,
            basePrice: lastPricing.basePrice,
            scalingFactor: lastPricing.scalingFactor,
            area: lastPricing.area,
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
          <div className="relative flex h-full w-full flex-col p-4 pb-24 sm:p-6 sm:pb-28 lg:min-h-0 lg:p-8 lg:pb-12">
            <div className="flex-1">
              <ImageDropZone
                ref={imageDropZoneRef}
                shape={shape}
                dimensions={dimensions}
                onDesignChange={handleDesignChange}
                disabled={!!disabled || isAdding}
                compact={false}
                onAutoConfigure={handleAutoConfigure}
                orientation={orientation}
                onOrientationChange={supportsOrientation(shape, dimensions) ? handleOrientationChange : undefined}
              />
            </div>
          </div>
        </div>

        <div className="flex w-full flex-col border-t border-ui-border-subtle bg-ui-bg-base lg:sticky lg:top-0 lg:h-full lg:w-1/3 lg:border-l lg:border-t-0 lg:border-ui-border-subtle">
          <div className="flex-1 overflow-y-auto p-4 pb-24 sm:p-6 sm:pb-28 lg:p-8">
            <div className="space-y-10">
              <section id="shape" className="space-y-4 scroll-mt-24">
                <h3 className="text-sm font-medium text-ui-fg-muted">Shape</h3>
                <ShapeSelector selectedShape={shape} onShapeChange={setShape} />
              </section>

              <section id="size" className="space-y-4 scroll-mt-24">
                <h3 className="text-sm font-medium text-ui-fg-muted">Size</h3>
                <SizeInput shape={shape} dimensions={dimensions} onSizeChange={handleDimensionsChange} />
              </section>

              <section id="quantity" className="space-y-4 scroll-mt-24">
                <h3 className="text-sm font-medium text-ui-fg-muted">Quantity</h3>
                <QuantitySelector onQuantityChange={setQuantity} />
              </section>
            </div>
          </div>

          <div className="lg:sticky lg:bottom-0 lg:left-0 lg:right-0 lg:border-t lg:border-ui-border-subtle lg:bg-ui-bg-base lg:p-0">
            <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-ui-border-subtle bg-ui-bg-base px-4 py-3 shadow-md sm:py-4 lg:static lg:z-auto lg:px-0 lg:shadow-none">
              <div className="flex w-full flex-col gap-3 sm:gap-4">
                <div className="flex flex-col gap-4 rounded-rounded border border-ui-border-subtle bg-ui-bg-subtle px-5 py-4 shadow-sm sm:flex-row sm:items-start sm:justify-between sm:gap-6 sm:px-6 sm:py-5">
                  <div className="flex flex-col gap-2">
                    <span className="text-[11px] uppercase tracking-wide text-ui-fg-muted">
                      {designReady ? "Total" : "Starting from"}
                    </span>
                    {designReady && lastPricing ? (
                      <Popover className="relative">
                        <Popover.Button className="flex items-center gap-2 rounded-rounded border border-ui-border-subtle bg-ui-bg-base px-3 py-1 text-[11px] font-medium text-ui-fg-muted transition hover:border-ui-border-strong hover:text-ui-fg-base focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ui-border-strong">
                          View breakdown
                        </Popover.Button>
                        <Transition
                          as={Fragment}
                          enter="transition ease-out duration-100"
                          enterFrom="opacity-0 translate-y-1"
                          enterTo="opacity-100 translate-y-0"
                          leave="transition ease-in duration-75"
                          leaveFrom="opacity-100 translate-y-0"
                          leaveTo="opacity-0 translate-y-1"
                        >
                          <Popover.Panel className="absolute left-0 z-50 mt-2 w-64 rounded-rounded border border-ui-border-subtle bg-ui-bg-base p-4 text-xs shadow-lg sm:left-auto sm:right-0">
                            {pricingLoading ? (
                              <div className="space-y-2">
                                <div className="h-3 w-20 animate-pulse rounded bg-ui-bg-subtle" />
                                <div className="h-3 w-24 animate-pulse rounded bg-ui-bg-subtle" />
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <span>Setup cost</span>
                                  <span className="font-medium text-ui-fg-base">${lastPricing?.basePrice.toFixed(2)}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span>Production area</span>
                                  <span className="font-medium text-ui-fg-base">{lastPricing?.area.toFixed(2)} cm²</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span>Quantity</span>
                                  <span className="font-medium text-ui-fg-base">{quantity.toLocaleString()}</span>
                                </div>
                                {perStickerPrice && (
                                  <div className="flex items-center justify-between">
                                    <span>Per sticker</span>
                                    <span className="font-medium text-ui-fg-base">${perStickerPrice.toFixed(3)}</span>
                                  </div>
                                )}
                                <div className="rounded-rounded border border-ui-border-subtle bg-ui-bg-subtle px-3 py-2 text-[11px] text-ui-fg-muted">
                                  Pricing combines setup, material usage, and quantity efficiencies. Discounts apply when we can batch production.
                                </div>
                              </div>
                            )}
                          </Popover.Panel>
                        </Transition>
                      </Popover>
                    ) : (
                      <span className="rounded-rounded bg-ui-bg-base/70 px-3 py-2 text-xs text-ui-fg-muted">
                        Drop or upload your design to unlock the full price breakdown.
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {designReady && lastPricing && regularPrice && savings > 0 && discountPercent >= 5 && (
                      <span className="text-sm font-medium text-ui-fg-muted line-through">
                        ${regularPrice.toFixed(2)}
                      </span>
                    )}
                    <span className="text-2xl font-semibold text-ui-fg-base">
                      {lastPricing ? `$${lastPricing.totalPrice.toFixed(2)}` : "$99.00"}
                    </span>
                    {designReady && lastPricing && savings > 0 && discountPercent >= 5 && (
                      <span className="rounded-rounded border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-200">
                        Save ${savings.toFixed(2)}{discountPercent > 0 ? ` (${discountPercent}%)` : ""}
                      </span>
                    )}
                  </div>
                </div>

                {designError && (
                  <div className="flex items-center gap-1.5 text-xs text-ui-fg-error sm:text-sm">
                    <div className="h-1 w-1 flex-shrink-0 rounded-full bg-ui-fg-error"></div>
                    <span className="line-clamp-1">{designError}</span>
                  </div>
                )}

                <Button
                  onClick={handleButtonClick}
                  disabled={
                    !inStock ||
                    !selectedVariant ||
                    !!disabled ||
                    isAdding ||
                    pricingLoading ||
                    !lastPricing ||
                    imageDropZoneRef.current?.isSavingDesign
                  }
                  variant="primary"
                  className="h-12 w-full flex-shrink-0 text-sm font-semibold sm:h-14 sm:text-base"
                  isLoading={isAdding || imageDropZoneRef.current?.isSavingDesign}
                  data-testid="add-product-button"
                >
                  {!selectedVariant
                    ? "Select variant"
                    : !inStock
                    ? "Out of stock"
                    : imageDropZoneRef.current?.isSavingDesign
                    ? "Saving design..."
                    : !designReady
                    ? "Save your design"
                    : lastPricing
                    ? "Add to cart"
                    : "Configure stickers"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
