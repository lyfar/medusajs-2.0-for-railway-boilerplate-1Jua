import clsx from "clsx"

export const TransparentEggShellPreview = ({ className }: { className?: string }) => {
  return (
    <div className={clsx("relative h-full w-full overflow-hidden rounded-md bg-neutral-100", className)}>
      {/* Transparency Grid */}
      <div 
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage: `linear-gradient(45deg, #808080 25%, transparent 25%), linear-gradient(-45deg, #808080 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #808080 75%), linear-gradient(-45deg, transparent 75%, #808080 75%)`,
          backgroundSize: '10px 10px',
          backgroundPosition: '0 0, 0 5px, 5px -5px, -5px 0px'
        }}
      />
      
      {/* Frosted translucency */}
      <div className="absolute inset-0 bg-white/45 backdrop-blur-[1.5px]" />

      {/* Eggshell texture overlay */}
      <div 
        className="absolute inset-0 opacity-35"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Edge glow to hint at clear material */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/70 via-transparent to-white/50" />
    </div>
  )
}
