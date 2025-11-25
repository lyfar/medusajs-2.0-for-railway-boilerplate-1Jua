import clsx from "clsx"

export const UvGlossPreview = ({ className }: { className?: string }) => {
  return (
    <div className={clsx("relative h-full w-full overflow-hidden rounded-md bg-white", className)}>
      {/* Base gloss */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-neutral-50 to-neutral-100" />
      
      {/* Spot UV varnish dots */}
      <div
        className="absolute inset-0 opacity-35 mix-blend-screen"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.7) 0.8px, rgba(255,255,255,0) 1.8px)",
          backgroundSize: "12px 12px",
        }}
      />
      
      {/* High contrast diagonal reflection */}
      <div className="absolute -inset-1/2 w-[200%] h-[200%] bg-gradient-to-br from-transparent via-white/85 to-transparent opacity-80 rotate-45 translate-y-[-20%]" />
      
      {/* UV Pop effect (subtle purple/blue rim light) */}
      <div className="absolute inset-0 rounded-md ring-1 ring-violet-200/35 shadow-inner" />
    </div>
  )
}
