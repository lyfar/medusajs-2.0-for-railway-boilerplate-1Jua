"use client"

import { HttpTypes } from "@medusajs/types"
import { Heading } from "@medusajs/ui"
import { useState, useCallback } from "react"
import ProductActions from "@modules/products/components/product-actions"
import ProductInfo from "@modules/products/templates/product-info"
import ProductTabs from "@modules/products/components/product-tabs"
import StickerPreview from "@modules/products/components/sticker-preview"
import { StickerShape, StickerDimensions } from "@lib/data/stickers"

type StickerProductTemplateProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  countryCode: string
}

const StickerProductTemplate: React.FC<StickerProductTemplateProps> = ({
  product,
  region,
  countryCode,
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [currentShape, setCurrentShape] = useState<StickerShape>('rectangle')
  const [currentDimensions, setCurrentDimensions] = useState<StickerDimensions>({ width: 10, height: 6 })

  const handleDesignUpload = useCallback((file: File, shape: StickerShape) => {
    // Clean up previous URL
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
    
    // Create new preview URL
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    setCurrentShape(shape)
  }, [previewUrl])

  const handleShapeChange = useCallback((shape: StickerShape) => {
    setCurrentShape(shape)
  }, [])

  const handleDimensionsChange = useCallback((dimensions: StickerDimensions) => {
    setCurrentDimensions(dimensions)
  }, [])

  return (
    <>
      <div className="content-container flex flex-col large:flex-row gap-8 py-6 relative min-h-screen">
        {/* Left Column - Fixed Design Area */}
        <div className="flex-1 large:sticky large:top-6 large:max-w-[600px] w-full h-[calc(100vh-3rem)]">
          <StickerPreview
            designUrl={previewUrl}
            shape={currentShape}
            dimensions={currentDimensions}
            onDesignUpload={handleDesignUpload}
          />
        </div>

        {/* Right Column - Scrollable Configuration */}
        <div className="flex-1 large:max-w-[500px] w-full">
          <div className="space-y-8">
            {/* Product Header */}
            <div className="sticky top-0 bg-white/95 backdrop-blur-sm z-10 py-4 -mt-4 border-b border-gray-100">
              <Heading
                level="h1"
                className="text-3xl leading-10 text-ui-fg-base"
                data-testid="product-title"
              >
                {product.title}
              </Heading>
              {product.subtitle && (
                <p className="text-medium text-ui-fg-subtle mt-2">
                  {product.subtitle}
                </p>
              )}
            </div>

            {/* Configuration Section */}
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  Sticker Configuration
                </h3>
                
                {/* Product Actions without upload component */}
                <ProductActions 
                  product={product} 
                  region={region}
                  onShapeChange={handleShapeChange}
                  onDimensionsChange={handleDimensionsChange}
                  hideUpload={true}
                />
              </div>

              {/* Product Information */}
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  Product Details
                </h3>
                <ProductInfo product={product} />
              </div>

              {/* Product Tabs */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <ProductTabs product={product} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default StickerProductTemplate 