'use client';

import clsx from 'clsx';
import { useEffect, useState } from 'react';
import ImageDropZone from './image-drop-zone';
import QuantitySelector from './quantity-selector';
import ShapeSelector, { Shape, shapes } from './shape-selector';
import SizeInput from './size-input';

// Default pricing parameters
const defaultPricingParams = {
  rectangle: { F_S: 100, k_S: 0.5, delta: 0.8 },
  square: { F_S: 100, k_S: 0.5, delta: 0.8 },
  circle: { F_S: 120, k_S: 0.6, delta: 0.8 },
  diecut: { F_S: 150, k_S: 0.7, delta: 0.8 }
};

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
  const [totalPrice, setTotalPrice] = useState(0);
  const [basePrice, setBasePrice] = useState(0);
  const [scalingFactor, setScalingFactor] = useState(1);
  const [pricingParams, setPricingParams] = useState(defaultPricingParams);
  const [uploadedFileKey, setUploadedFileKey] = useState<string | null>(null);
  const [uploadedPublicUrl, setUploadedPublicUrl] = useState<string | null>(null);

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

  const calculateArea = (dims: Dimensions, currentShape: Shape): number => {
    if (currentShape === 'circle' && dims.diameter) {
      return Math.PI * Math.pow(dims.diameter / 2, 2);
    } else if (dims.width && dims.height) {
      return dims.width * dims.height;
    }
    return 0;
  };

  const handleParamChange = (shapeType: Shape, param: keyof PricingParams, value: string) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return;

    // Update pricing parameters
    const newParams = {
      ...pricingParams,
      [shapeType]: {
        ...pricingParams[shapeType],
        [param]: numValue
      }
    };
    
    setPricingParams(newParams);

    // Immediately recalculate prices with new parameters if we're modifying the current shape
    if (shapeType === shape) {
      const area = calculateArea(dimensions, shape);
      if (area === 0) return;

      const currentParams = newParams[shape];
      const base = currentParams.F_S + currentParams.k_S * area;
      const scaling = Math.pow(quantity / 500, currentParams.delta);
      
      setBasePrice(base);
      setScalingFactor(scaling);
      setTotalPrice(base * scaling);
    }
  };

  const calculatePrices = (params: typeof pricingParams, currentShape: Shape, dims: Dimensions, qty: number) => {
    const area = calculateArea(dims, currentShape);
    if (area === 0) return;

    const currentParams = params[currentShape];
    const base = currentParams.F_S + currentParams.k_S * area;
    
    // Calculate scaling factor using the delta parameter
    const scaling = Math.pow(qty / 500, currentParams.delta);
    
    setBasePrice(base);
    setScalingFactor(scaling);
    setTotalPrice(base * scaling);
  };

  const resetParams = () => {
    setPricingParams(defaultPricingParams);
  };

  // Update prices whenever any relevant state changes
  useEffect(() => {
    calculatePrices(pricingParams, shape, dimensions, quantity);
  }, [shape, dimensions, quantity, pricingParams]);

  return (
    <div className="w-full max-w-[1600px] mx-auto">
      <div className="grid grid-cols-1 gap-8 xl:grid-cols-3">
        <div className="xl:col-span-2 space-y-8">
          <div>
            <h2 className="mb-4 text-2xl font-bold text-white">Customize Your Sticker</h2>
          </div>

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
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-neutral-300">Base Price (500 pieces)</span>
                  <span className="font-semibold text-white text-lg">
                    ${basePrice.toFixed(2)}
                  </span>
                </div>
                <p className="text-sm text-neutral-500">
                  This is your starting point - the cost for a minimum order of 500 pieces.
                  It combines the setup cost (F_S = ${pricingParams[shape].F_S}) and the size-based cost 
                  (k_S = ${pricingParams[shape].k_S} × Area).
                </p>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-neutral-300">Quantity Scaling Factor</span>
                  <span className="font-semibold text-white text-lg">
                    {scalingFactor.toFixed(3)}x
                  </span>
                </div>
                <p className="text-sm text-neutral-500">
                  This shows how the price scales with quantity. With delta = {pricingParams[shape].delta.toFixed(2)}, 
                  {quantity === 500 
                    ? ` this is the base price for 500 pieces.`
                    : scalingFactor < 1 
                      ? ` you're getting a ${((1 - scalingFactor) * 100).toFixed(1)}% discount for ordering ${quantity} pieces.`
                      : ` the price is adjusted up by ${((scalingFactor - 1) * 100).toFixed(1)}% for ordering ${quantity} pieces.`}
                </p>
              </div>

              <div className="mt-6 border-t border-neutral-800 pt-6">
                <div className="flex justify-between mb-2">
                  <span className="text-2xl font-bold text-white">Total Price</span>
                  <span className="text-2xl font-bold text-green-400">
                    ${totalPrice.toFixed(2)}
                  </span>
                </div>
                <div className="text-right text-base text-neutral-300 mb-4">
                  ${(totalPrice / quantity).toFixed(3)} per piece
                </div>
                <div className="bg-neutral-800/50 rounded-lg p-6 text-sm text-neutral-400 space-y-3">
                  <p>
                    <span className="text-neutral-200 font-semibold">How this price is calculated:</span>
                  </p>
                  <p>
                    Let's break it down like a real production order. First, we need to set up the 
                    machines and prepare materials - that's our fixed cost of ${pricingParams[shape].F_S}.
                  </p>
                  <p>
                    Then, we look at the size of your {shape} sticker. The bigger it is, the more 
                    material we use, so we multiply the area by ${pricingParams[shape].k_S} (our material cost rate).
                    This gives us the base price for 500 pieces.
                  </p>
                  <p>
                    {quantity > 500 
                      ? `Since you're ordering ${quantity} pieces (more than our minimum), we can offer bulk pricing.
                         With our scaling factor of ${pricingParams[shape].delta}, the price doesn't increase linearly -
                         you get better value per piece as you order more.`
                      : `We're calculating this for our minimum order of 500 pieces, which gives you
                         the standard base pricing.`}
                  </p>
                  <p className="text-neutral-200 font-mono text-xs">
                    Final calculation: (${pricingParams[shape].F_S} + ${pricingParams[shape].k_S} × {calculateArea(dimensions, shape).toFixed(1)} cm²) 
                    × ({quantity}/500)^{pricingParams[shape].delta} = ${totalPrice.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="xl:col-span-1 space-y-6">
          <div className="rounded-xl bg-neutral-900 p-8 border border-neutral-800 shadow-xl">
            <ImageDropZone 
              shape={shape} 
              dimensions={dimensions} 
              onFileUpload={handleFileUpload}
              disabled={disabled}
            />
          </div>

          <div className="rounded-xl bg-neutral-900 p-8 border border-neutral-800 shadow-xl">
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold text-white">Admin Controls</h3>
                  <button
                    onClick={resetParams}
                    className="px-4 py-2 text-sm bg-neutral-800 text-white rounded-lg hover:bg-neutral-700 transition-colors shadow-md"
                    disabled={disabled}
                  >
                    Reset to Defaults
                  </button>
                </div>
                
                <div className="grid grid-cols-4 gap-3 mb-6">
                  {shapes.map((shapeOption) => {
                    const Icon = shapeOption.icon;
                    return (
                      <button
                        key={shapeOption.value}
                        onClick={() => setShape(shapeOption.value)}
                        className={clsx(
                          'rounded-lg p-3 flex items-center justify-center transition-all shadow-md',
                          {
                            'bg-neutral-700 text-white border-2 border-neutral-600': shape === shapeOption.value,
                            'bg-neutral-800 text-neutral-400 border border-neutral-700 hover:bg-neutral-700 hover:text-white': shape !== shapeOption.value
                          }
                        )}
                        aria-label={shapeOption.label}
                        disabled={disabled}
                      >
                        <Icon className="h-6 w-6" />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="flex justify-between items-start mb-2">
                  <label className="block text-sm font-medium text-neutral-300">
                    Fixed Cost (F_S)
                  </label>
                  <span className="text-sm text-neutral-400">${pricingParams[shape].F_S}</span>
                </div>
                <p className="text-xs text-neutral-500 mb-3">
                  The minimum cost to start production, regardless of size. Covers setup, materials preparation, and basic handling.
                </p>
                <input
                  type="range"
                  value={pricingParams[shape].F_S}
                  onChange={(e) => handleParamChange(shape, 'F_S', e.target.value)}
                  className="w-full accent-green-400"
                  min="50"
                  max="300"
                  step="10"
                  disabled={disabled}
                />
                <div className="flex justify-between text-xs text-neutral-600 mt-2">
                  <span>$50</span>
                  <span>$300</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-start mb-2">
                  <label className="block text-sm font-medium text-neutral-300">
                    Variable Cost (k_S)
                  </label>
                  <span className="text-sm text-neutral-400">{pricingParams[shape].k_S}</span>
                </div>
                <p className="text-xs text-neutral-500 mb-3">
                  Cost multiplier based on the sticker's area. Higher values mean the price increases more with size.
                </p>
                <input
                  type="range"
                  value={pricingParams[shape].k_S}
                  onChange={(e) => handleParamChange(shape, 'k_S', e.target.value)}
                  className="w-full accent-green-400"
                  min="0.1"
                  max="5"
                  step="0.1"
                  disabled={disabled}
                />
                <div className="flex justify-between text-xs text-neutral-600 mt-2">
                  <span>0.1</span>
                  <span>5.0</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-start mb-2">
                  <label className="block text-sm font-medium text-neutral-300">
                    Scaling Exponent (delta)
                  </label>
                  <span className="text-sm text-neutral-400">{pricingParams[shape].delta}</span>
                </div>
                <p className="text-xs text-neutral-500 mb-3">
                  Controls how price scales with quantity. Values below 1 give bulk discounts, above 1 increase costs for larger quantities.
                </p>
                <input
                  type="range"
                  value={pricingParams[shape].delta}
                  onChange={(e) => handleParamChange(shape, 'delta', e.target.value)}
                  className="w-full accent-green-400"
                  min="0.3"
                  max="1.5"
                  step="0.05"
                  disabled={disabled}
                />
                <div className="flex justify-between text-xs text-neutral-600 mt-2">
                  <span>0.3</span>
                  <span>1.5</span>
                </div>
              </div>

              <div className="border-t border-neutral-800 pt-4">
                <p className="text-xs text-neutral-500 font-mono">
                  Formula: Total Price = (${pricingParams[shape].F_S} + {pricingParams[shape].k_S} × Area) × (Quantity/500)^{pricingParams[shape].delta}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 