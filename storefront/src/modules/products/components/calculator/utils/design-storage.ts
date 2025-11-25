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
  dataUrl?: string
  lastModified: number
  size?: number
  storageKey?: string
  storageDriver?: "inline" | "indexeddb" | "memory"
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

// In-memory fallback for when localStorage is unavailable or full
let memoryStore: StoredDesignState | null = null
const memoryBlobStore = new Map<string, Blob>()

const ASSET_DB_NAME = "sticker-design-assets"
const ASSET_STORE_NAME = "assets"
const MAX_INLINE_ASSET_BYTES = 2_500_000
const MAX_PREVIEW_EDGE = 1600
const PREVIEW_JPEG_QUALITY = 0.85

function isBrowser() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined"
}

function hasIndexedDb() {
  return typeof window !== "undefined" && typeof window.indexedDB !== "undefined"
}

export function generateDesignId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID()
  }

  return `design-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

export function readDesignState(): StoredDesignState | null {
  // Always check memory first if we've had to fallback
  if (memoryStore) {
    return memoryStore
  }

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
    // Try to clean up potentially corrupted data
    try {
      window.localStorage.removeItem(DESIGN_STORAGE_KEY)
    } catch {
      // ignore clean-up errors
    }
    return null
  }
}

function writeDesignState(state: StoredDesignState | null) {
  // Update memory store in case we need it later or are already using it
  memoryStore = state

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
    console.warn("Failed to persist design state to localStorage (likely quota exceeded). Falling back to in-memory storage.", error)
    // We already set memoryStore, so the app will continue to work for this session
    return state
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

async function getAssetDb(): Promise<IDBDatabase> {
  if (!hasIndexedDb()) {
    throw new Error("IndexedDB unavailable")
  }

  return await new Promise((resolve, reject) => {
    const request = window.indexedDB.open(ASSET_DB_NAME, 1)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(ASSET_STORE_NAME)) {
        db.createObjectStore(ASSET_STORE_NAME)
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error ?? new Error("IndexedDB error"))
  })
}

async function persistBlob(key: string, blob: Blob) {
  if (!hasIndexedDb()) {
    memoryBlobStore.set(key, blob)
    return { storageDriver: "memory" as const, storageKey: key }
  }

  try {
    const db = await getAssetDb()
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(ASSET_STORE_NAME, "readwrite")
      const store = tx.objectStore(ASSET_STORE_NAME)
      store.put(blob, key)
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error ?? new Error("Failed to store asset"))
    })
    return { storageDriver: "indexeddb" as const, storageKey: key }
  } catch (error) {
    console.warn("IndexedDB unavailable, falling back to memory for design asset", error)
    memoryBlobStore.set(key, blob)
    return { storageDriver: "memory" as const, storageKey: key }
  }
}

async function readPersistedBlob(key: string) {
  if (memoryBlobStore.has(key)) {
    return memoryBlobStore.get(key) ?? null
  }

  if (!hasIndexedDb()) {
    return null
  }

  try {
    const db = await getAssetDb()
    return await new Promise<Blob | null>((resolve, reject) => {
      const tx = db.transaction(ASSET_STORE_NAME, "readonly")
      const store = tx.objectStore(ASSET_STORE_NAME)
      const request = store.get(key)
      request.onsuccess = () => resolve((request.result as Blob | undefined) ?? null)
      request.onerror = () => reject(request.error ?? new Error("Failed to read asset"))
    })
  } catch (error) {
    console.warn("Failed to read design asset", error)
    return null
  }
}

export async function clearDesignAssets(designId?: string) {
  const keysToRemove: string[] = []
  if (designId) {
    keysToRemove.push(`${designId}:original`, `${designId}:edited`)
  } else {
    keysToRemove.push(...memoryBlobStore.keys())
  }

  keysToRemove.forEach((key) => memoryBlobStore.delete(key))

  if (!hasIndexedDb()) {
    return
  }

  try {
    const db = await getAssetDb()
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(ASSET_STORE_NAME, "readwrite")
      const store = tx.objectStore(ASSET_STORE_NAME)
      if (designId) {
        store.delete(`${designId}:original`)
        store.delete(`${designId}:edited`)
      } else {
        store.clear()
      }
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error ?? new Error("Failed to clear design assets"))
    })
  } catch (error) {
    console.warn("Failed to clear stored design assets", error)
  }
}

export async function storeDesignAssetBlob(
  designId: string,
  kind: "original" | "edited",
  blob: Blob
) {
  const key = `${designId}:${kind}`
  return persistBlob(key, blob)
}

export async function loadStoredAssetBlob(
  designId: string,
  kind: "original" | "edited",
  asset?: StoredAsset
) {
  if (!asset) {
    return null
  }
  if (asset.dataUrl) {
    return dataUrlToBlob(asset.dataUrl)
  }

  const key = asset.storageKey ?? `${designId}:${kind}`
  return readPersistedBlob(key)
}

export async function generatePreviewDataUrl(file: File, maxEdge = MAX_PREVIEW_EDGE) {
  if (typeof window === "undefined") {
    return fileToDataUrl(file)
  }

  const objectUrl = URL.createObjectURL(file)
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image()
      image.onload = () => resolve(image)
      image.onerror = (err) => reject(err)
      image.src = objectUrl
    })

    const naturalWidth = img.naturalWidth || img.width
    const naturalHeight = img.naturalHeight || img.height
    if (!naturalWidth || !naturalHeight) {
      return fileToDataUrl(file)
    }

    const scale = Math.min(1, maxEdge / Math.max(naturalWidth, naturalHeight))
    const targetWidth = Math.max(1, Math.round(naturalWidth * scale))
    const targetHeight = Math.max(1, Math.round(naturalHeight * scale))

    const canvas = document.createElement("canvas")
    canvas.width = targetWidth
    canvas.height = targetHeight
    const context = canvas.getContext("2d")
    if (!context) {
      return fileToDataUrl(file)
    }
    context.drawImage(img, 0, 0, targetWidth, targetHeight)

    if (file.type === "image/png" || file.type === "image/svg+xml") {
      return canvas.toDataURL("image/png")
    }
    return canvas.toDataURL("image/jpeg", PREVIEW_JPEG_QUALITY)
  } catch (error) {
    console.warn("Falling back to full data URL for preview generation", error)
    return fileToDataUrl(file)
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}

export function shouldEmbedInlineAsset(file: File | Blob) {
  return "size" in file ? file.size <= MAX_INLINE_ASSET_BYTES : true
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
  if (!asset.dataUrl) {
    throw new Error("No inline data URL available for stored asset")
  }
  const blob = dataUrlToBlob(asset.dataUrl)
  const fileName = asset.name || fallbackName
  return new File([blob], fileName, {
    type: asset.type,
    lastModified: asset.lastModified || Date.now(),
  })
}

export async function loadFileFromStoredAsset(
  designId: string,
  kind: "original" | "edited",
  asset: StoredAsset,
  fallbackName = "design-upload"
) {
  const blob = await loadStoredAssetBlob(designId, kind, asset)
  if (!blob) {
    throw new Error("Stored design asset is unavailable. Please re-upload your file.")
  }
  const fileName = asset.name || fallbackName
  return new File([blob], fileName, {
    type: asset.type,
    lastModified: asset.lastModified || Date.now(),
  })
}

export async function getDesignFilesFromState(design: StoredDesignState) {
  if (!design.original || !design.edited) {
    throw new Error("Design is incomplete. Upload and save your design before continuing.")
  }

  const [original, edited] = await Promise.all([
    loadFileFromStoredAsset(design.id, "original", design.original, design.original.name || "design-original"),
    loadFileFromStoredAsset(design.id, "edited", design.edited, design.edited.name || "design-edited"),
  ])

  return { original, edited }
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
