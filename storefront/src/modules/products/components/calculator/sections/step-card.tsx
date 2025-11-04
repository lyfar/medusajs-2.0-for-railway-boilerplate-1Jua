import { clx } from "@medusajs/ui"
import { PropsWithChildren } from "react"

interface StepCardProps extends PropsWithChildren {
  step?: number
  title: string
  description?: string
  className?: string
  contentClassName?: string
}

export default function StepCard({
  step,
  title,
  description,
  className,
  contentClassName,
  children,
}: StepCardProps) {
  return (
    <div className={clx("rounded-2xl border border-neutral-800 bg-neutral-900 p-6 shadow-xl", className)}>
      <div className="flex items-start gap-4">
        {typeof step !== "undefined" && (
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-purple-600 text-base font-semibold text-white">
            {step}
          </div>
        )}
        <div className="space-y-1">
          <h3 className="text-xl font-semibold text-white">{title}</h3>
          {description && <p className="text-sm text-neutral-400">{description}</p>}
        </div>
      </div>

      <div className={clx("mt-6", contentClassName)}>{children}</div>
    </div>
  )
}
