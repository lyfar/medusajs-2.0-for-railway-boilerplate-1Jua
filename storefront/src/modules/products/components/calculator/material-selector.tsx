'use client';

import clsx from 'clsx';
import { Material } from './types';
import {
  EggShellPreview,
  HologramEggShellPreview,
  GoldSilverFoilPreview,
  TransparentEggShellPreview,
  UvGlossPreview,
  VinylPreview
} from './material-previews';

interface MaterialSelectorProps {
  selectedMaterial: Material;
  onMaterialChange: (material: Material) => void;
  layout?: 'default' | 'horizontal';
}

type MaterialOption = {
  value: Material;
  label: string;
  description?: string;
  Preview: React.ComponentType<{ className?: string }>;
};

export const materials: MaterialOption[] = [
  { value: 'egg_shell', label: 'Egg Shell', description: '(Same price no changes)', Preview: EggShellPreview },
  { value: 'hologram_egg_shell', label: 'Hologram Egg Shell', description: '(x1.3)', Preview: HologramEggShellPreview },
  { value: 'gold_silver_foil', label: 'Gold or Silver foil', description: '(x1.3)', Preview: GoldSilverFoilPreview },
  { value: 'transparent_egg_shell', label: 'Transparent Egg Shell', description: '(x1.3)', Preview: TransparentEggShellPreview },
  { value: 'uv_gloss', label: 'UV gloss', description: '(x1.3)', Preview: UvGlossPreview },
  { value: 'vinyl', label: 'Vinyl', description: '(Same price no changes)', Preview: VinylPreview },
];

export default function MaterialSelector({ selectedMaterial, onMaterialChange, layout = 'default' }: MaterialSelectorProps) {
  const isHorizontal = layout === 'horizontal';

  return (
    <div className={clsx(
      isHorizontal ? "flex overflow-x-auto snap-x snap-mandatory gap-3 pb-1 no-scrollbar" : "grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-2"
    )}>
      {materials.map((option) => {
        const isSelected = selectedMaterial === option.value;
        const Preview = option.Preview;
        return (
          <button
            key={option.value}
            onClick={() => onMaterialChange(option.value)}
            className={clsx(
              "group flex items-center rounded-rounded border text-left transition-all",
              isHorizontal ? "snap-start shrink-0 p-2 gap-2 min-w-[160px]" : "h-full p-3 gap-3 text-sm",
              isSelected
                ? "border-indigo-400 ring-2 ring-indigo-500/40 shadow-md bg-neutral-950 text-white"
                : "border-neutral-700 bg-neutral-950 text-neutral-200 hover:border-neutral-500 hover:bg-neutral-900"
            )}
          >
            <div className={clsx(
              "relative flex shrink-0 items-center justify-center overflow-hidden rounded-md border border-white/10 bg-neutral-900 shadow-sm ring-1 ring-white/10",
              isHorizontal ? "h-8 w-8" : "h-12 w-12"
            )}>
              <Preview className="h-full w-full" />
            </div>

            <div className="flex flex-col items-start justify-center gap-0.5">
              <span className={clsx(
                "font-semibold",
                isHorizontal ? "text-[10px] leading-tight" : "text-xs",
                isSelected ? "text-white" : "text-neutral-100"
              )}>
                {option.label}
              </span>
              {!isHorizontal && option.description && (
                <span className={clsx("text-[10px]", isSelected ? "text-neutral-200" : "text-neutral-500")}>
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
