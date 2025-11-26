'use client';

import clsx from 'clsx';
import { Peeling } from './types';

interface PeelingSelectorProps {
  selectedPeeling: Peeling;
  onPeelingChange: (peeling: Peeling) => void;
  layout?: 'default' | 'horizontal';
}

type PeelingOption = {
  value: Peeling;
  label: string;
  description?: string;
};

const peelingVisuals: Record<Peeling, { icon: JSX.Element }> = {
  easy_peel: {
    icon: (
      <div className="relative h-6 w-6 text-white">
        <div className="absolute inset-0 rounded-[5px] border border-white/50" />
        <div className="absolute bottom-[1px] right-[1px] h-2.5 w-2.5 rotate-12 rounded-sm border border-white/50" />
      </div>
    ),
  },
  individual_cut: {
    icon: (
      <div className="grid grid-cols-2 gap-[3px] text-white">
        <div className="h-3 w-3 rounded-[4px] border border-white/60" />
        <div className="h-3 w-3 rounded-[4px] border border-white/50" />
        <div className="h-3 w-3 rounded-[4px] border border-white/50" />
        <div className="h-3 w-3 rounded-[4px] border border-white/40" />
      </div>
    ),
  },
};

export const peelingOptions: PeelingOption[] = [
  { value: 'easy_peel', label: 'Easy peel', description: '(Same price no changes)' },
  { value: 'individual_cut', label: 'Individual cut', description: '(Same price no changes)' },
];

export default function PeelingSelector({ selectedPeeling, onPeelingChange, layout = 'default' }: PeelingSelectorProps) {
  const isHorizontal = layout === 'horizontal';

  return (
    <div className={clsx(
      isHorizontal ? "flex overflow-x-auto snap-x snap-mandatory gap-3 pb-1 no-scrollbar" : "grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-2"
    )}>
      {peelingOptions.map((option) => {
        const isSelected = selectedPeeling === option.value;
        return (
          <button
            key={option.value}
            onClick={() => onPeelingChange(option.value)}
            className={clsx(
              "group flex items-center rounded-rounded border text-left transition-all",
              isHorizontal ? "snap-start shrink-0 p-2 gap-2 min-w-[160px]" : "h-full px-3.5 py-3 gap-3 text-sm",
              isSelected
                ? "border-indigo-400 ring-2 ring-indigo-500/40 shadow-md bg-neutral-950 text-white"
                : "border-neutral-700 bg-neutral-950 text-neutral-200 hover:border-neutral-500 hover:bg-neutral-900"
            )}
          >
            <div
              className={clsx(
                "relative flex shrink-0 items-center justify-center overflow-hidden rounded-md border border-white/10 bg-neutral-900 shadow-sm ring-1 ring-white/10",
                isHorizontal ? "h-8 w-8" : "h-12 w-12",
                isSelected && "ring-indigo-400/60 border-indigo-300/70"
              )}
            >
              {peelingVisuals[option.value].icon}
            </div>

            <div className="flex flex-col gap-0.5">
              <span className={clsx(
                "font-semibold",
                isHorizontal ? "text-[10px] leading-tight" : "text-xs",
                isSelected ? "text-white" : "text-neutral-100"
              )}>
                {option.label}
              </span>
              {!isHorizontal && option.description && (
                <span className={clsx("text-[10px] leading-tight", isSelected ? "text-neutral-200" : "text-neutral-500")}>
                  {option.description}
                </span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
