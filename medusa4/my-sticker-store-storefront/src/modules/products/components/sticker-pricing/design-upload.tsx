"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Button } from "@medusajs/ui"
import { StickerShape } from "@lib/data/stickers"
import clsx from "clsx"

interface DesignUploadProps {
  onDesignUpload: (file: File, detectedShape: StickerShape) => void
  onShapeDetected?: (shape: StickerShape) => void
  disabled?: boolean
  className?: string
}

// Icon components
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

function ImageIcon({ className }: { className?: string }) {
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
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  )
}

export default function DesignUpload({
  onDesignUpload,
  onShapeDetected,
  disabled = false,
  className,
}: DesignUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [detectedShape, setDetectedShape] = useState<StickerShape | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

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

    setIsProcessing(true)
    setUploadedFile(file)

    // Create preview URL
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)

    // Detect shape
    const shape = await detectShapeFromImage(file)
    setDetectedShape(shape)
    
    // Notify parent components
    onDesignUpload(file, shape)
    if (onShapeDetected) {
      onShapeDetected(shape)
    }

    setIsProcessing(false)
  }, [detectShapeFromImage, onDesignUpload, onShapeDetected])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

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

  const handleRemoveFile = useCallback(() => {
    setUploadedFile(null)
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
    setPreviewUrl(null)
    setDetectedShape(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [previewUrl])

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  return (
    <div className={className}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-3 text-ui-fg-base">
            Upload Your Design
          </label>

          {!uploadedFile ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={clsx(
                "relative border-2 border-dashed rounded-lg p-8 text-center transition-colors",
                isDragging
                  ? "border-ui-border-interactive bg-ui-bg-interactive"
                  : "border-ui-border-base hover:border-ui-border-strong",
                disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileInputChange}
                disabled={disabled}
                className="hidden"
              />

              <div className="space-y-4">
                <div className="flex justify-center">
                  <UploadIcon className="h-12 w-12 text-ui-fg-subtle" />
                </div>

                <div>
                  <p className="text-base font-medium text-ui-fg-base">
                    Drop your design here or click to browse
                  </p>
                  <p className="text-sm text-ui-fg-subtle mt-1">
                    Supports PNG, JPG, SVG up to 10MB
                  </p>
                </div>

                <Button
                  variant="secondary"
                  size="base"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={disabled}
                >
                  Choose File
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Preview */}
              <div className="relative bg-ui-bg-subtle rounded-lg p-4">
                <div className="flex items-start space-x-4">
                  {previewUrl ? (
                    <div className="relative w-24 h-24 bg-white rounded border border-ui-border-base overflow-hidden">
                      <img
                        src={previewUrl}
                        alt="Design preview"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  ) : (
                    <div className="w-24 h-24 bg-ui-bg-subtle rounded border border-ui-border-base flex items-center justify-center">
                      <ImageIcon className="h-8 w-8 text-ui-fg-subtle" />
                    </div>
                  )}

                  <div className="flex-1">
                    <p className="text-sm font-medium text-ui-fg-base">
                      {uploadedFile.name}
                    </p>
                    <p className="text-xs text-ui-fg-subtle mt-1">
                      {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    
                    {detectedShape && !isProcessing && (
                      <div className="mt-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-md bg-ui-bg-interactive text-xs font-medium text-ui-fg-interactive">
                          Detected shape: {detectedShape === 'diecut' ? 'Die Cut' : detectedShape.charAt(0).toUpperCase() + detectedShape.slice(1)}
                        </span>
                      </div>
                    )}

                    {isProcessing && (
                      <p className="text-xs text-ui-fg-subtle mt-2">
                        Analyzing design...
                      </p>
                    )}
                  </div>

                  <Button
                    variant="secondary"
                    size="small"
                    onClick={handleRemoveFile}
                    disabled={disabled || isProcessing}
                  >
                    Remove
                  </Button>
                </div>
              </div>

              {/* Shape Detection Info */}
              <div className="bg-ui-bg-subtle p-3 rounded-md">
                <h4 className="font-medium text-sm mb-2 text-ui-fg-base">Shape Detection:</h4>
                <div className="space-y-1 text-xs text-ui-fg-subtle">
                  <p>• PNG files with transparency → Die Cut shape</p>
                  <p>• Square aspect ratio → Square shape</p>
                  <p>• Other aspect ratios → Rectangle shape</p>
                  <p>• You can change the shape manually if needed</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 