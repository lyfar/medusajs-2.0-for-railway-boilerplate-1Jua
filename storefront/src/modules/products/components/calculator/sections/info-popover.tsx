'use client'

import { Popover, Transition } from "@headlessui/react"
import { Info } from "lucide-react"
import { Fragment } from "react"
import clsx from "clsx"

type InfoPopoverProps = {
  title: string
  description: string
  variant?: "light" | "dark"
  size?: "sm" | "md"
}

const variantStyles = {
  light: {
    button:
      "text-blue-700 hover:text-blue-900 border-blue-200 hover:border-blue-300 bg-blue-50 hover:bg-blue-100 ring-blue-200",
    panel: "border-ui-border-subtle bg-ui-bg-base text-ui-fg-base shadow-lg",
    strongText: "text-ui-fg-base",
    mutedText: "text-ui-fg-muted",
  },
  dark: {
    button:
      "text-white border-white/30 hover:border-white/50 bg-white/10 hover:bg-white/15 ring-white/30",
    panel: "border-neutral-800 bg-neutral-900 text-white shadow-xl",
    strongText: "text-white",
    mutedText: "text-neutral-300",
  },
} as const

const sizeStyles = {
  sm: "h-7 w-7 text-[11px]",
  md: "h-8 w-8 text-xs",
} as const

export function InfoPopover({ title, description, variant = "light", size = "md" }: InfoPopoverProps) {
  const styles = variantStyles[variant]

  return (
    <Popover className="relative">
      <Popover.Button
        className={clsx(
          "flex items-center justify-center rounded-full border transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ui-border-strong",
          styles.button,
          sizeStyles[size]
        )}
        aria-label={`${title} info`}
      >
        <Info className="h-4 w-4" aria-hidden />
      </Popover.Button>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-150"
        enterFrom="opacity-0 translate-y-1"
        enterTo="opacity-100 translate-y-0"
        leave="transition ease-in duration-100"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 translate-y-1"
      >
        <Popover.Panel className={clsx("absolute z-40 mt-2 w-72 rounded-xl border p-4", styles.panel)}>
          <p className={clsx("text-xs font-semibold", styles.strongText)}>{title}</p>
          <p className={clsx("mt-1 text-[11px] leading-relaxed", styles.mutedText)}>{description}</p>
        </Popover.Panel>
      </Transition>
    </Popover>
  )
}
