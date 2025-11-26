'use client'

import clsx from "clsx"

interface StickerFlowCanvasProps {
  children: React.ReactNode
  className?: string
}

export function StickerFlowCanvas({ children, className }: StickerFlowCanvasProps) {
  return (
    <div
      className={clsx(
        "relative h-full w-full overflow-hidden rounded-2xl bg-transparent",
        "bg-[radial-gradient(circle_at_center,#2e2f36_1px,transparent_1px)] bg-[length:26px_26px]",
        className
      )}
    >
      <div className="pointer-events-auto absolute inset-0">{children}</div>
    </div>
  )
}
