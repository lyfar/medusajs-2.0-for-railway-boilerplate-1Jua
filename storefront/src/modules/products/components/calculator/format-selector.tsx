'use client';

import clsx from 'clsx';
import { Format } from './types';

interface FormatSelectorProps {
  selectedFormat: Format;
  onFormatChange: (format: Format) => void;
}

type FormatOption = {
  value: Format;
  label: string;
  description?: string;
};

const formatVisuals: Record<Format, { bg: string; ring: string; icon: JSX.Element }> = {
  sheets: {
    bg: 'bg-neutral-950',
    ring: 'ring-neutral-500/60',
    icon: (
      <div className="relative h-6 w-6 text-white">
        <span className="absolute inset-0 translate-x-[3px] translate-y-[3px] rounded-[4px] border border-white/30" />
        <span className="absolute inset-0 translate-x-[1.5px] translate-y-[1.5px] rounded-[4px] border border-white/40" />
        <span className="absolute inset-0 rounded-[4px] border border-white/70 bg-white/5" />
      </div>
    ),
  },
  rolls: {
    bg: 'bg-neutral-950',
    ring: 'ring-amber-400/60',
    icon: (
      <div className="relative h-6 w-6 text-white">
        <div className="absolute inset-0 rounded-full border border-white/60" />
        <div className="absolute inset-[3px] rounded-full border border-amber-200/70" />
        <div className="absolute right-[-2px] top-[6px] h-3 w-5 rounded-full border border-amber-100/70 bg-white/5" />
      </div>
    ),
  },
};

export const formats: FormatOption[] = [
  { value: 'sheets', label: 'Sheets', description: '(Same price no changes)' },
  { value: 'rolls', label: 'Rolls', description: '(Same price no changes)' },
];

export default function FormatSelector({ selectedFormat, onFormatChange }: FormatSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-2">
      {formats.map((option) => {
        const isSelected = selectedFormat === option.value;
        return (
          <button
            key={option.value}
            onClick={() => onFormatChange(option.value)}
            className={clsx(
              "group flex items-center gap-3 rounded-rounded border px-3.5 py-3 text-left text-sm transition-all h-full",
              isSelected
                ? "border-indigo-400 ring-2 ring-indigo-500/40 shadow-md bg-neutral-950 text-white"
                : "border-neutral-700 bg-neutral-950 text-neutral-200 hover:border-neutral-500 hover:bg-neutral-900"
            )}
          >
            <div
              className={clsx(
                "relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-md border border-white/10 bg-neutral-900 shadow-sm ring-1 ring-white/10",
                formatVisuals[option.value].bg,
                isSelected && formatVisuals[option.value].ring
              )}
            >
              {formatVisuals[option.value].icon}
            </div>

            <div className="flex flex-col gap-0.5">
              <span className={clsx("font-semibold text-xs", isSelected ? "text-white" : "text-neutral-100")}>{option.label}</span>
              {option.description && (
                <span className={clsx("text-[11px] leading-tight", isSelected ? "text-neutral-200" : "text-neutral-400")}>
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
