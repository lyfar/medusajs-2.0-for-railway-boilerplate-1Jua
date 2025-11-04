'use client';

import clsx from 'clsx';
import { Circle, Hexagon, Square } from 'lucide-react';

export type Shape = 'rectangle' | 'square' | 'circle' | 'diecut';

interface ShapeSelectorProps {
  selectedShape: Shape;
  onShapeChange: (shape: Shape) => void;
}

type ShapeOption = {
  value: Shape;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

export const shapes: ShapeOption[] = [
  { value: 'rectangle', label: 'Rectangle', icon: RectangleIcon },
  { value: 'square', label: 'Square', icon: Square },
  { value: 'circle', label: 'Circle', icon: Circle },
  { value: 'diecut', label: 'Die Cut', icon: Hexagon }
];

// Custom rectangle icon component
function RectangleIcon({ className }: { className?: string }) {
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
      <rect x="4" y="6" width="16" height="12" rx="2" />
    </svg>
  );
}

export default function ShapeSelector({ selectedShape, onShapeChange }: ShapeSelectorProps) {
  return (
    <div className="space-y-4">
      <div className="grid auto-rows-fr grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {shapes.map((shape) => {
          const Icon = shape.icon;
          const isSelected = selectedShape === shape.value;
          return (
            <button
              key={shape.value}
              onClick={() => onShapeChange(shape.value)}
              className={clsx(
                "flex h-full w-full flex-col items-center justify-center gap-2 rounded-rounded border px-4 py-3 text-sm font-medium transition-colors",
                isSelected
                  ? "border-ui-border-strong bg-ui-bg-field text-ui-fg-base shadow-elevation-card-hover"
                  : "border-ui-border-base bg-ui-bg-subtle text-ui-fg-subtle hover:bg-ui-bg-base hover:text-ui-fg-base"
              )}
            >
              <Icon
                className={clsx(
                  "h-8 w-8",
                  isSelected ? "text-ui-fg-base" : "text-ui-fg-subtle"
                )}
              />
              <span
                className={clsx(
                  "text-xs",
                  isSelected ? "text-ui-fg-base" : "text-ui-fg-subtle"
                )}
              >
                {shape.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
} 
