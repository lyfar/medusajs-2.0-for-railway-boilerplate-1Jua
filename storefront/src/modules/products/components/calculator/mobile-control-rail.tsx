"use client"

import clsx from "clsx"
import { useCallback, useEffect, useMemo, useState } from "react"
import { Monitor, Package, Ruler, Shapes, Smartphone, Layers, Scroll, ScanLine } from "lucide-react"

import { Shape, shapes } from "./shape-selector"
import { Material } from "./types"
import { materials } from "./material-selector"
import { Format } from "./types"
import { formats } from "./format-selector"
import { Peeling } from "./types"
import { peelingOptions } from "./peeling-selector"
import { Dimensions } from "./types"
import { Orientation } from "./orientation"
import { SIZE_PRESETS, SizePresetKey } from "./size-presets"
import { InfoPopover } from "./sections/info-popover"

type MobileControlKey = "shape" | "size" | "quantity" | "material" | "format" | "peeling" | null

interface MobileControlRailProps {
  shape: Shape
  dimensions: Dimensions
  quantity: number
  material: Material
  format: Format
  peeling: Peeling
  onShapeChange: (shape: Shape) => void
  onSizeChange: (dimensions: Dimensions) => void
  onQuantityChange: (quantity: number) => void
  onMaterialChange: (material: Material) => void
  onFormatChange: (format: Format) => void
  onPeelingChange: (peeling: Peeling) => void
  orientation?: Orientation
  onOrientationToggle?: () => void
  canAdjustOrientation?: boolean
}

const shapeLabelMap = shapes.reduce<Record<Shape, string>>((acc, option) => {
  acc[option.value] = option.label
  return acc
}, {} as Record<Shape, string>)

const materialLabelMap = materials.reduce<Record<Material, string>>((acc, option) => {
  acc[option.value] = option.label
  return acc
}, {} as Record<Material, string>)

const formatLabelMap = formats.reduce<Record<Format, string>>((acc, option) => {
  acc[option.value] = option.label
  return acc
}, {} as Record<Format, string>)

const peelingLabelMap = peelingOptions.reduce<Record<Peeling, string>>((acc, option) => {
  acc[option.value] = option.label
  return acc
}, {} as Record<Peeling, string>)

const summaryButtonClass = (
  isActive: boolean,
  accent: "emerald" | "indigo" | "amber" | "purple" | "cyan" | "rose"
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
        : "border-white/10 bg-white/5 text-white/80"),
    accent === "purple" &&
      (isActive
        ? "border-purple-400/70 bg-purple-500/20 text-white shadow-[0_0_15px_rgba(168,85,247,0.25)]"
        : "border-white/10 bg-white/5 text-white/80"),
    accent === "cyan" &&
      (isActive
        ? "border-cyan-400/70 bg-cyan-500/20 text-white shadow-[0_0_15px_rgba(34,211,238,0.25)]"
        : "border-white/10 bg-white/5 text-white/80"),
    accent === "rose" &&
      (isActive
        ? "border-rose-400/70 bg-rose-500/20 text-white shadow-[0_0_15px_rgba(244,63,94,0.25)]"
        : "border-white/10 bg-white/5 text-white/80")
  )

