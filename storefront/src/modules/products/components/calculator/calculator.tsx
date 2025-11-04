'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Shape } from './shape-selector';
import { Dimensions } from './types';
import { DesignDraftState } from './utils/design-storage';
import { type AutoConfigureSuggestion } from './image-drop-zone';
import { deriveOrientation, applyOrientationToDimensions, supportsOrientation, type Orientation } from './orientation';
import {
  DesignUploadSection,
  QuantitySection,
  ShapeSection,
  SizeSection,
} from './sections';

interface CalculatorProps {
  onStateChange?: (
    shape: Shape,
    dimensions: Dimensions,
    quantity: number,
    designDraft: DesignDraftState | null
  ) => void;
  disabled?: boolean;
}

const defaultDimensions: Record<Shape, Dimensions> = {
  rectangle: { width: 10, height: 6 },
  square: { width: 8, height: 8 },
  circle: { diameter: 10 },
  diecut: { width: 10, height: 6 },
};

export default function Calculator({ onStateChange, disabled }: CalculatorProps) {
  const [shape, setShape] = useState<Shape>('rectangle');
  const [dimensions, setDimensions] = useState<Dimensions>({});
  const [orientation, setOrientation] = useState<Orientation>(deriveOrientation('rectangle', defaultDimensions.rectangle));
  const [quantity, setQuantity] = useState(500);
  const [designDraft, setDesignDraft] = useState<DesignDraftState | null>(null);
  const skipDefaultDimensionsRef = useRef(false);

  useEffect(() => {
    if (skipDefaultDimensionsRef.current) {
      skipDefaultDimensionsRef.current = false;
      return;
    }
    const baseDimensions = defaultDimensions[shape];
    setDimensions(baseDimensions);
    setOrientation(deriveOrientation(shape, baseDimensions));
  }, [shape]);

  useEffect(() => {
    if (onStateChange) {
      onStateChange(shape, dimensions, quantity, designDraft);
    }
  }, [shape, dimensions, quantity, designDraft, onStateChange]);

  const handleShapeChange = useCallback((newShape: Shape) => {
    setShape(newShape);
  }, []);

  const handleSizeChange = useCallback((updatedDimensions: Dimensions) => {
    if (supportsOrientation(shape, updatedDimensions)) {
      setDimensions(applyOrientationToDimensions(updatedDimensions, orientation));
    } else {
      setDimensions(updatedDimensions);
      setOrientation(deriveOrientation(shape, updatedDimensions));
    }
  }, [orientation, shape]);

  const handleQuantityChange = useCallback((updatedQuantity: number) => {
    setQuantity(updatedQuantity);
  }, []);

  const handleDesignChange = useCallback((draft: DesignDraftState | null) => {
    setDesignDraft(draft);
    if (draft?.dimensions) {
      setOrientation(deriveOrientation(draft.shape ?? shape, draft.dimensions));
    }
  }, [shape]);

  const handleAutoConfigure = useCallback((suggestion: AutoConfigureSuggestion) => {
    skipDefaultDimensionsRef.current = true;
    setShape(suggestion.shape);
    setDimensions(suggestion.dimensions);
    setOrientation(suggestion.orientation ?? deriveOrientation(suggestion.shape, suggestion.dimensions));
  }, []);

  const handleOrientationChange = useCallback((nextOrientation: Orientation) => {
    if (!supportsOrientation(shape, dimensions)) {
      return;
    }
    skipDefaultDimensionsRef.current = true;
    setOrientation(nextOrientation);
    setDimensions((prev) => applyOrientationToDimensions(prev, nextOrientation));
  }, [shape, dimensions]);


  return (
    <div className="space-y-6">
      <DesignUploadSection
        shape={shape}
        dimensions={dimensions}
        onDesignChange={handleDesignChange}
        onAutoConfigure={handleAutoConfigure}
        orientation={orientation}
        onOrientationChange={supportsOrientation(shape, dimensions) ? handleOrientationChange : undefined}
        disabled={disabled}
      />

      <ShapeSection shape={shape} onShapeChange={handleShapeChange} />
      <SizeSection shape={shape} dimensions={dimensions} onSizeChange={handleSizeChange} />
      <QuantitySection onQuantityChange={handleQuantityChange} />
    </div>
  );
}
