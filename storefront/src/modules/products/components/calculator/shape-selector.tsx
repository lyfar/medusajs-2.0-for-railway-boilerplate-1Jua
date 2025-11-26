'use client';

import clsx from 'clsx';
import { Circle, Hexagon, Square } from 'lucide-react';

export type Shape = 'rectangle' | 'square' | 'circle' | 'diecut';

interface ShapeSelectorProps {
  selectedShape: Shape;
  onShapeChange: (shape: Shape) => void;
  layout?: 'default' | 'horizontal';
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
  { value: 'diecut', label: 'Irregular', icon: Hexagon }
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

export default function ShapeSelector({ selectedShape, onShapeChange, layout = 'default' }: ShapeSelectorProps) {
  const isHorizontal = layout === 'horizontal';

  return (
    <div className="space-y-4">
      <div className={clsx(
        isHorizontal ? "flex overflow-x-auto snap-x snap-mandatory gap-3 pb-1 no-scrollbar" : "grid auto-rows-fr grid-cols-2 gap-3 sm:grid-cols-2 xl:grid-cols-4"
      )}>
        {shapes.map((shape) => {
          const Icon = shape.icon;
          const isSelected = selectedShape === shape.value;
          return (
            <button
              key={shape.value}
              onClick={() => onShapeChange(shape.value)}
              className={clsx(
                "flex flex-col items-center justify-center gap-2 rounded-rounded border transition-all text-sm font-medium",
                isHorizontal ? "snap-start shrink-0 w-[88px] h-[88px] p-2" : "h-full w-full px-4 py-3",
                isSelected
                  ? "border-indigo-400 ring-2 ring-indigo-500/40 bg-neutral-950 text-white shadow-md"
                  : "border-neutral-700 bg-neutral-950 text-neutral-200 hover:border-neutral-500 hover:bg-neutral-900"
              )}
            >
              <Icon
                className={clsx(
                  "h-8 w-8",
                  isSelected ? "text-white" : "text-neutral-300"
                )}
              />
              <span
                className={clsx(
                  "text-xs",
                  isSelected ? "text-white" : "text-neutral-300"
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
