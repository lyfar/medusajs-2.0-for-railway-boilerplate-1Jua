'use client'

import clsx from "clsx"
import React from "react"
import { AlertCircle } from "lucide-react"
import type { DropzoneInputProps, DropzoneRootProps } from "react-dropzone"

import { StickerFlowCanvas } from "../sticker-flow-canvas"
import { SelectionOverlay } from "./selection-overlay"
import { CanvasEmptyState } from "./canvas-empty-state"
import type { StoredUploadPreviewKind } from "../utils/design-storage"

type CornerHandle = {
  key: string
  style: React.CSSProperties
  cursor: React.CSSProperties["cursor"]
}

interface CanvasStageProps {
  getRootProps: <T extends DropzoneRootProps>(props?: T) => DropzoneRootProps & T
  getInputProps: <T extends DropzoneInputProps>(props?: T) => DropzoneInputProps & T
  containerRef: React.RefObject<HTMLDivElement>
  imageWrapperRef: React.RefObject<HTMLDivElement>
  dropzoneStyle: React.CSSProperties
  isDragActive: boolean
  imageData: string | null
  renderSize: { width: number; height: number }
  position: { x: number; y: number }
  rotation: number
  scale: number
  controlScaleCompensation: number
  stickerAreaSize: { width: number; height: number }
  stickerBorderRadius: string
  bleedStyles: { outer: React.CSSProperties; inner: React.CSSProperties } | null
  isImageSelected: boolean
  cornerHandles: CornerHandle[]
  handleAccentClass: string
  rotationHandleClass: string
  selectionBorderClass: string
  startScaleHandleDrag: (event: React.PointerEvent<HTMLButtonElement>) => void
  startRotateHandleDrag: (event: React.PointerEvent<HTMLButtonElement>) => void
  previewKind: StoredUploadPreviewKind | null
  isProcessing: boolean
  canBrowse: boolean
  isTouchDevice: boolean
  onBrowse: () => void
  onWheelZoom: (event: React.WheelEvent<HTMLDivElement>) => void
  onMouseDownCanvas: (event: React.MouseEvent<HTMLDivElement>) => void
  onTouchStartCanvas: (event: React.TouchEvent<HTMLDivElement>) => void
  onTouchMoveCanvas: (event: React.TouchEvent<HTMLDivElement>) => void
  onTouchEndCanvas: (event: React.TouchEvent<HTMLDivElement>) => void
  hasTransparency: boolean
  isImageDark?: boolean
  forceCheckerboard?: boolean
}

