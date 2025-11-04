const DESIGN_STORAGE_KEY = "sticker-design-draft.v1"

type UploadPreviewKind = "bitmap" | "pdf" | "vector" | "unsupported" | null

export type StoredShape = "rectangle" | "square" | "circle" | "diecut"

export interface StoredDimensions {
  width?: number
  height?: number
  diameter?: number
}

export interface StoredPoint {
  x: number
  y: number
}

export interface StoredAsset {
  name: string
  type: string
  dataUrl: string
  lastModified: number
  size?: number
}

export interface StoredTransform {
  scale: number
  rotation: number
  position: StoredPoint
}

export interface StoredDesignState {
  id: string
  original?: StoredAsset
  edited?: StoredAsset
  previewKind?: UploadPreviewKind
  previewDataUrl?: string
  transformations?: StoredTransform
  lastTransformations?: StoredTransform
  shape?: StoredShape
  dimensions?: StoredDimensions
  updatedAt: number
}

function isBrowser() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined"
}

export function generateDesignId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID()
  }

  return `design-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

export function readDesignState(): StoredDesignState | null {
  if (!isBrowser()) {
    return null
  }

  try {
    const raw = window.localStorage.getItem(DESIGN_STORAGE_KEY)
    if (!raw) {
      return null
    }

    const parsed = JSON.parse(raw) as StoredDesignState
    return parsed ?? null
  } catch (error) {
    console.warn("Failed to read design state from localStorage", error)
    try {
      window.localStorage.removeItem(DESIGN_STORAGE_KEY)
    } catch {
      // ignore clean-up errors
    }
    return null
  }
}

function writeDesignState(state: StoredDesignState | null) {
  if (!isBrowser()) {
    return state
  }

  try {
    if (!state) {
      window.localStorage.removeItem(DESIGN_STORAGE_KEY)
      return null
    }

    window.localStorage.setItem(DESIGN_STORAGE_KEY, JSON.stringify(state))
    return state
  } catch (error) {
    console.error("Failed to persist design state to localStorage", error)
    throw error instanceof Error ? error : new Error("Unable to persist design state")
  }
}

export function updateDesignState(
  updater: (prev: StoredDesignState | null) => StoredDesignState | null
) {
  const previous = readDesignState()
  const next = updater(previous)
  return writeDesignState(next)
}

export function clearDesignState() {
  writeDesignState(null)
}

export async function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result)
      } else {
        reject(new Error("Failed to convert file to data URL"))
      }
    }
    reader.onerror = () => {
      reject(reader.error ?? new Error("Failed to read file"))
    }
    reader.readAsDataURL(file)
  })
}

export async function blobToDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result)
      } else {
        reject(new Error("Failed to convert blob to data URL"))
      }
    }
    reader.onerror = () => {
      reject(reader.error ?? new Error("Failed to read blob"))
    }
    reader.readAsDataURL(blob)
  })
}

export function dataUrlToBlob(dataUrl: string) {
  const [prefix, base64] = dataUrl.split(",")
  if (!base64) {
    return new Blob()
  }

  const mimeMatch = prefix.match(/data:(.*?);base64/)
  const mimeType = mimeMatch?.[1] ?? "application/octet-stream"
  const byteCharacters = (typeof atob === "function" ? atob : globalThis.atob)(base64)
  const byteNumbers = new Array(byteCharacters.length)

  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i)
  }

  const byteArray = new Uint8Array(byteNumbers)
  return new Blob([byteArray], { type: mimeType })
}

export function createFileFromStoredAsset(asset: StoredAsset, fallbackName = "design-upload") {
  const blob = dataUrlToBlob(asset.dataUrl)
  const fileName = asset.name || fallbackName
  return new File([blob], fileName, {
    type: asset.type,
    lastModified: asset.lastModified || Date.now(),
  })
}

export function estimateDataUrlSize(dataUrl: string) {
  const sizeMatch = dataUrl.split(",")[1]
  if (!sizeMatch) {
    return 0
  }

  // Base64 encodes 3 bytes into 4 chars, so reverse that
  return Math.floor((sizeMatch.length * 3) / 4)
}

export {
  DESIGN_STORAGE_KEY,
  type StoredDesignState as DesignDraftState,
  type StoredAsset as DesignDraftAsset,
  type StoredTransform as DesignDraftTransform,
  type UploadPreviewKind as StoredUploadPreviewKind,
}
