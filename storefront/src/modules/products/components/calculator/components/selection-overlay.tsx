'use client'

import React from "react"

interface CornerHandle {
  key: string
  style: React.CSSProperties
  cursor: React.CSSProperties["cursor"]
}

interface SelectionOverlayProps {
  controlScaleCompensation: number
  isImageSelected: boolean
  cornerHandles: CornerHandle[]
  handleAccentClass: string
  rotationHandleClass: string
  selectionBorderClass: string
  startScaleHandleDrag: (event: React.PointerEvent<HTMLButtonElement>) => void
  startRotateHandleDrag: (event: React.PointerEvent<HTMLButtonElement>) => void
}

export function SelectionOverlay({
  controlScaleCompensation,
  isImageSelected,
  cornerHandles,
  handleAccentClass,
  rotationHandleClass,
  selectionBorderClass,
  startScaleHandleDrag,
  startRotateHandleDrag,
  children,
}: React.PropsWithChildren<SelectionOverlayProps>) {
  return (
    <>
      {children}

      {isImageSelected && (
        <>
          <div
            className={selectionBorderClass}
            style={{
              borderRadius: "0px",
              borderWidth: `${2 * controlScaleCompensation}px`,
            }}
          />
          {cornerHandles.map(({ key, style, cursor }) => (
            <button
              key={key}
              type="button"
              aria-label="Resize design"
              className={handleAccentClass}
              style={{
                ...style,
                cursor,
                transform: `translate(-50%, -50%) scale(${controlScaleCompensation})`,
                transformOrigin: "center",
              }}
              onPointerDown={startScaleHandleDrag}
            />
          ))}
          <div className="pointer-events-none absolute left-1/2 top-0 flex -translate-x-1/2 -translate-y-full items-center justify-center">
            <span
              className="block bg-sky-300/70"
              style={{
                width: "1px",
                height: `${24 * controlScaleCompensation}px`,
              }}
            />
          </div>
          <button
            type="button"
            aria-label="Rotate design"
            className={rotationHandleClass}
            style={{
              cursor: "grab",
              left: "50%",
              top: 0,
              transform: `translate(-50%, -120%) scale(${controlScaleCompensation})`,
              transformOrigin: "center",
            }}
            onPointerDown={startRotateHandleDrag}
          />
        </>
      )}
    </>
  )
}
