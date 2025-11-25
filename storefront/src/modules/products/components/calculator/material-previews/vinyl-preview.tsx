import clsx from "clsx"

export const VinylPreview = ({ className }: { className?: string }) => {
  return (
    <div className={clsx("relative h-full w-full overflow-hidden rounded-md bg-white", className)}>
      {/* Smooth white vinyl base with a faint warm cast */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#fdfdfc] via-[#f7f8fa] to-[#eef0f3]" />

      {/* Subtle horizontal cast that mimics the sheet grain */}
      <div
        className="absolute inset-0 opacity-50"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, rgba(255,255,255,0.7) 0px, rgba(255,255,255,0.7) 2px, rgba(0,0,0,0) 7px)",
        }}
      />

      {/* Soft gloss sweep to convey lamination */}
      <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0)_30%,rgba(255,255,255,0.75)_50%,rgba(255,255,255,0)_70%)] opacity-80 mix-blend-screen" />

      {/* Gentle edge shading for depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/5 via-transparent to-black/10" />
    </div>
  )
}
