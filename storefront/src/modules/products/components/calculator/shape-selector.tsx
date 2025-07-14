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
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {shapes.map((shape) => {
          const Icon = shape.icon;
          return (
            <button
              key={shape.value}
              onClick={() => onShapeChange(shape.value)}
              className={clsx(
                'rounded-lg px-4 py-2 text-sm font-medium transition-colors flex items-center justify-between',
                {
                  'bg-neutral-800 text-white border border-neutral-700': selectedShape === shape.value,
                  'bg-neutral-900 text-neutral-300 border border-neutral-800 hover:bg-neutral-800': selectedShape !== shape.value
                }
              )}
            >
              <span>{shape.label}</span>
              <Icon className={clsx('h-6 w-6 ml-2', {
                'text-white': selectedShape === shape.value,
                'text-neutral-500': selectedShape !== shape.value
              })} />
            </button>
          );
        })}
      </div>
    </div>
  );
} 