export function CanvasStage({
  getRootProps,
  getInputProps,
  containerRef,
  imageWrapperRef,
  dropzoneStyle,
  isDragActive,
  imageData,
  renderSize,
  position,
  rotation,
  scale,
  controlScaleCompensation,
  stickerAreaSize,
  stickerBorderRadius,
  bleedStyles,
  isImageSelected,
  cornerHandles,
  handleAccentClass,
  rotationHandleClass,
  selectionBorderClass,
  startScaleHandleDrag,
  startRotateHandleDrag,
  previewKind,
  isProcessing,
  canBrowse,
  isTouchDevice,
  onBrowse,
  onWheelZoom,
  onMouseDownCanvas,
  onTouchStartCanvas,
  onTouchMoveCanvas,
  onTouchEndCanvas,
  hasTransparency,
  isImageDark = false,
  forceCheckerboard = false,
}: CanvasStageProps) {
  const rootProps = getRootProps({
    onMouseDown: onMouseDownCanvas,
    onTouchStart: onTouchStartCanvas,
    onTouchMove: onTouchMoveCanvas,
    onTouchEnd: onTouchEndCanvas,
  })
  const inputProps = getInputProps()

  const dropzoneRef = rootProps.ref
  const setRefs = (node: HTMLDivElement | null) => {
    if (typeof dropzoneRef === "function") {
      dropzoneRef(node)
    } else if (dropzoneRef && "current" in dropzoneRef) {
      // @ts-expect-error react-dropzone returns a mutable ref here
      dropzoneRef.current = node
    }

    if (typeof containerRef === "function") {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore: containerRef is a ref object in practice
      containerRef(node)
    } else if (containerRef?.current !== undefined) {
      containerRef.current = node
    }
  }

  return (
    <StickerFlowCanvas className="h-full w-full">
      <div
        {...rootProps}
        ref={setRefs}
        style={dropzoneStyle}
        className={clsx(
          "relative h-full w-full transition-all duration-300 ease-in-out",
          {
            "ring-4 ring-indigo-500/20": isDragActive,
          }
        )}
        onWheel={onWheelZoom}
      >
        <input {...inputProps} />

        {imageData && stickerAreaSize.width > 0 && stickerAreaSize.height > 0 && (
          <div
            className="pointer-events-none absolute left-1/2 top-1/2 z-0"
            style={{
              width: stickerAreaSize.width,
              height: stickerAreaSize.height,
              transform: "translate(-50%, -50%)",
              borderRadius: stickerBorderRadius,
              overflow: "hidden",
            }}
          >
            {(hasTransparency || forceCheckerboard) && (
              <div
                className="h-full w-full"
                style={{
                  backgroundColor: isImageDark ? "#e5e7eb" : "#111827",
                  backgroundImage:
                    `linear-gradient(45deg, ${isImageDark ? "#cbd5e1" : "#1f2937"} 25%, transparent 25%), ` +
                    `linear-gradient(-45deg, ${isImageDark ? "#cbd5e1" : "#1f2937"} 25%, transparent 25%), ` +
                    `linear-gradient(45deg, transparent 75%, ${isImageDark ? "#cbd5e1" : "#1f2937"} 75%), ` +
                    `linear-gradient(-45deg, transparent 75%, ${isImageDark ? "#cbd5e1" : "#1f2937"} 75%)`,
                  backgroundSize: "18px 18px",
                  backgroundPosition: "0 0, 0 9px, 9px -9px, -9px 0",
                }}
              />
            )}
          </div>
        )}

        {imageData && stickerAreaSize.width > 0 && stickerAreaSize.height > 0 && (
          <div
            className="pointer-events-none absolute left-1/2 top-1/2 z-[2]"
            style={{
              width: stickerAreaSize.width,
              height: stickerAreaSize.height,
              transform: "translate(-50%, -50%)",
              transition: "width 240ms ease, height 240ms ease",
            }}
          >
            {bleedStyles && <div style={bleedStyles.outer} />}
            {bleedStyles && <div style={bleedStyles.inner} />}
          </div>
        )}

        {imageData && renderSize.width > 0 && renderSize.height > 0 ? (
          <div
            className="absolute left-1/2 top-1/2 z-[1]"
            style={{
              width: renderSize.width,
              height: renderSize.height,
              transform: `translate(-50%, -50%) translate(${position.x}px, ${position.y}px)`
            }}
          >
            <div
              ref={imageWrapperRef}
              className="relative h-full w-full"
              style={{
                transform: `rotate(${rotation}deg) scale(${scale})`,
                transformOrigin: "center",
              }}
            >
              <SelectionOverlay
                controlScaleCompensation={controlScaleCompensation}
                isImageSelected={isImageSelected}
                cornerHandles={cornerHandles}
                handleAccentClass={handleAccentClass}
                rotationHandleClass={rotationHandleClass}
                selectionBorderClass={selectionBorderClass}
                startScaleHandleDrag={startScaleHandleDrag}
                startRotateHandleDrag={startRotateHandleDrag}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageData}
                  alt="Artwork preview"
                  draggable={false}
                  className="h-full w-full select-none object-contain"
                  style={{
                    userSelect: "none",
                    pointerEvents: "none",
                  }}
                />
              </SelectionOverlay>
            </div>
          </div>
        ) : previewKind === "unsupported" ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
            <div className="rounded-full bg-amber-900/30 p-4">
              <AlertCircle className="h-8 w-8 text-amber-400" />
            </div>
            <div className="space-y-2">
              <p className="text-base font-semibold text-neutral-200">Preview unavailable</p>
              <p className="text-sm text-neutral-400">
                The original file has been uploaded, but we can&apos;t preview this format.
              </p>
            </div>
          </div>
        ) : (
          <CanvasEmptyState
            isProcessing={isProcessing}
            isDragActive={isDragActive}
            canBrowse={canBrowse}
            isTouchDevice={isTouchDevice}
            onBrowse={onBrowse}
          />
        )}
      </div>
    </StickerFlowCanvas>
  )
}
