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

  const materialOutlineStyles: Partial<Record<Material, CSSProperties>> = {
    hologram_egg_shell: {
      border: "2px solid transparent",
      borderImage: "linear-gradient(135deg,#22d3ee,#a855f7,#f472b6,#22d3ee) 1",
      boxShadow: "0 0 18px rgba(168,85,247,0.28)",
    },
    gold_silver_foil: {
      border: "2px solid transparent",
      borderImage:
        "linear-gradient(135deg,#d6af3a 0%,#f6f3e7 35%,#c2c2c6 65%,#d6af3a 100%) 1",
      boxShadow: "0 0 14px rgba(214,175,58,0.28)",
    },
    transparent_egg_shell: {
      border: "2px solid rgba(45,212,191,0.75)",
      boxShadow: "0 0 12px rgba(45,212,191,0.28)",
    },
    uv_gloss: {
      border: "2px solid rgba(99,102,241,0.8)",
      boxShadow: "0 0 12px rgba(99,102,241,0.25)",
    },
    vinyl: {
      border: "2px solid rgba(255,255,255,0.7)",
      boxShadow: "0 0 10px rgba(255,255,255,0.12)",
    },
    egg_shell: {
      border: "2px solid rgba(255,255,255,0.7)",
      boxShadow: "0 0 10px rgba(255,255,255,0.12)",
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
