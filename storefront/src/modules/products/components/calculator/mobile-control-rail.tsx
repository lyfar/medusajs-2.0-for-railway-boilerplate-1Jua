"use client"

import clsx from "clsx"
import { useCallback, useEffect, useMemo, useState } from "react"
import { Monitor, Package, Ruler, Shapes, Smartphone } from "lucide-react"

import { Shape, shapes } from "./shape-selector"
import { Dimensions } from "./types"
import { Orientation } from "./orientation"
import { SIZE_PRESETS, SizePresetKey } from "./size-presets"

type MobileControlKey = "shape" | "size" | "quantity" | null

interface MobileControlRailProps {
  shape: Shape
  dimensions: Dimensions
  quantity: number
  onShapeChange: (shape: Shape) => void
  onSizeChange: (dimensions: Dimensions) => void
  onQuantityChange: (quantity: number) => void
  orientation?: Orientation
  onOrientationToggle?: () => void
  canAdjustOrientation?: boolean
}

const shapeLabelMap = shapes.reduce<Record<Shape, string>>((acc, option) => {
  acc[option.value] = option.label
  return acc
}, {} as Record<Shape, string>)

const summaryButtonClass = (
  isActive: boolean,
  accent: "emerald" | "indigo" | "amber"
) =>
  clsx(
    "flex h-12 min-w-[120px] items-center gap-2 rounded-2xl border px-3 text-left text-[11px] transition-all duration-200 backdrop-blur-sm",
    accent === "emerald" &&
      (isActive
        ? "border-emerald-400/70 bg-emerald-500/20 text-white shadow-[0_0_15px_rgba(16,185,129,0.25)]"
        : "border-white/10 bg-white/5 text-white/80"),
    accent === "indigo" &&
      (isActive
        ? "border-indigo-400/70 bg-indigo-500/20 text-white shadow-[0_0_15px_rgba(99,102,241,0.25)]"
        : "border-white/10 bg-white/5 text-white/80"),
    accent === "amber" &&
      (isActive
        ? "border-amber-300/70 bg-amber-400/20 text-white shadow-[0_0_15px_rgba(251,191,36,0.2)]"
        : "border-white/10 bg-white/5 text-white/80")
  )

