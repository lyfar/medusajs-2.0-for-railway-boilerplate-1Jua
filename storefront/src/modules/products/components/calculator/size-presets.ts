import { Shape } from "./shape-selector"

export type SizePresetKey = "S" | "M" | "L" | "XL"

export type SizeDimensions = {
  width?: number
  height?: number
  diameter?: number
}

export const SIZE_PRESETS: Record<Shape, Record<SizePresetKey, SizeDimensions>> = {
  rectangle: {
    S: { width: 4, height: 7 },
    M: { width: 6, height: 8 },
    L: { width: 10, height: 6 },
    XL: { width: 15, height: 5 },
  },
  square: {
    S: { width: 4, height: 4 },
    M: { width: 8, height: 8 },
    L: { width: 10, height: 10 },
    XL: { width: 12, height: 12 },
  },
  circle: {
    S: { diameter: 2.5 },
    M: { diameter: 5 },
    L: { diameter: 7.5 },
    XL: { diameter: 10 },
  },
  diecut: {
    S: { width: 7, height: 4 },
    M: { width: 8, height: 6 },
    L: { width: 10, height: 6 },
    XL: { width: 15, height: 5 },
  },
}
