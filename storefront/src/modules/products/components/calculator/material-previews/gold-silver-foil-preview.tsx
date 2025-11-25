import clsx from "clsx"

export const GoldSilverFoilPreview = ({ className }: { className?: string }) => {
  return (
    <div className={clsx("relative h-full w-full overflow-hidden rounded-md", className)}>
      {/* Split gold/silver base with brighter sheen */}
      <div className="absolute inset-0 bg-[linear-gradient(140deg,#d6af3a_0%,#e6c671_28%,#f6f3e7_50%,#d1d1d6_72%,#c2c2c6_100%)]" />

      {/* Brushed metal texture */}
      <div
        className="absolute inset-0 opacity-50 mix-blend-multiply"
        style={{
          backgroundImage:
            "repeating-linear-gradient(115deg, rgba(255,255,255,0.3) 0px, rgba(255,255,255,0.3) 4px, rgba(0,0,0,0.08) 8px, rgba(0,0,0,0.08) 12px)",
        }}
      />

      {/* Specular flares */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(255,255,255,0.7),rgba(255,255,255,0)_35%),radial-gradient(circle_at_80%_70%,rgba(255,255,255,0.55),rgba(255,255,255,0)_32%)]" />

      {/* Depth vignette */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/15 via-transparent to-black/25" />
    </div>
  )
}
