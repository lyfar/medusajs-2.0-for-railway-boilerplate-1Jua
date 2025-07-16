"use client"

import React from "react"
import clsx from "clsx"
import {
  Upload,
  Check,
  AlertCircle,
  Minus,
  Plus,
} from "lucide-react"
import Image from "next/image"
import { useCallback, useState, useMemo, useEffect } from "react"
import { useDropzone } from "react-dropzone"
import { Shape } from "./shape-selector"
import { useImageUpload, useTransparencyCheck } from "./hooks"
import { getContainerStyles, getCutLineStyles, getSafetyMarginStyles } from "./utils/shapeStyles"
import { 
  DesignZoomTool, 
  ShapeSelectorTool, 
  BackgroundToggleTool, 
  CutlinesToggleTool 
} from "./tools"

interface ImageDropZoneProps {
  shape: Shape
  dimensions: {
    width?: number
    height?: number
    diameter?: number
  }
  onFileUpload?: (fileKey: string, publicUrl: string) => void
  onShapeChange?: (shape: Shape) => void
  disabled?: boolean
  compact?: boolean
}

export default function ImageDropZone({
  shape,
  dimensions,
  onFileUpload,
  onShapeChange,
  disabled,
  compact = false,
}: ImageDropZoneProps) {
  const [image, setImage] = useState<string | null>(null)
  const [fileType, setFileType] = useState<string | null>(null)
  const [scale, setScale] = useState(1) // Design zoom (image inside sticker)
  const [stickerZoom, setStickerZoom] = useState(1) // Sticker zoom (entire sticker view)
  const [showCutlines, setShowCutlines] = useState(true)
  const [backgroundMode, setBackgroundMode] = useState<'auto' | 'light' | 'dark'>('auto')
  const [isImageDark, setIsImageDark] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  // Use our custom hooks
  const { uploadError, uploadSuccess, isUploading, handleDrop } = useImageUpload({
    onFileUpload,
    disabled,
  })

  const { hasTransparency } = useTransparencyCheck({
    imageDataUrl: image,
    fileType: fileType || undefined,
    shape,
  })

  // Auto-dismiss success modal after 3 seconds
  useEffect(() => {
    if (uploadSuccess) {
      const timer = setTimeout(() => {
        // Since we can't directly control uploadSuccess, we just let it naturally dismiss
        // The hook should handle clearing the success state
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [uploadSuccess])

  // Analyze image colors to detect if it's predominantly dark
  const analyzeImageColors = useCallback(async (imageDataUrl: string) => {
    setIsAnalyzing(true)
    try {
      const img = new window.Image()
      img.crossOrigin = 'anonymous'
      
      return new Promise<boolean>((resolve) => {
        img.onload = () => {
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')
          if (!ctx) {
            resolve(false)
            return
          }

          canvas.width = img.width
          canvas.height = img.height
          ctx.drawImage(img, 0, 0)

          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
          const data = imageData.data

          let totalBrightness = 0
          let pixelCount = 0

          // Sample every 10th pixel for performance
          for (let i = 0; i < data.length; i += 40) {
            const r = data[i]
            const g = data[i + 1]
            const b = data[i + 2]
            const a = data[i + 3]

            // Skip transparent pixels
            if (a > 50) {
              // Calculate perceived brightness using luminance formula
              const brightness = (0.299 * r + 0.587 * g + 0.114 * b)
              totalBrightness += brightness
              pixelCount++
            }
          }

          const averageBrightness = totalBrightness / pixelCount
          const isDark = averageBrightness < 128 // Less than 50% brightness

          setIsImageDark(isDark)
          resolve(isDark)
        }

        img.onerror = () => {
          setIsImageDark(false)
          resolve(false)
        }

        img.src = imageDataUrl
      })
    } catch (error) {
      console.error('Color analysis failed:', error)
      setIsImageDark(false)
      return false
    } finally {
      setIsAnalyzing(false)
    }
  }, [])

  // Analyze colors when image changes
  useEffect(() => {
    if (image && backgroundMode === 'auto') {
      analyzeImageColors(image)
    }
  }, [image, backgroundMode, analyzeImageColors])

  // Determine actual background based on mode and analysis
  const actualBackground = useMemo(() => {
    if (backgroundMode === 'light') return 'light'
    if (backgroundMode === 'dark') return 'dark'
    // Auto mode: use light background for dark images, dark for light images
    return isImageDark ? 'light' : 'dark'
  }, [backgroundMode, isImageDark])

  // Handle file processing for preview
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0]
      if (!file || disabled) return

      // Set up preview immediately
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result
        if (typeof result === 'string') {
          setImage(result)
          setFileType(file.type)
          setScale(1)
          setStickerZoom(1) // Reset both zoom levels
        }
      }
      reader.readAsDataURL(file)

      // Also handle the upload to server
      await handleDrop(acceptedFiles)
    },
    [handleDrop, disabled]
  )

  // Setup dropzone
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif"],
    },
    multiple: false,
    disabled: disabled || isUploading,
  })

  // Memoize shape styles for performance with sticker zoom
  const shapeStyles = useMemo(() => {
    const baseStyles = getContainerStyles(shape, dimensions, compact, !!image)
    return {
      ...baseStyles,
      containerStyles: {
        ...baseStyles.containerStyles,
        transform: `scale(${stickerZoom})`,
        transformOrigin: 'center',
      }
    }
  }, [shape, dimensions, compact, image, stickerZoom])

  const handleScaleChange = (delta: number) => {
    setScale((prev) => Math.max(0.5, Math.min(3, prev + delta)))
  }

  const handleStickerZoomChange = (delta: number) => {
    setStickerZoom((prev) => Math.max(0.5, Math.min(2, prev + delta)))
  }

  // Generate cut lines and safety margins overlay based on shape
  const CutLinesOverlay = () => {
    if (!showCutlines) return null

    // For die-cut shapes, don't show cut lines overlay since the outline handles the border
    if (shape === "diecut") return null

    const cutLineStyle = getCutLineStyles(shape)
    const safetyStyle = getSafetyMarginStyles(shape)

    return (
      <>
        {/* Cut lines */}
        <div
          className="absolute top-0 left-0 w-full h-full pointer-events-none z-10"
          style={cutLineStyle}
        />
        {/* Safety margins */}
        <div
          className="absolute pointer-events-none z-20"
          style={safetyStyle}
        />
      </>
    )
  }

  return (
    <div className="h-full flex">
      {/* Photoshop-style Left Tool Panel */}
      {image && (
        <div className="flex-shrink-0 w-16 bg-neutral-800 border border-neutral-700 flex flex-col items-center py-4 gap-3 rounded-3xl mr-4">
          {/* Design Zoom Controls (only for non-diecut) */}
          {shape !== "diecut" && (
            <DesignZoomTool
              shape={shape}
              scale={scale}
              onScaleChange={handleScaleChange}
            />
          )}

          {/* Divider */}
          {shape !== "diecut" && <div className="w-8 h-px bg-neutral-600"></div>}

          {/* Shape Selector Button */}
          <ShapeSelectorTool
            shape={shape}
            onShapeChange={onShapeChange}
          />

          {/* Divider */}
          <div className="w-8 h-px bg-neutral-600"></div>

          {/* Background Mode Toggle */}
          <BackgroundToggleTool
            backgroundMode={backgroundMode}
            onBackgroundModeChange={setBackgroundMode}
            isImageDark={isImageDark}
            isAnalyzing={isAnalyzing}
          />

          {/* Divider */}
          <div className="w-8 h-px bg-neutral-600"></div>

          {/* Cut Lines Toggle */}
          <CutlinesToggleTool
            showCutlines={showCutlines}
            onToggleCutlines={() => setShowCutlines(!showCutlines)}
          />


        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative">
        {/* Technical Dotted Background - Full Area */}
        <div 
          className="absolute inset-0 opacity-30 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle, #525252 1.5px, transparent 1.5px)`,
            backgroundSize: '20px 20px',
            backgroundPosition: '0 0, 10px 10px'
          }}
        />
        
        {/* Centered Header Section */}
        <div className="flex-shrink-0 space-y-3 mb-4 text-center relative z-10">
          <div className="text-sm text-neutral-400">
            {shape === "circle"
              ? `Size: ${dimensions.diameter}cm diameter`
              : `Size: ${dimensions.width}cm × ${dimensions.height}cm`}
          </div>

          {/* Status Indicators with Colored Dots */}
          <div className="flex items-center justify-center gap-6 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-red-400">Cut line</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-amber-400 rounded-full"></div>
              <span className="text-amber-400">Safety margin</span>
            </div>
          </div>

          <p className="text-xs text-neutral-500">
            PNG, JPG, GIF formats. Auto-fits to your {shape} sticker.
          </p>

          {uploadError && (
            <div className="p-3 bg-red-900/20 border border-red-500/50 rounded-md flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <p className="text-sm text-red-400">{uploadError}</p>
            </div>
          )}

        </div>

        {/* Dynamic Drop Zone Area - Centered */}
        <div className="flex-1 flex items-center justify-center relative z-10">
          <div
            {...getRootProps()}
            style={shapeStyles.containerStyles}
            className="relative cursor-pointer transition-all duration-300 ease-in-out"
          >
            {/* The container's border/clip settings change based on shape and transparency. */}
            <div
              className={clsx("transition-colors overflow-hidden w-full h-full", {
                "border-2 border-dashed border-neutral-700 hover:border-neutral-500":
                  !isDragActive && !disabled && !isUploading && !(shape === "diecut" && image),
                "border-2 border-dashed border-white": isDragActive && !(shape === "diecut" && image),
                "border-2 border-dashed border-blue-500 animate-pulse": isUploading,
                "rounded-full": shapeStyles.borderRadius === "50%",
                "rounded-xl": shapeStyles.borderRadius === "12px",
                // For die-cut with image, canvas handles the border effect
                "border-0": shape === "diecut" && image,
                "opacity-50 cursor-not-allowed": disabled,
                // Dynamic background based on image analysis
                "bg-white": image && actualBackground === 'light',
                "bg-neutral-900": image && actualBackground === 'dark',
              })}
              style={
                shapeStyles.clipPath
                  ? { clipPath: shapeStyles.clipPath }
                  : undefined
              }
            >
              <input {...getInputProps()} />

              {/* Cut lines and safety margins overlay - always visible when toggled */}
              <CutLinesOverlay />

              {image ? (
                <div className="relative w-full h-full overflow-hidden">
                  {/*
                      For die cut stickers, show image with smart background.
                      For all other shapes we simply display the image.
                    */}
                  {shape === "diecut" ? (
                    <div className="flex items-center justify-center w-full h-full">
                       {isUploading && (
                         <div className="relative w-full h-full">
                           <Image
                             src={image}
                             alt="Preview"
                             fill
                             style={{
                               objectFit: "contain",
                               objectPosition: "50% 50%",
                             }}
                           />
                           <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                             <div className="flex flex-col items-center gap-2 text-white">
                               <div className="animate-spin w-6 h-6 border-2 border-white border-t-transparent rounded-full"></div>
                               <span className="text-sm">Uploading...</span>
                             </div>
                           </div>
                         </div>
                       )}
                       {isAnalyzing && (
                         <div className="relative w-full h-full">
                           <Image
                             src={image}
                             alt="Preview"
                             fill
                             style={{
                               objectFit: "contain",
                               objectPosition: "50% 50%",
                             }}
                           />
                           <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                             <div className="flex flex-col items-center gap-2 text-white">
                               <div className="animate-spin w-6 h-6 border-2 border-white border-t-transparent rounded-full"></div>
                               <span className="text-sm">Analyzing image colors...</span>
                             </div>
                           </div>
                         </div>
                       )}
                       {!isUploading && !isAnalyzing && (
                         <div className="flex items-center justify-center w-full h-full">
                           <Image
                             src={image}
                             alt="Preview"
                             fill
                             style={{
                               objectFit: "contain",
                               objectPosition: "50% 50%",
                             }}
                           />
                         </div>
                       )}
                    </div>
                  ) : (
                    <Image
                      src={image}
                      alt="Preview"
                      fill
                      style={{
                        objectFit: "contain",
                        transform: `scale(${scale})`,
                        objectPosition: "50% 50%",
                        transition: "transform 0.2s ease-out",
                      }}
                    />
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                  <Upload className="w-12 h-12 text-neutral-500 mb-4" />
                  <p className="text-lg font-medium text-neutral-300 mb-2">
                    {isDragActive ? "Drop your image here" : "Upload your design"}
                  </p>
                  <p className="text-sm text-neutral-500">
                    Drag and drop or click to browse
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sticker Zoom Controls - Fixed to Bottom */}
        {image && (
          <div className="flex-shrink-0 flex justify-center pb-4 relative z-10">
            <div className="flex items-center gap-4 p-3 bg-neutral-800 rounded-lg border border-neutral-700">
              <span className="text-sm text-neutral-400 font-medium">Sticker Zoom:</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleStickerZoomChange(-0.1)}
                  disabled={stickerZoom <= 0.5}
                  className="w-8 h-8 bg-blue-700 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-md flex items-center justify-center transition-colors"
                  title="Zoom out sticker view"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <div className="text-sm text-blue-300 font-mono min-w-[3rem] text-center">
                  {Math.round(stickerZoom * 100)}%
                </div>
                <button
                  onClick={() => handleStickerZoomChange(0.1)}
                  disabled={stickerZoom >= 2}
                  className="w-8 h-8 bg-blue-700 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-md flex items-center justify-center transition-colors"
                  title="Zoom in sticker view"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Upload Success Modal */}
      {uploadSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="bg-green-900/90 backdrop-blur-sm border border-green-500/50 rounded-lg p-4 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <Check className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-green-100 font-medium">Upload Successful!</p>
                <p className="text-green-200/80 text-sm">Your image has been uploaded and processed</p>
              </div>
            </div>
          </div>
        </div>
      )}


    </div>
  )
}
