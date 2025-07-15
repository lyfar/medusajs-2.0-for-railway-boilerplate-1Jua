import { clx } from "@medusajs/ui"

const Divider = ({ className }: { className?: string }) => (
  <div
    className={clx("h-px w-full border-b border-gray-600 dark:border-gray-700 mt-1", className)}
  />
)

export default Divider
