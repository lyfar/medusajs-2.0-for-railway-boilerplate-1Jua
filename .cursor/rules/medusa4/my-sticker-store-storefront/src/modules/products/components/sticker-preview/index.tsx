"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@medusajs/ui"
import { StickerShape, StickerDimensions } from "@lib/data/stickers"
import clsx from "clsx"

interface StickerPreviewProps {
  designUrl: string | null
  shape: StickerShape
  dimensions: StickerDimensions
  className?: string
  onDesignUpload?: (file: File, detectedShape: StickerShape) => void
  onDesignRemove?: () => void
}

// Icon components
function ZoomInIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
      <line x1="11" y1="8" x2="11" y2="14" />
      <line x1="8" y1="11" x2="14" y2="11" />
    </svg>
  )
}

function ZoomOutIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
      <line x1="8" y1="11" x2="14" y2="11" />
    </svg>
  )
}

function ResetIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  )
}

function UploadIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  )
}

function ReplaceIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  )
}

function GuideIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M12 1v6m0 6v6" />
      <path d="m21 12-6 0m-6 0-6 0" />
    </svg>
  )
}

export default function StickerPreview({
  designUrl,
  shape,
  dimensions,
  className,
  onDesignUpload,
  onDesignRemove,
}: StickerPreviewProps) {
  const [zoom, setZoom] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [showGuides, setShowGuides] = useState(true)
  const [isDragOver, setIsDragOver] = useState(false)
  const previewRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Reset position when shape changes
  useEffect(() => {
    setPosition({ x: 0, y: 0 })
    setZoom(1)
  }, [shape])

  // Cleanup object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      if (designUrl && designUrl.startsWith('blob:')) {
        URL.revokeObjectURL(designUrl)
      }
    }
  }, [designUrl])

  const detectShapeFromImage = useCallback(async (file: File): Promise<StickerShape> => {
    return new Promise((resolve) => {
      const img = new Image()
      const reader = new FileReader()

      reader.onload = (e) => {
        img.src = e.target?.result as string
        
        img.onload = () => {
          // Create canvas to analyze image
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')
          
          if (!ctx) {
            resolve('rectangle')
            return
          }

          canvas.width = img.width
          canvas.height = img.height
          ctx.drawImage(img, 0, 0)

          // Check if PNG with transparency
          if (file.type === 'image/png') {
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
            const data = imageData.data
            
            let hasTransparency = false
            let transparentPixels = 0
            const totalPixels = canvas.width * canvas.height

            // Check for transparency
            for (let i = 3; i < data.length; i += 4) {
              if (data[i] < 255) {
                hasTransparency = true
                if (data[i] === 0) {
                  transparentPixels++
                }
              }
            }

            // If more than 5% of pixels are transparent, it's likely a die-cut shape
            if (hasTransparency && (transparentPixels / totalPixels) > 0.05) {
              resolve('diecut')
              return
            }
          }

          // Check aspect ratio for shape detection
          const aspectRatio = img.width / img.height
          
          // Square detection (aspect ratio close to 1)
          if (aspectRatio >= 0.95 && aspectRatio <= 1.05) {
            resolve('square')
          } 
          // Circle detection would require more complex edge detection
          // For now, we'll default to rectangle for non-square shapes
          else {
            resolve('rectangle')
          }
        }
      }

      reader.readAsDataURL(file)
    })
  }, [])

  const handleFileUpload = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file')
      return
    }

    // Detect shape
    const shape = await detectShapeFromImage(file)
    
    // Notify parent components
    if (onDesignUpload) {
      onDesignUpload(file, shape)
    }
  }, [detectShapeFromImage, onDesignUpload])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)

    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileUpload(files[0])
    }
  }, [handleFileUpload])

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileUpload(files[0])
    }
  }, [handleFileUpload])

  const handleZoomIn = useCallback(() => {
    setZoom(prev => Math.min(prev + 0.1, 3))
  }, [])

  const handleZoomOut = useCallback(() => {
    setZoom(prev => Math.max(prev - 0.1, 0.3))
  }, [])

  const handleReset = useCallback(() => {
    setZoom(1)
    setPosition({ x: 0, y: 0 })
  }, [])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!designUrl) return
    e.preventDefault()
    setIsDragging(true)
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    })
  }, [designUrl, position])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !designUrl) return
    e.preventDefault()
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    })
  }, [isDragging, designUrl, dragStart])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  const getPreviewDimensions = useCallback(() => {
    const maxSize = 500 // Increased maximum preview size for better focus
    let width, height

    if (shape === 'circle' && dimensions.diameter) {
      width = height = dimensions.diameter
    } else if (dimensions.width && dimensions.height) {
      width = dimensions.width
      height = dimensions.height
    } else {
      width = height = 10 // Default size
    }

    // Calculate aspect ratio and scale to fit within maxSize
    const aspectRatio = width / height
    if (width > height) {
      return {
        width: maxSize,
        height: maxSize / aspectRatio
      }
    } else {
      return {
        width: maxSize * aspectRatio,
        height: maxSize
      }
    }
  }, [shape, dimensions])

  const previewDimensions = getPreviewDimensions()

  const getShapeStyles = () => {
    const baseStyles = {
      width: `${previewDimensions.width}px`,
      height: `${previewDimensions.height}px`,
    }

    switch (shape) {
      case 'circle':
        return {
          ...baseStyles,
          borderRadius: '50%',
        }
      case 'square':
        return {
          ...baseStyles,
          borderRadius: '8px',
        }
      case 'rectangle':
        return {
          ...baseStyles,
          borderRadius: '6px',
        }
      case 'diecut':
        return {
          ...baseStyles,
          borderRadius: '12px',
        }
      default:
        return baseStyles
    }
  }

  return (
    <div className={clsx("relative h-full", className)}>
      {/* Beautiful gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-2xl" />
      
      <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl h-full shadow-xl border border-white/20 flex flex-col">
        {/* Fixed Header */}
        <div className="flex-shrink-0 p-6 border-b border-white/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-blue-500 rounded-full animate-pulse" />
              <h3 className="text-xl font-semibold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Design Area
              </h3>
            </div>
            
            {/* Design Controls */}
            <div className="flex items-center gap-2">
              {/* Upload/Replace Button */}
              <Button
                variant="secondary"
                size="small"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 hover:bg-white/80 transition-all duration-200"
              >
                {designUrl ? <ReplaceIcon /> : <UploadIcon />}
                {designUrl ? 'Replace' : 'Upload'}
              </Button>

              {designUrl && (
                <>
                  <div className="w-px h-6 bg-gray-300" />
                  
                  {/* Zoom Controls */}
                  <div className="flex items-center gap-1 bg-white/60 backdrop-blur-sm rounded-lg p-1 border border-white/30">
                    <Button
                      variant="secondary"
                      size="small"
                      onClick={handleZoomOut}
                      disabled={zoom <= 0.3}
                      className="p-2 hover:bg-white/80 transition-all duration-200"
                    >
                      <ZoomOutIcon />
                    </Button>
                    <span className="text-sm font-medium text-gray-700 min-w-[50px] text-center px-1">
                      {Math.round(zoom * 100)}%
                    </span>
                    <Button
                      variant="secondary"
                      size="small"
                      onClick={handleZoomIn}
                      disabled={zoom >= 3}
                      className="p-2 hover:bg-white/80 transition-all duration-200"
                    >
                      <ZoomInIcon />
                    </Button>
                  </div>

                  <Button
                    variant="secondary"
                    size="small"
                    onClick={handleReset}
                    className="p-2 hover:bg-white/80 transition-all duration-200"
                  >
                    <ResetIcon />
                  </Button>

                  <Button
                    variant="secondary"
                    size="small"
                    onClick={() => setShowGuides(!showGuides)}
                    className={clsx("p-2 transition-all duration-200", {
                      "bg-blue-100 text-blue-600": showGuides,
                      "hover:bg-white/80": !showGuides
                    })}
                  >
                    <GuideIcon />
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Scrollable Design Area */}
        <div className="flex-1 p-6 overflow-auto">
          <div className="relative h-full min-h-[500px]">
            {/* Decorative corner elements */}
            <div className="absolute -top-2 -left-2 w-4 h-4 border-l-2 border-t-2 border-blue-300 rounded-tl-lg" />
            <div className="absolute -top-2 -right-2 w-4 h-4 border-r-2 border-t-2 border-blue-300 rounded-tr-lg" />
            <div className="absolute -bottom-2 -left-2 w-4 h-4 border-l-2 border-b-2 border-blue-300 rounded-bl-lg" />
            <div className="absolute -bottom-2 -right-2 w-4 h-4 border-r-2 border-b-2 border-blue-300 rounded-br-lg" />
            
            <div 
              ref={previewRef}
              className={clsx(
                "relative bg-white rounded-xl overflow-hidden shadow-inner border-2 h-full transition-all duration-200",
                isDragOver ? "border-blue-400 bg-blue-50" : "border-gray-100"
              )}
              style={{ 
                cursor: designUrl ? (isDragging ? 'grabbing' : 'grab') : 'default',
                background: 'linear-gradient(45deg, #f8fafc 25%, transparent 25%), linear-gradient(-45deg, #f8fafc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f8fafc 75%), linear-gradient(-45deg, transparent 75%, #f8fafc 75%)',
                backgroundSize: '20px 20px',
                backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
              }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileInputChange}
                className="hidden"
              />

              {/* Center guidelines */}
              {showGuides && designUrl && (
                <>
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-full h-px bg-gradient-to-r from-transparent via-blue-300/50 to-transparent" />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-px h-full bg-gradient-to-b from-transparent via-blue-300/50 to-transparent" />
                  </div>
                </>
              )}

              {/* Sticker Shape Container */}
              <div className="absolute inset-0 flex items-center justify-center">
                {designUrl ? (
                  <div className="relative">
                    {/* Shadow effect */}
                    <div
                      className="absolute inset-0 bg-black/10 blur-lg transform translate-y-2 translate-x-2"
                      style={getShapeStyles()}
                    />
                    
                    {/* Main sticker shape */}
                    <div
                      className="relative bg-white border-4 border-dashed border-blue-400/60 overflow-hidden"
                      style={getShapeStyles()}
                    >
                      {/* Design Image */}
                      <div
                        className="absolute inset-0 flex items-center justify-center"
                        style={{
                          transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
                          transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                        }}
                      >
                        <img
                          src={designUrl}
                          alt="Sticker design"
                          className="max-w-full max-h-full object-contain"
                          style={{
                            clipPath: shape === 'circle' ? 'circle(50%)' : 'none',
                            userSelect: 'none',
                            pointerEvents: 'none',
                            filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))'
                          }}
                          draggable={false}
                        />
                      </div>

                      {/* Cut line indicators on top */}
                      {showGuides && (
                        <>
                          {/* Corner markers */}
                          <div className="absolute top-2 left-2 w-3 h-3 border-l-2 border-t-2 border-red-400 opacity-60" />
                          <div className="absolute top-2 right-2 w-3 h-3 border-r-2 border-t-2 border-red-400 opacity-60" />
                          <div className="absolute bottom-2 left-2 w-3 h-3 border-l-2 border-b-2 border-red-400 opacity-60" />
                          <div className="absolute bottom-2 right-2 w-3 h-3 border-r-2 border-b-2 border-red-400 opacity-60" />
                          
                          {/* Cut line label */}
                          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium shadow-lg">
                            Cut Line
                          </div>
                        </>
                      )}
                    </div>

                    {/* Enhanced Dimension Labels */}
                    <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg border border-white/30">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <span className="text-sm font-medium text-gray-700">
                          {shape === 'circle' && dimensions.diameter && (
                            <>⌀ {dimensions.diameter}cm</>
                          )}
                          {shape !== 'circle' && dimensions.width && dimensions.height && (
                            <>{dimensions.width} × {dimensions.height}cm</>
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Shape indicator */}
                    <div className="absolute -bottom-8 right-0 bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg border border-white/30">
                      <div className="flex items-center gap-2">
                        <div className={clsx("w-3 h-3 border-2", {
                          "rounded-full border-blue-500": shape === 'circle',
                          "rounded-sm border-green-500": shape === 'square',
                          "rounded border-purple-500": shape === 'rectangle',
                          "rounded-lg border-orange-500": shape === 'diecut'
                        })} />
                        <span className="text-sm font-medium text-gray-700 capitalize">
                          {shape === 'diecut' ? 'Die Cut' : shape}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Upload Area */
                  <div className="text-center space-y-6 p-8">
                    <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                      <UploadIcon className="w-12 h-12 text-blue-500" />
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-xl font-semibold text-gray-800">
                        Upload Your Design
                      </h4>
                      <p className="text-gray-500">
                        Drag & drop your image here or click to browse
                      </p>
                      <p className="text-sm text-gray-400">
                        Supports PNG, JPG, SVG up to 10MB
                      </p>
                    </div>
                    <Button
                      variant="primary"
                      size="large"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-8"
                    >
                      Choose File
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Instructions Footer */}
        {designUrl && (
          <div className="flex-shrink-0 p-4 border-t border-white/20">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-3 border border-blue-100">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0116 0zm-7-4a1 1 0 1 1-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="text-sm text-gray-600">
                  <span className="font-medium">💡 Tip:</span> Drag to position • Zoom for detail • Red markers show cut lines
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 