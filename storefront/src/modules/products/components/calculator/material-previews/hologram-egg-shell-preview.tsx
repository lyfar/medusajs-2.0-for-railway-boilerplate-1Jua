import clsx from "clsx"

export const HologramEggShellPreview = ({ className }: { className?: string }) => {
  return (
    <div className={clsx("relative h-full w-full overflow-hidden rounded-md bg-neutral-200", className)}>
      {/* Iridescent holographic sweep */}
      <div className="absolute inset-0 bg-[conic-gradient(from_140deg_at_30%_30%,#ff9aa2,#ffe0e0,#b5e2ff,#bca7ff,#ff9aa2)] opacity-80" />
      <div className="absolute inset-0 bg-[linear-gradient(125deg,rgba(255,255,255,0.9)_15%,rgba(255,255,255,0)_35%,rgba(255,255,255,0.7)_60%,rgba(255,255,255,0)_80%)] mix-blend-screen" />

      {/* Rainbow shards */}
      <div className="absolute inset-0 bg-[repeating-linear-gradient(145deg,rgba(255,255,255,0.25) 0px,rgba(255,255,255,0.25) 10px,rgba(255,255,255,0.05) 14px,rgba(255,255,255,0.05) 20px)] mix-blend-soft-light" />

      {/* Eggshell texture overlay */}
      <div
        className="absolute inset-0 opacity-25 mix-blend-multiply"
        style={{
          backgroundImage:
            `radial-gradient(rgba(120,98,76,0.14) 0.5px, transparent 1px), radial-gradient(rgba(120,98,76,0.1) 0.5px, transparent 1px)`,
          backgroundSize: "14px 14px, 18px 18px",
          backgroundPosition: "3px 4px, -3px 10px",
        }}
      />
    </div>
  )
}
