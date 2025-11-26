import { loadImage } from "./image-loading"

import type { Dimensions } from "../types"
import type { Shape } from "../shape-selector"
import type { StickerCanvasShapeStyles } from "../hooks/use-sticker-canvas"
import type { Point } from "../hooks/use-image-transforms"

interface ExportDesignParams {
  imageData: string
  imageMeta: { width: number; height: number }
  containerSize: { width: number; height: number }
  stickerAreaSize: { width: number; height: number }
  renderSize: { width: number; height: number }
  position: Point
  rotation: number
  scale: number
  isImageDark: boolean
  shape: Shape
  dimensions: Dimensions
  shapeStyles: StickerCanvasShapeStyles
  saveEditedAsset: (args: {
    blob: Blob
    fileName: string
    mimeType: string
    transformations: { scale: number; rotation: number; position: Point }
    shape?: Shape
    dimensions?: Dimensions
  }) => Promise<void>
}

export async function exportDesign({
  imageData,
  imageMeta,
  containerSize,
  stickerAreaSize,
  renderSize,
  position,
  rotation,
  scale,
  isImageDark,
  shape,
  dimensions,
  shapeStyles,
  saveEditedAsset,
}: ExportDesignParams) {
  const img = await loadImage(imageData)
  const { width: naturalWidth, height: naturalHeight } = imageMeta

  const targetWidth = shapeStyles.pixelWidth || containerSize.width
  const targetHeight = shapeStyles.pixelHeight || containerSize.height
  const exportScale = 2
  const canvasWidth = Math.max(1, Math.round(targetWidth * exportScale))
  const canvasHeight = Math.max(1, Math.round(targetHeight * exportScale))
  const offscreen = document.createElement("canvas")
  offscreen.width = canvasWidth
  offscreen.height = canvasHeight
  const context = offscreen.getContext("2d")
  if (!context) {
    throw new Error("Unable to acquire canvas context")
  }

  context.scale(exportScale, exportScale)

  const workingWidth = canvasWidth / exportScale
  const workingHeight = canvasHeight / exportScale
  context.clearRect(0, 0, workingWidth, workingHeight)

  context.save()

  if (shape === "circle") {
    const radius = Math.min(workingWidth, workingHeight) / 2
    context.beginPath()
    context.arc(workingWidth / 2, workingHeight / 2, radius, 0, Math.PI * 2)
    context.closePath()
    context.clip()
  } else if (shape === "square" || shape === "rectangle") {
    const cornerRadius = shape === "rectangle" ? workingWidth * 0.035 : workingWidth * 0.01
    createRoundedRectPath(context, 0, 0, workingWidth, workingHeight, cornerRadius)
    context.clip()
  }

  context.fillStyle = isImageDark ? "#ffffff" : "#14161b"
  context.fillRect(0, 0, workingWidth, workingHeight)

  const baseScale = renderSize.width && naturalWidth ? renderSize.width / naturalWidth : 1
  const finalScale = baseScale * scale
  const destWidth = naturalWidth * finalScale
  const destHeight = naturalHeight * finalScale

  const positionScaleX = stickerAreaSize.width > 0 ? targetWidth / stickerAreaSize.width : 1
  const positionScaleY = stickerAreaSize.height > 0 ? targetHeight / stickerAreaSize.height : 1
  const scaledPositionX = position.x * positionScaleX
  const scaledPositionY = position.y * positionScaleY

  context.translate(workingWidth / 2 + scaledPositionX, workingHeight / 2 + scaledPositionY)
  context.rotate((rotation * Math.PI) / 180)
  context.drawImage(img, -destWidth / 2, -destHeight / 2, destWidth, destHeight)

  context.restore()

  const blob = await new Promise<Blob | null>((resolve) => offscreen.toBlob(resolve, "image/png"))
  if (!blob) {
    throw new Error("Failed to export edited design")
  }

  await saveEditedAsset({
    blob,
    fileName: "sticker-design.png",
    mimeType: "image/png",
    transformations: {
      scale,
      rotation,
      position,
    },
    shape,
    dimensions,
  })
}

function createRoundedRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  const r = Math.max(0, Math.min(radius, width / 2, height / 2))
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + width - r, y)
  ctx.quadraticCurveTo(x + width, y, x + width, y + r)
  ctx.lineTo(x + width, y + height - r)
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height)
  ctx.lineTo(x + r, y + height)
  ctx.quadraticCurveTo(x, y + height, x, y + height - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}