export default function MobileControlRail({
  shape,
  dimensions,
  quantity,
  onShapeChange,
  onSizeChange,
  onQuantityChange,
  orientation,
  onOrientationToggle,
  canAdjustOrientation,
}: MobileControlRailProps) {
  const [activeControl, setActiveControl] = useState<MobileControlKey | null>(null)
  const [customSizeDraft, setCustomSizeDraft] = useState<Dimensions>(dimensions)
  const [customQuantityDraft, setCustomQuantityDraft] = useState(quantity.toString())

  const sizeSummary = useMemo(() => {
    if (shape === "circle" && dimensions.diameter) {
      return `Ø ${dimensions.diameter} cm`
    }
    if (dimensions.width && dimensions.height) {
      return `${dimensions.width} × ${dimensions.height} cm`
    }
    return "Set size"
  }, [shape, dimensions])

  const orientationSummary = canAdjustOrientation
    ? orientation === "landscape"
      ? "Landscape"
      : "Portrait"
    : "Auto-fit"

  const orientationIcon =
    orientation === "landscape" ? <Monitor className="h-4 w-4" /> : <Smartphone className="h-4 w-4" />

  const sizePresetKeys = useMemo(
    () => (Object.keys(SIZE_PRESETS[shape]).filter((key) => key !== "Custom") as SizePresetKey[]),
    [shape]
  )

  const isPresetSelected = useCallback(
    (presetKey: SizePresetKey) => {
      const preset = SIZE_PRESETS[shape][presetKey]
      if (shape === "circle") {
        return preset.diameter && dimensions.diameter === preset.diameter
      }
      const matchDirect =
        preset.width === dimensions.width && preset.height === dimensions.height
      const matchSwapped =
        preset.width === dimensions.height && preset.height === dimensions.width
      return matchDirect || matchSwapped
    },
    [dimensions.height, dimensions.width, dimensions.diameter, shape]
  )

  useEffect(() => {
    setCustomSizeDraft(dimensions)
  }, [dimensions])

  useEffect(() => {
    setCustomQuantityDraft(quantity.toString())
  }, [quantity])

  const handleCustomSizeApply = (draft: Dimensions) => {
    if (shape === "circle") {
      if (draft.diameter && draft.diameter >= 1 && draft.diameter <= 50) {
        onSizeChange({ diameter: Number(draft.diameter.toFixed(2)) })
      }
      return
    }
    if (
      draft.width &&
      draft.height &&
      draft.width >= 1 &&
      draft.height >= 1 &&
      draft.width <= 50 &&
      draft.height <= 50
    ) {
      onSizeChange({
        width: Number(draft.width.toFixed(2)),
        height: Number(draft.height.toFixed(2)),
      })
    }
  }

  const quantityOptions = [
    { value: 500, label: "Starter" },
    { value: 1000, label: "Business" },
    { value: 2000, label: "Growth" },
    { value: 5000, label: "Volume" },
  ]

  const toggleControl = (key: MobileControlKey) => {
    setActiveControl((current) => (current === key ? null : key))
  }

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto py-1 text-[11px] [-ms-overflow-style:none] [scrollbar-width:none]">
      {/* Shape */}
      <div className="flex h-12 items-center gap-1.5 snap-start">
        <button
          type="button"
          className={summaryButtonClass(activeControl === "shape", "emerald")}
          onClick={() => toggleControl("shape")}
        >
          <span
            className={clsx(
              "flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-200 transition",
              activeControl === "shape" && "bg-emerald-500/30 text-white"
            )}
          >
            <Shapes className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="text-[9px] uppercase tracking-[0.08em] text-white/50">Shape</p>
            <p className="text-[11px] font-semibold truncate">{shapeLabelMap[shape]}</p>
          </div>
        </button>
        {activeControl === "shape" && (
          <div className="flex h-full items-center gap-1 px-1.5">
            {shapes.map((option) => {
              const Icon = option.icon
              const selected = option.value === shape
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => onShapeChange(option.value)}
                  className={clsx(
                    "flex h-9 w-9 items-center justify-center rounded-full border transition",
                    selected
                      ? "border-white/70 text-white"
                      : "border-white/20 text-white/50"
                  )}
                  aria-label={shapeLabelMap[option.value]}
                >
                  <Icon className="h-4 w-4" />
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Orientation */}
      <button
        type="button"
        disabled={!canAdjustOrientation || !onOrientationToggle}
        onClick={() => {
          if (!canAdjustOrientation || !onOrientationToggle) return
          onOrientationToggle()
        }}
        className={clsx(
          summaryButtonClass(false, "emerald"),
          "snap-start h-12 min-w-[120px]",
          !canAdjustOrientation && "cursor-not-allowed opacity-50"
        )}
      >
        <span
          className={clsx(
            "flex h-8 w-8 items-center justify-center rounded-xl transition",
            canAdjustOrientation ? "bg-emerald-500/15 text-emerald-200" : "bg-white/10 text-neutral-500"
          )}
        >
          {orientationIcon}
        </span>
        <div className="min-w-0">
          <p className="text-[9px] uppercase tracking-[0.08em] text-white/50">Orientation</p>
          <p className="text-[11px] font-semibold truncate">{orientationSummary}</p>
        </div>
      </button>

      {/* Size */}
      <div className="flex h-12 items-center gap-1.5 snap-start">
        <button
          type="button"
          className={summaryButtonClass(activeControl === "size", "indigo")}
          onClick={() => toggleControl("size")}
        >
          <span
            className={clsx(
              "flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-200 transition",
              activeControl === "size" && "bg-indigo-500/30 text-white"
            )}
          >
            <Ruler className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="text-[9px] uppercase tracking-[0.08em] text-white/50">Size</p>
            <p className="text-[11px] font-semibold truncate">{sizeSummary}</p>
          </div>
        </button>
        {activeControl === "size" && (
          <div className="flex h-full items-center gap-1 px-1.5">
            <div className="flex items-center gap-1">
              {sizePresetKeys.map((presetKey) => {
                const selected = isPresetSelected(presetKey)
                const presetDims = SIZE_PRESETS[shape][presetKey]
                const label =
                  shape === "circle"
                    ? `${presetDims.diameter} cm`
                    : `${presetDims.width}×${presetDims.height} cm`
                return (
                  <button
                    key={presetKey}
                    type="button"
                    onClick={() => onSizeChange(presetDims)}
                    className={clsx(
                      "rounded-full border px-2 py-1 text-[10px] font-semibold transition min-w-[58px]",
                      selected
                        ? "border-white/70 text-white"
                        : "border-white/20 text-white/70"
                    )}
                  >
                    <span className="block text-[9px] uppercase tracking-wide text-white/60">
                      {presetKey}
                    </span>
                    <span>{label}</span>
                  </button>
                )
              })}
            </div>
            <div className="flex items-center gap-1 px-2 py-1 text-white/80">
              <span className="text-[9px] uppercase tracking-wide text-white/60">Custom</span>
              {shape === "circle" ? (
                <input
                  type="number"
                  min={1}
                  max={50}
                  step={0.5}
                  value={customSizeDraft.diameter ?? ""}
                  onChange={(event) => {
                    const value = event.target.value
                    setCustomSizeDraft((prev) => ({
                      ...prev,
                      diameter: value ? Number(value) : undefined,
                    }))
                  }}
                  onBlur={() => handleCustomSizeApply(customSizeDraft)}
                  className="w-[70px] rounded-lg border border-white/20 bg-black/40 px-2 py-1 text-[11px]"
                  placeholder="cm"
                />
              ) : (
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min={1}
                    max={50}
                    step={0.5}
                    value={customSizeDraft.width ?? ""}
                    onChange={(event) => {
                      const value = event.target.value
                      setCustomSizeDraft((prev) => ({
                        ...prev,
                        width: value ? Number(value) : undefined,
                      }))
                    }}
                    onBlur={() => handleCustomSizeApply(customSizeDraft)}
                    className="w-14 rounded-lg border border-white/20 bg-black/40 px-2 py-1 text-[11px]"
                    placeholder="W"
                  />
                  <input
                    type="number"
                    min={1}
                    max={50}
                    step={0.5}
                    value={customSizeDraft.height ?? ""}
                    onChange={(event) => {
                      const value = event.target.value
                      setCustomSizeDraft((prev) => ({
                        ...prev,
                        height: value ? Number(value) : undefined,
                      }))
                    }}
                    onBlur={() => handleCustomSizeApply(customSizeDraft)}
                    className="w-14 rounded-lg border border-white/20 bg-black/40 px-2 py-1 text-[11px]"
                    placeholder="H"
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Quantity */}
      <div className="flex h-12 items-center gap-1.5 snap-start">
        <button
          type="button"
          className={summaryButtonClass(activeControl === "quantity", "amber")}
          onClick={() => toggleControl("quantity")}
        >
          <span
            className={clsx(
              "flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/15 text-amber-200 transition",
              activeControl === "quantity" && "bg-amber-500/30 text-white"
            )}
          >
            <Package className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="text-[9px] uppercase tracking-[0.08em] text-white/50">Quantity</p>
            <p className="text-[11px] font-semibold truncate">{quantity.toLocaleString()} pcs</p>
          </div>
        </button>
        {activeControl === "quantity" && (
          <div className="flex h-full items-center gap-1 px-1.5">
            <div className="flex items-center gap-1">
              {quantityOptions.map((option) => {
                const selected = option.value === quantity
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => onQuantityChange(option.value)}
                    className={clsx(
                      "rounded-full border px-2 py-1 text-[10px] font-semibold transition min-w-[70px]",
                      selected
                        ? "border-white/70 text-white"
                        : "border-white/20 text-white/70"
                    )}
                  >
                    <span className="block text-[9px] uppercase tracking-wide text-white/60">
                      {option.label}
                    </span>
                    <span>{option.value.toLocaleString()}</span>
                  </button>
                )
              })}
            </div>
            <div className="flex items-center gap-1 px-2 py-1 text-white/80">
              <span className="text-[9px] uppercase tracking-wide text-white/60">Custom</span>
              <input
                type="number"
                min={100}
                step={50}
                value={customQuantityDraft}
                onChange={(event) => setCustomQuantityDraft(event.target.value)}
                onBlur={() => {
                  const parsed = Number(customQuantityDraft)
                  if (!Number.isFinite(parsed) || parsed < 100) {
                    setCustomQuantityDraft(quantity.toString())
                    return
                  }
                  onQuantityChange(parsed)
                }}
                className="w-[80px] rounded-lg border border-white/20 bg-black/40 px-2 py-1 text-[11px]"
                placeholder="Qty"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
