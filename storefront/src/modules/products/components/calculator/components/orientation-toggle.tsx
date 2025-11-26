'use client'

import clsx from "clsx"
import { Orientation } from "../orientation"

interface OrientationToggleProps {
  current: Orientation
  onChange?: (orientation: Orientation) => void
  className?: string
  layout?: "horizontal" | "vertical"
}

export const OrientationToggle = ({ current, onChange, className, layout = "horizontal" }: OrientationToggleProps) => {
  const isVertical = layout === "vertical"

  return (
    <div
      className={clsx(
        "gap-3",
        isVertical ? "flex flex-col w-full" : "flex items-center justify-center",
        className
      )}
    >
      {(["portrait", "landscape"] as Orientation[]).map((option) => {
        const isSelected = current === option
        const isPortrait = option === "portrait"

        return (
          <button
            key={option}
            type="button"
            onClick={() => onChange?.(option)}
            disabled={!onChange}
            aria-label={option === "portrait" ? "Portrait orientation" : "Landscape orientation"}
            title={option === "portrait" ? "Portrait orientation" : "Landscape orientation"}
            className={clsx(
              "relative flex items-center justify-center rounded-md border text-[11px] font-medium uppercase tracking-wide transition",
              isVertical ? "h-11 w-full" : "h-12 w-12",
              isSelected
                ? "border-indigo-300 bg-indigo-800/60 text-indigo-100 shadow-md"
                : "border-neutral-600/70 bg-neutral-800/70 text-neutral-300 hover:border-neutral-500 hover:text-neutral-100",
              !onChange && "cursor-not-allowed opacity-60"
            )}
          >
            <div
              className={clsx(
                "pointer-events-none block rounded-[3px] border",
                isPortrait ? "h-7 w-3" : "h-3 w-7",
                isSelected ? "border-white/80 bg-white/20" : "border-neutral-200/60 bg-neutral-100/10"
              )}
            />
          </button>
        )
      })}
    </div>
  )
}
