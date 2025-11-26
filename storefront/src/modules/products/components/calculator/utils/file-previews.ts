const PDFJS_CDN_VERSION = "5.4.394"

let pdfjsLibLoader: Promise<any> | null = null

const loadPdfJsFromCdn = () =>
  new Promise<any>((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("PDF.js CDN fallback is only available in the browser"))
      return
    }

    const existing = (window as any).pdfjsLib
    if (existing) {
      if (existing.GlobalWorkerOptions) {
        existing.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${existing.version}/pdf.worker.min.js`
      }
      resolve(existing)
      return
    }

    const script = document.createElement("script")
    script.src = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_CDN_VERSION}/pdf.min.js`
    script.async = true
    script.onload = () => {
      const pdfjs = (window as any).pdfjsLib
      if (!pdfjs) {
        reject(new Error("PDF.js failed to load from CDN"))
        return
      }
      if (pdfjs.GlobalWorkerOptions) {
        pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`
      }
      resolve(pdfjs)
    }
    script.onerror = () => {
      reject(new Error("Unable to load PDF.js from CDN"))
    }

    document.head.appendChild(script)
  })

const loadPdfJs = async () => {
  if (!pdfjsLibLoader) {
    pdfjsLibLoader = import("pdfjs-dist/legacy/build/pdf.mjs")
      .then((module) => {
        const pdfjs = module
        if (pdfjs.GlobalWorkerOptions) {
          pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`
        }
        return pdfjs
      })
      .catch((error) => {
        console.warn("Local PDF.js import failed, falling back to CDN", error)
        pdfjsLibLoader = loadPdfJsFromCdn()
        return pdfjsLibLoader
      })
  }

  return pdfjsLibLoader
}

function preparePdfData(arrayBuffer: ArrayBuffer): Uint8Array | null {
  try {
    const bytes = new Uint8Array(arrayBuffer)
    for (let i = 0; i < Math.min(1024, bytes.length - 5); i++) {
      if (
        bytes[i] === 0x25 &&
        bytes[i + 1] === 0x50 &&
        bytes[i + 2] === 0x44 &&
        bytes[i + 3] === 0x46 &&
        bytes[i + 4] === 0x2d
      ) {
        return bytes.slice(i)
      }
    }
  } catch (error) {
    console.error("Failed to prepare PDF data:", error)
  }
  return null
}

const loadPdfDocument = async (arrayBuffer: ArrayBuffer) => {
  const pdfjsLib = await loadPdfJs()
  const initialData = new Uint8Array(arrayBuffer)

  try {
    const pdf = await pdfjsLib.getDocument({ data: initialData }).promise
    return { pdfjsLib, pdf }
  } catch (initialError) {
    const extracted = preparePdfData(arrayBuffer)
    if (!extracted) {
      throw initialError
    }

    const pdf = await pdfjsLib.getDocument({ data: extracted }).promise
    return { pdfjsLib, pdf }
  }
}

export async function convertPdfToImage(file: File): Promise<string | null> {
  try {
    const arrayBuffer = await file.arrayBuffer()
    const { pdf } = await loadPdfDocument(arrayBuffer)
    const page = await pdf.getPage(1)
    const viewport = page.getViewport({ scale: 2 })
    const canvas = document.createElement("canvas")
    const context = canvas.getContext("2d")
    if (!context) return null

    canvas.width = viewport.width
    canvas.height = viewport.height

    await page.render({
      canvasContext: context,
      viewport,
    }).promise

    return canvas.toDataURL("image/png")
  } catch (error) {
    console.error("PDF conversion failed:", error)
    return null
  }
}

export async function convertVectorToImage(_file: File): Promise<string | null> {
  console.warn("Vector file conversion not yet implemented")
  return null
}