export default function MobileControlRail({
  shape,
  dimensions,
  quantity,
  material,
  format,
  peeling,
  onShapeChange,
  onSizeChange,
  onQuantityChange,
  onMaterialChange,
  onFormatChange,
  onPeelingChange,
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
    { value: 1000, label: "Expand" },
    { value: 2000, label: "Growth" },
    { value: 5000, label: "Volume" },
  ]

  const toggleControl = (key: MobileControlKey) => {
    setActiveControl((current) => (current === key ? null : key))
  }

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto overflow-y-visible py-1 text-[11px] [-ms-overflow-style:none] [scrollbar-width:none]">
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
            <p className="text-[11px] font-semibold truncate text-white">{shapeLabelMap[shape]}</p>
          </div>
        </button>
        <div className="hidden h-full items-center sm:flex">
          <InfoPopover
            title="Shapes explained"
            description="Pick circle/square for classics, rectangle for labels, or diecut to follow your artwork outline."
            variant="dark"
            size="sm"
          />
        </div>
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

      {/* Material */}
      <div className="flex h-12 items-center gap-1.5 snap-start">
        <button
          type="button"
          className={summaryButtonClass(activeControl === "material", "purple")}
          onClick={() => toggleControl("material")}
        >
          <span
            className={clsx(
              "flex h-8 w-8 items-center justify-center rounded-xl bg-purple-500/15 text-purple-200 transition",
              activeControl === "material" && "bg-purple-500/30 text-white"
            )}
          >
            <Layers className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="text-[9px] uppercase tracking-[0.08em] text-white/50">Material</p>
            <p className="text-[11px] font-semibold truncate max-w-[80px] text-white">{materialLabelMap[material]}</p>
          </div>
        </button>
        <div className="hidden h-full items-center sm:flex">
          <InfoPopover
            title="Material options"
            description="Vinyl is durable, eggshell is matte and textured, hologram/foil add shine, UV gloss gives extra pop."
            variant="dark"
            size="sm"
          />
        </div>
        {activeControl === "material" && (
          <div className="flex h-full items-center gap-1 px-1.5">
            {materials.map((option) => {
              const selected = option.value === material
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => onMaterialChange(option.value)}
                  className={clsx(
                    "rounded-full border px-3 py-1.5 text-[10px] font-semibold transition whitespace-nowrap",
                    selected
                      ? "border-white/70 text-white"
                      : "border-white/20 text-white/70"
                  )}
                >
                  {option.label}
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
            <p className="text-[11px] font-semibold truncate text-white">{sizeSummary}</p>
          </div>
        </button>
        <div className="hidden h-full items-center sm:flex">
          <InfoPopover
            title="Sizing tips"
            description="Set width/height (or diameter) between 1–50 cm. Keep proportions close to your design or choose a preset."
            variant="dark"
            size="sm"
          />
        </div>
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
            <p className="text-[11px] font-semibold truncate text-white">{quantity.toLocaleString()} pcs</p>
          </div>
        </button>
        <div className="hidden h-full items-center sm:flex">
          <InfoPopover
            title="Quantity guidance"
            description="Pick a preset for quick pricing or choose Custom for up to 20,000 pcs. Bigger runs lower unit cost."
            variant="dark"
            size="sm"
          />
        </div>
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

      {/* Format */}
      <div className="flex h-12 items-center gap-1.5 snap-start">
        <button
          type="button"
          className={summaryButtonClass(activeControl === "format", "cyan")}
          onClick={() => toggleControl("format")}
        >
          <span
            className={clsx(
              "flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-500/15 text-cyan-200 transition",
              activeControl === "format" && "bg-cyan-500/30 text-white"
            )}
          >
            <Scroll className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="text-[9px] uppercase tracking-[0.08em] text-white/50">Format</p>
            <p className="text-[11px] font-semibold truncate text-white">{formatLabelMap[format]}</p>
          </div>
        </button>
        <div className="hidden h-full items-center sm:flex">
          <InfoPopover
            title="Sheets vs rolls"
            description="Sheets are easy for handouts; rolls keep labels organized for dispensers. Pricing is the same here."
            variant="dark"
            size="sm"
          />
        </div>
        {activeControl === "format" && (
          <div className="flex h-full items-center gap-1 px-1.5">
            {formats.map((option) => {
              const selected = option.value === format
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => onFormatChange(option.value)}
                  className={clsx(
                    "rounded-full border px-3 py-1.5 text-[10px] font-semibold transition whitespace-nowrap",
                    selected
                      ? "border-white/70 text-white"
                      : "border-white/20 text-white/70"
                  )}
                >
                  {option.label}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Peeling */}
      <div className="flex h-12 items-center gap-1.5 snap-start">
        <button
          type="button"
          className={summaryButtonClass(activeControl === "peeling", "rose")}
          onClick={() => toggleControl("peeling")}
        >
          <span
            className={clsx(
              "flex h-8 w-8 items-center justify-center rounded-xl bg-rose-500/15 text-rose-200 transition",
              activeControl === "peeling" && "bg-rose-500/30 text-white"
            )}
          >
            <ScanLine className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="text-[9px] uppercase tracking-[0.08em] text-white/50">Peeling</p>
            <p className="text-[11px] font-semibold truncate text-white">{peelingLabelMap[peeling]}</p>
          </div>
        </button>
        <div className="hidden h-full items-center sm:flex">
          <InfoPopover
            title="Peeling styles"
            description="Easy peel adds a crack-back for quick removal. Individual cut gives each sticker its own backing."
            variant="dark"
            size="sm"
          />
        </div>
        {activeControl === "peeling" && (
          <div className="flex h-full items-center gap-1 px-1.5">
            {peelingOptions.map((option) => {
              const selected = option.value === peeling
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => onPeelingChange(option.value)}
                  className={clsx(
                    "rounded-full border px-3 py-1.5 text-[10px] font-semibold transition whitespace-nowrap",
                    selected
                      ? "border-white/70 text-white"
                      : "border-white/20 text-white/70"
                  )}
                >
                  {option.label}
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
