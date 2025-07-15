"use client"

import React from "react"
import clsx from "clsx"
import {
  Minus,
  Plus,
  Upload,
  Check,
  AlertCircle,
  Scissors,
  Eye,
  EyeOff,
} from "lucide-react"
import Image from "next/image"
import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import { Shape } from "./shape-selector"

interface ImageDropZoneProps {
  shape: Shape
  dimensions: {
    width?: number
    height?: number
    diameter?: number
  }
  onFileUpload?: (fileKey: string, publicUrl: string) => void
  disabled?: boolean
  compact?: boolean
}

export default function ImageDropZone({
  shape,
  dimensions,
  onFileUpload,
  disabled,
  compact = false,
}: ImageDropZoneProps) {
  const [image, setImage] = useState<string | null>(null)
  const [scale, setScale] = useState(1)
  const [hasTransparency, setHasTransparency] = useState(false)
  const [outlineDataUrl, setOutlineDataUrl] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [showCutlines, setShowCutlines] = useState(true)

  /**
   * Uploads file to backend and gets the file key and public URL
   */
  const uploadFile = async (
    file: File
  ): Promise<{ fileKey: string; publicUrl: string } | null> => {
    try {
      const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
      const backendUrl =
        process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"

      const headers: HeadersInit = {
        "Content-Type": "application/json",
      }

      if (publishableKey) {
        headers["x-publishable-api-key"] = publishableKey
      } else {
        console.warn("No publishable API key found. Upload may fail.")
      }

      // First, get the upload URL from the backend
      const uploadUrlResponse = await fetch(
        `${backendUrl}/store/stickers/upload-url`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({
            filename: file.name,
            mimeType: file.type,
          }),
        }
      )

      if (!uploadUrlResponse.ok) {
        const errorText = await uploadUrlResponse.text()
        try {
          const errorData = JSON.parse(errorText)
          throw new Error(
            errorData.message || errorData.error || "Failed to get upload URL"
          )
        } catch (e) {
          // If parsing as JSON fails, it might be an HTML error page
          throw new Error(
            "Failed to get upload URL. The server returned a non-JSON response."
          )
        }
      }

      const { upload_url, file_key } = await uploadUrlResponse.json()

      // Upload the file to the presigned URL
      const uploadResponse = await fetch(upload_url, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      })

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload file to storage")
      }

      // Construct the public URL
      const publicUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL
        ? `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${file_key}`
        : upload_url.split("?")[0] // Remove query params

      return { fileKey: file_key, publicUrl }
    } catch (error) {
      console.error("Upload error:", error)
      setUploadError(error instanceof Error ? error.message : "Upload failed")
      return null
    }
  }

  /**
   * Generates a bold white outline with a sticker-like effect.
   * This effect is only applied for die cut shapes with transparency.
   */
  const generateOutline = (
    img: HTMLImageElement,
    hasTransparency: boolean,
    shape: Shape
  ): string | null => {
    if (shape !== "diecut" || !hasTransparency) return null

    // Increase this value for a thicker (bolder) outline.
    const outlineThickness = 10
    const canvas = document.createElement("canvas")
    canvas.width = img.width + outlineThickness * 2
    canvas.height = img.height + outlineThickness * 2
    const ctx = canvas.getContext("2d")
    if (!ctx) return null

    // Create an opaque mask from the image's alpha channel.
    const tempCanvas = document.createElement("canvas")
    tempCanvas.width = img.width
    tempCanvas.height = img.height
    const tempCtx = tempCanvas.getContext("2d")
    if (!tempCtx) return null
    tempCtx.drawImage(img, 0, 0)
    const imgData = tempCtx.getImageData(0, 0, img.width, img.height)
    const data = imgData.data

    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] > 0) {
        // Set any non-transparent pixel to fully opaque black.
        data[i] = 0
        data[i + 1] = 0
        data[i + 2] = 0
        data[i + 3] = 255
      }
    }
    tempCtx.putImageData(imgData, 0, 0)

    // Draw the mask with a white shadow to create a bold outline.
    ctx.save()
    ctx.translate(outlineThickness, outlineThickness)
    ctx.shadowColor = "white"
    ctx.shadowBlur = outlineThickness * 1.5
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 0
    ctx.drawImage(tempCanvas, 0, 0)
    ctx.restore()

    // Draw the original image on top, centered over the outline.
    ctx.drawImage(img, outlineThickness, outlineThickness)

    return canvas.toDataURL()
  }

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0]
      if (file && !disabled) {
        setIsUploading(true)
        setUploadError(null)
        setUploadSuccess(false)

        const reader = new FileReader()
        reader.onload = async () => {
          const img = new window.Image()
          img.onload = async () => {
            let transparency = false
            // Only check for transparency if the file is a PNG.
            if (file.type === "image/png") {
              const tempCanvas = document.createElement("canvas")
              tempCanvas.width = img.width
              tempCanvas.height = img.height
              const tempCtx = tempCanvas.getContext("2d")
              if (tempCtx) {
                tempCtx.drawImage(img, 0, 0)
                const imageData = tempCtx.getImageData(
                  0,
                  0,
                  tempCanvas.width,
                  tempCanvas.height
                )
                const { data } = imageData
                for (let i = 3; i < data.length; i += 4) {
                  if (data[i] < 255) {
                    transparency = true
                    break
                  }
                }
              }
            }
            const outline = generateOutline(img, transparency, shape)
            setHasTransparency(transparency)
            setOutlineDataUrl(outline)
            setImage(reader.result as string)
            setScale(1)

            // Upload the file to backend
            const uploadResult = await uploadFile(file)
            if (uploadResult && onFileUpload) {
              onFileUpload(uploadResult.fileKey, uploadResult.publicUrl)
              setUploadSuccess(true)
              // Clear success message after 3 seconds
              setTimeout(() => setUploadSuccess(false), 3000)
            }

            setIsUploading(false)
          }
          img.src = reader.result as string
        }
        reader.readAsDataURL(file)
      }
    },
    [shape, onFileUpload, disabled]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif"],
    },
    maxFiles: 1,
    disabled: disabled || isUploading,
  })

  const handleScaleChange = (delta: number) => {
    setScale((prev) => Math.max(0.5, Math.min(3, prev + delta)))
  }

  // Generate cut lines and safety margins overlay based on shape
  const CutLinesOverlay = () => {
    if (!showCutlines) return null

    let style = {}

    switch (shape) {
      case "circle":
        style = {
          border: "3px dashed #ef4444",
          borderRadius: "50%",
        }
        break
      case "rectangle":
      case "square":
        style = {
          border: "3px dashed #ef4444",
          borderRadius: "12px",
        }
        break
      case "diecut":
        style = {
          // In die-cut, the outline itself is the cutline, so we don't draw an extra one.
          // This ensures the component returns a valid element.
          border: "none",
        }
        break
      default:
        style = {
          border: "none",
        }
    }

    return (
      <div
        className="absolute top-0 left-0 w-full h-full pointer-events-none"
        style={style}
      ></div>
    )
  }

  // Define styles for safety margins
  const getSafetyMarginStyle = () => {
    const baseStyle = {
      border: "2px dashed #fbbf24", // amber-400
      width: "calc(100% - 16px)",
      height: "calc(100% - 16px)",
      position: "absolute" as const,
      top: "8px",
      left: "8px",
      zIndex: 9,
      pointerEvents: "none" as const,
      borderRadius: shape === "circle" ? "50%" : "8px",
      boxShadow: "0 0 0 2px rgba(251, 191, 36, 0.3)",
    }

    switch (shape) {
      case "circle":
        return {
          ...baseStyle,
          borderRadius: "50%",
          width: "calc(100% - 12px)",
          height: "calc(100% - 12px)",
          top: "6px",
          left: "6px",
        }
      case "rectangle":
      case "square":
        return {
          ...baseStyle,
          borderRadius: "8px",
          width: "calc(100% - 12px)",
          height: "calc(100% - 12px)",
          top: "6px",
          left: "6px",
        }
      case "diecut":
        // For die-cut, the safety margin is implied within the outline,
        // so we don't render a separate visible margin.
        return { display: "none" }
      default:
        return {}
    }
  }

  // Generate a container with dynamic styles based on the shape
  const getShapeStyle = () => {
    const maxWidth = compact ? 200 : 520
    const maxHeight = compact ? 150 : 400
    const minSize = compact ? 100 : 200
    let width: number
    let height: number

    if (shape === "circle" && dimensions.diameter) {
      width = height = Math.min(
        maxWidth,
        maxHeight,
        Math.max(minSize, dimensions.diameter * (compact ? 20 : 30))
      )
    } else if (shape === "square") {
      width = height = Math.min(
        maxWidth,
        maxHeight,
        Math.max(minSize, (dimensions.width || 8) * (compact ? 20 : 30))
      )
    } else if (shape === "rectangle" || shape === "diecut") {
      if (dimensions.width && dimensions.height) {
        const aspectRatio = dimensions.width / dimensions.height

        // Calculate optimal size within constraints
        const baseWidth = Math.max(
          minSize,
          dimensions.width * (compact ? 20 : 30)
        )
        const baseHeight = Math.max(
          minSize,
          dimensions.height * (compact ? 20 : 30)
        )

        // Fit within container bounds
        width = Math.min(baseWidth, maxWidth, maxHeight * aspectRatio)
        height = width / aspectRatio

        if (height > maxHeight || height < minSize) {
          height = Math.min(
            maxHeight,
            Math.max(minSize, dimensions.height * (compact ? 20 : 30))
          )
          width = height * aspectRatio
          if (width > maxWidth) {
            width = maxWidth
            height = width / aspectRatio
          }
        }
      } else {
        width = Math.min(maxWidth, maxHeight)
        height = Math.min(maxWidth, maxHeight)
      }
    } else {
      width = Math.min(maxWidth, maxHeight)
      height = Math.min(maxWidth, maxHeight)
    }

    // Ensure minimum size and add responsive constraints
    width = Math.max(width, compact ? 100 : 120)
    height = Math.max(height, compact ? 100 : 120)

    switch (shape) {
      case "circle":
        return {
          width: `${width}px`,
          height: `${height}px`,
          position: "relative" as const,
          overflow: "visible", // Allow outline to spill
        }
      case "rectangle":
      case "square":
        return {
          width: `${width}px`,
          height: `${height}px`,
          position: "relative" as const,
          overflow: "visible", // Allow outline to spill
        }
      case "diecut":
        return {
          width: dimensions.width ? `${dimensions.width}cm` : "10cm",
          height: dimensions.height ? `${dimensions.height}cm` : "6cm",
          position: "relative" as const,
          overflow: "visible", // Allow outline to spill
        }
      default:
        return {}
    }
  }

  // Define a star-shaped clip path for die cut stickers when transparency isn't available.
  // Using a single-line string avoids potential parsing issues with multiline template literals.

  return (
    <div className={compact ? "space-y-4" : "space-y-4"}>
      {/* Always show size info and controls at top */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-neutral-400">
            {shape === "circle"
              ? `Size: ${dimensions.diameter}cm diameter`
              : `Size: ${dimensions.width}cm × ${dimensions.height}cm`}
          </div>
          <button
            onClick={() => setShowCutlines(!showCutlines)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg transition-colors"
            title="Toggle cutting lines and safety margins preview"
          >
            <Scissors className="w-4 h-4" />
            {showCutlines ? "Hide" : "Show"} Cut Lines
          </button>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-0 border-t-2 border-dashed border-red-500"></div>
            <span className="text-neutral-500">Cut line</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-0 border-t border-dashed border-amber-400"></div>
            <span className="text-neutral-500">Safety margin</span>
          </div>
        </div>
        <p className="text-xs text-neutral-500">
          PNG, JPG, GIF formats. Auto-fits to your {shape} sticker.
        </p>
      </div>

      {uploadError && (
        <div className="p-3 bg-red-900/20 border border-red-500/50 rounded-md flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <p className="text-sm text-red-400">{uploadError}</p>
        </div>
      )}

      {uploadSuccess && (
        <div className="p-3 bg-green-900/20 border border-green-500/50 rounded-md flex items-center gap-2">
          <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
          <p className="text-sm text-green-400">Image uploaded successfully!</p>
        </div>
      )}

      <div
        {...getRootProps()}
        style={getShapeStyle()}
        className="relative cursor-pointer mx-auto"
      >
        {/* The container's border/clip settings change based on shape and transparency. */}
        <div
          className={clsx("transition-colors overflow-hidden", {
            "border-2 border-dashed border-neutral-700 hover:border-neutral-500":
              !isDragActive && !disabled && !isUploading,
            "border-2 border-dashed border-white": isDragActive,
            "border-2 border-dashed border-blue-500 animate-pulse": isUploading,
            "rounded-full": shape === "circle",
            "rounded-xl": shape === "square" || shape === "rectangle",
            // For diecut, if an image with transparency exists, we render our outline instead of a border.
            "border-0": shape === "diecut" && hasTransparency && image,
            "opacity-50 cursor-not-allowed": disabled,
          })}
          style={
            shape === "diecut" && !hasTransparency
              ? {
                  clipPath:
                    "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)",
                }
              : undefined
          }
        >
          <input {...getInputProps()} />

          {/* Cut lines and safety margins overlay - always visible when toggled */}
          <CutLinesOverlay />

          {image ? (
            <div className="relative w-full h-full overflow-hidden">
              {/*
                  For die cut stickers that have transparency, we render the generated outline behind the image.
                  For all other shapes (or die cut without transparency) we simply display the image.
                */}
              {shape === "diecut" && hasTransparency && outlineDataUrl ? (
                <>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative w-full h-full">
                      <Image
                        src={outlineDataUrl}
                        alt="White Outline Sticker"
                        fill
                        style={{
                          objectFit: "contain",
                          objectPosition: "50% 50%",
                          zIndex: 1,
                        }}
                      />
                    </div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative w-full h-full">
                      <Image
                        src={image}
                        alt="Preview"
                        fill
                        style={{
                          objectFit: "contain",
                          objectPosition: "50% 50%",
                          zIndex: 2,
                        }}
                      />
                    </div>
                  </div>
                </>
              ) : (
                <Image
                  src={image}
                  alt="Preview"
                  fill
                  style={{
                    objectFit: "contain",
                    transform:
                      shape === "diecut" ? undefined : `scale(${scale})`,
                    objectPosition: "50% 50%",
                    transition:
                      shape === "diecut"
                        ? undefined
                        : "transform 0.2s ease-out",
                    ...(shape === "diecut" && !hasTransparency
                      ? {
                          clipPath:
                            "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)",
                        }
                      : {}),
                  }}
                  className={clsx("transition-all duration-200", {
                    "rounded-full": shape === "circle",
                    "rounded-xl": shape === "square" || shape === "rectangle",
                  })}
                />
              )}

              {/* Loading overlay */}
              {isUploading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                  <div className="bg-black/80 rounded-lg p-4 flex items-center gap-3">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                    <span className="text-white text-sm">Uploading...</span>
                  </div>
                </div>
              )}

              {/* Zoom controls appear only for non-diecut shapes */}
              {shape !== "diecut" && !disabled && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleScaleChange(-0.1)
                    }}
                    className="w-8 h-8 flex items-center justify-center bg-black/50 hover:bg-black/70 rounded-full text-white backdrop-blur-sm"
                    title="Zoom out"
                    disabled={scale <= 0.5}
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleScaleChange(0.1)
                    }}
                    className="w-8 h-8 flex items-center justify-center bg-black/50 hover:bg-black/70 rounded-full text-white backdrop-blur-sm"
                    title="Zoom in"
                    disabled={scale >= 3}
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-center p-4">
              {isUploading ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-neutral-400 border-t-transparent"></div>
                  <p className="text-sm text-neutral-400">
                    Processing image...
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <Upload className="w-8 h-8 text-neutral-500" />
                  <p className="text-sm text-neutral-400">
                    {isDragActive
                      ? "Drop your image here..."
                      : disabled
                      ? "Upload disabled"
                      : "Drag and drop your image here, or click to select"}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
