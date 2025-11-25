import clsx from "clsx"

export const EggShellPreview = ({ className }: { className?: string }) => {
  return (
    <div className={clsx("relative h-full w-full overflow-hidden rounded-md bg-[#fdfbf7]", className)}>
      {/* Warm matte paper base */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#fffdfa] via-[#f8f1e5] to-[#f0e6d8]" />

      {/* Speckled eggshell texture */}
      <div
        className="absolute inset-0 opacity-40 mix-blend-multiply"
        style={{
          backgroundImage: `radial-gradient(rgba(120,98,76,0.15) 0.6px, transparent 1px), radial-gradient(rgba(120,98,76,0.12) 0.5px, transparent 1px)`,
          backgroundSize: "14px 14px, 18px 18px",
          backgroundPosition: "2px 4px, -4px 8px",
        }}
      />

      {/* Soft light falloff */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-transparent to-black/5" />
    </div>
  )
}
