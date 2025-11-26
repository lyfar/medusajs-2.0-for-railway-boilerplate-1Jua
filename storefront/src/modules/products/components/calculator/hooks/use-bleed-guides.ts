'use client'

import { useMemo, type CSSProperties } from "react"

import type { Dimensions, Material } from "../types"
import type { Shape } from "../shape-selector"

interface UseBleedGuidesProps {
  stickerAreaSize: { width: number; height: number }
  shape: Shape
  dimensions: Dimensions
  stickerBorderRadius: string
  material?: Material
}

export function useBleedGuides({
  stickerAreaSize,
  shape,
  dimensions,
  stickerBorderRadius,
  material,
}: UseBleedGuidesProps) {
  const BLEED_CM = 0.3

  const maskStyles: CSSProperties = {
    WebkitMask: "linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)",
    WebkitMaskComposite: "xor",
    maskComposite: "exclude",
  }

  const materialOutlineStyles: Partial<Record<Material, CSSProperties>> = {
    hologram_egg_shell: {
      border: "3px solid transparent",
      background: "conic-gradient(from 140deg at 50% 50%, #ff9aa2, #ffe0e0, #b5e2ff, #bca7ff, #ff9aa2) border-box",
      filter: "drop-shadow(0 0 8px rgba(168,85,247,0.6))",
      ...maskStyles,
    },
    gold_silver_foil: {
      border: "3px solid transparent",
      background: "linear-gradient(135deg, #d6af3a 0%, #f6f3e7 35%, #c2c2c6 65%, #d6af3a 100%) border-box",
      filter: "drop-shadow(0 0 6px rgba(214,175,58,0.5))",
      ...maskStyles,
    },
    transparent_egg_shell: {
      border: "3px solid transparent",
      background: "linear-gradient(135deg, #2dd4bf, #99f6e4) border-box",
      filter: "drop-shadow(0 0 6px rgba(45,212,191,0.5))",
      ...maskStyles,
    },
    uv_gloss: {
      border: "3px solid transparent",
      background: "linear-gradient(135deg, #6366f1, #a5b4fc) border-box",
      filter: "drop-shadow(0 0 6px rgba(99,102,241,0.5))",
      ...maskStyles,
    },
    vinyl: {
      border: "2px solid rgba(255,255,255,0.9)",
      boxShadow: "0 0 10px rgba(255,255,255,0.3)",
    },
    egg_shell: {
      border: "2px solid rgba(255,255,255,0.9)",
      boxShadow: "0 0 10px rgba(255,255,255,0.3)",
    },
  }

  return useMemo(() => {
    if (!stickerAreaSize.width || !stickerAreaSize.height) return null

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
      border: "2px dashed rgba(251, 191, 36, 0.85)",
      pointerEvents: "none",
      borderRadius: stickerBorderRadius,
      transition: "width 240ms ease, height 240ms ease, border-radius 240ms ease, left 240ms ease, top 240ms ease",
    }

    const outer: CSSProperties = {
      position: "absolute",
      inset: 0,
      border: "2px solid rgba(255,255,255,0.5)",
      pointerEvents: "none",
      borderRadius: stickerBorderRadius,
      transition: "width 240ms ease, height 240ms ease, border-radius 240ms ease, left 240ms ease, top 240ms ease",
      ...(material ? materialOutlineStyles[material] : {}),
    }

    return { inner, outer }
  }, [
    stickerAreaSize.width,
    stickerAreaSize.height,
    shape,
    dimensions,
    stickerBorderRadius,
    material,
  ])
}
