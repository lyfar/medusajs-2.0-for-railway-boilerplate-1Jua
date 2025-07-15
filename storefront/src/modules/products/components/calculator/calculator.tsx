'use client';

import clsx from 'clsx';
import { useEffect, useState } from 'react';
import ImageDropZone from './image-drop-zone';
import QuantitySelector from './quantity-selector';
import ShapeSelector, { Shape, shapes } from './shape-selector';
import SizeInput from './size-input';
import { useShapeStickerPricing } from '@lib/hooks/use-shape-sticker-pricing';

interface Dimensions {
  width?: number;
  height?: number;
  diameter?: number;
}

interface PricingParams {
  F_S: number;
  k_S: number;
  delta: number;
}

interface CalculatorProps {
  onStateChange?: (
    shape: Shape,
    dimensions: Dimensions,
    quantity: number,
    fileKey: string | null,
    publicUrl: string | null
  ) => void;
  disabled?: boolean;
}

export default function Calculator({ onStateChange, disabled }: CalculatorProps) {
  const [shape, setShape] = useState<Shape>('rectangle');
  const [dimensions, setDimensions] = useState<Dimensions>({});
  const [quantity, setQuantity] = useState(500);
  const [uploadedFileKey, setUploadedFileKey] = useState<string | null>(null);
  const [uploadedPublicUrl, setUploadedPublicUrl] = useState<string | null>(null);

  const { calculatePricing, lastPricing, isLoading: pricingLoading } = useShapeStickerPricing();

  // Default dimensions for each shape
  const defaultDimensions: Record<Shape, Dimensions> = {
    rectangle: { width: 10, height: 6 },
    square: { width: 8, height: 8 },
    circle: { diameter: 10 },
    diecut: { width: 10, height: 6 }
  };

  // Set default dimensions when shape changes or on initial load
  useEffect(() => {
    setDimensions(defaultDimensions[shape]);
  }, [shape]);

  // Notify parent component of state changes
  useEffect(() => {
    if (onStateChange) {
      onStateChange(shape, dimensions, quantity, uploadedFileKey, uploadedPublicUrl);
    }
  }, [shape, dimensions, quantity, uploadedFileKey, uploadedPublicUrl, onStateChange]);

  const handleShapeChange = (newShape: Shape) => {
    setShape(newShape);
  };

  const handleFileUpload = (fileKey: string, publicUrl: string) => {
    setUploadedFileKey(fileKey);
    setUploadedPublicUrl(publicUrl);
  };

  // Fetch pricing from backend whenever parameters change
  useEffect(() => {
    if (dimensions && Object.keys(dimensions).length > 0) {
      calculatePricing(quantity, shape, dimensions);
    }
  }, [quantity, shape, dimensions, calculatePricing]);

  return (
    <div className="w-full max-w-[1600px] mx-auto">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Left Column - Fixed Image Upload */}
        <div className="lg:col-span-1">
          <div className="rounded-xl bg-neutral-900 p-2 border border-neutral-800 shadow-xl lg:sticky lg:top-4 h-[calc(100vh-8rem)] flex items-center justify-center">
            <ImageDropZone 
              shape={shape} 
              dimensions={dimensions} 
              onFileUpload={handleFileUpload}
              disabled={disabled}
              compact={false}
            />
          </div>
        </div>

        {/* Right Column - Scrollable Settings */}
        <div className="lg:col-span-1 space-y-6 lg:h-[calc(100vh-2rem)] lg:overflow-y-auto lg:pr-2">

          <div>
            <h3 className="mb-4 text-xl font-semibold text-white">Shape</h3>
            <ShapeSelector selectedShape={shape} onShapeChange={handleShapeChange} />
          </div>

          <div>
            <h3 className="mb-4 text-xl font-semibold text-white">Size</h3>
            <SizeInput 
              shape={shape} 
              dimensions={dimensions}
              onSizeChange={setDimensions} 
            />
          </div>

          <div>
            <h3 className="mb-4 text-xl font-semibold text-white">Quantity</h3>
            <QuantitySelector onQuantityChange={setQuantity} />
          </div>

          <div className="rounded-xl bg-neutral-900 p-8 border border-neutral-800 shadow-xl">
            <h3 className="mb-6 text-xl font-semibold text-white">Price Breakdown</h3>
            {pricingLoading && (
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <div className="w-40 h-5 bg-neutral-700 animate-pulse rounded-md"></div>
                    <div className="w-20 h-5 bg-neutral-700 animate-pulse rounded-md"></div>
                  </div>
                  <div className="w-full h-3 bg-neutral-700 animate-pulse rounded-md mt-2"></div>
                  <div className="w-4/5 h-3 bg-neutral-700 animate-pulse rounded-md mt-2"></div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <div className="w-48 h-5 bg-neutral-700 animate-pulse rounded-md"></div>
                    <div className="w-16 h-5 bg-neutral-700 animate-pulse rounded-md"></div>
                  </div>
                  <div className="w-full h-3 bg-neutral-700 animate-pulse rounded-md mt-2"></div>
                  <div className="w-3/4 h-3 bg-neutral-700 animate-pulse rounded-md mt-2"></div>
                </div>

                <div className="mt-6 border-t border-neutral-800 pt-6">
                  <div className="flex justify-between mb-2">
                    <div className="w-32 h-7 bg-neutral-700 animate-pulse rounded-md"></div>
                    <div className="w-24 h-7 bg-neutral-700 animate-pulse rounded-md"></div>
                  </div>
                  <div className="w-36 h-4 bg-neutral-700 animate-pulse rounded-md mt-2 ml-auto"></div>
                  
                  <div className="bg-neutral-800/50 rounded-lg p-6 mt-4 space-y-3">
                    <div className="w-56 h-4 bg-neutral-700 animate-pulse rounded-md"></div>
                    <div className="w-full h-3 bg-neutral-700 animate-pulse rounded-md"></div>
                    <div className="w-full h-3 bg-neutral-700 animate-pulse rounded-md"></div>
                    <div className="w-5/6 h-3 bg-neutral-700 animate-pulse rounded-md"></div>
                    <div className="w-3/4 h-3 bg-neutral-700 animate-pulse rounded-md"></div>
                    <div className="w-48 h-3 bg-neutral-700 animate-pulse rounded-md mt-2"></div>
                  </div>
                </div>
              </div>
            )}
            {!pricingLoading && (
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-neutral-300">Setup Cost</span>
                    <span className="font-semibold text-white text-lg">
                      ${lastPricing ? lastPricing.basePrice.toFixed(2) : '0.00'}
                    </span>
                  </div>
                <p className="text-sm text-neutral-500">
                  Base price for 500 pieces including setup and material costs.
                </p>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-neutral-300">Bulk Discount</span>
                  <span className="font-semibold text-white text-lg">
                    {lastPricing && quantity !== 500 ? `${((1 - lastPricing.scalingFactor) * 100).toFixed(1)}% off` : '—'}
                  </span>
                </div>
                <p className="text-sm text-neutral-500">
                  {lastPricing && quantity !== 500 && lastPricing.scalingFactor < 1
                    ? `Save ${((1 - lastPricing.scalingFactor) * 100).toFixed(1)}% by ordering ${quantity} pieces`
                    : 'Order more to unlock better pricing'}
                </p>
              </div>

              <div className="mt-6 border-t border-neutral-800 pt-6">
                <div className="flex justify-between mb-2">
                  <span className="text-2xl font-bold text-white">Total Price</span>
                  <span className="text-2xl font-bold text-green-400">
                    ${lastPricing ? lastPricing.totalPrice.toFixed(2) : '0.00'}
                  </span>
                </div>
                <div className="text-right text-base text-neutral-300 mb-4">
                  ${lastPricing ? (lastPricing.totalPrice / quantity).toFixed(3) : '0.000'} per piece
                </div>
                <div className="bg-neutral-800/50 rounded-lg p-6 text-sm text-neutral-400 space-y-3">
                  <p>
                    <span className="text-neutral-200 font-semibold">How this price is calculated:</span>
                  </p>
                  <p>
                    Let&apos;s break it down like a real production order. First, we need to set up the 
                    machines and prepare materials - that&apos;s our fixed cost.
                  </p>
                  <p>
                    Then, we look at the size of your {shape} sticker. The bigger it is, the more 
                    material we use, so we multiply the area by our material cost rate.
                    This gives us the base price for 500 pieces.
                  </p>
                  <p>
                    {quantity > 500
                      ? `Since you're ordering ${quantity} pieces (more than our minimum), we can offer bulk pricing.
                         The price doesn't increase linearly - you get better value per piece as you order more.`
                      : `We're calculating this for our minimum order of 500 pieces, which gives you
                         the standard base pricing.`}
                  </p>
                  {lastPricing && (
                    <p className="text-neutral-200 font-mono text-xs">
                      Final calculation: (F_S + k_S × {lastPricing.area.toFixed(1)} cm²) 
                      × ({quantity}/500)^{lastPricing.appliedParams.delta.toFixed(2)} = ${lastPricing.totalPrice.toFixed(2)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  );
} 