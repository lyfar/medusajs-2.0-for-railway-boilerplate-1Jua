'use client'

import clsx from "clsx"
import { Upload, Undo2, Redo2, Check, RefreshCcw } from "lucide-react"

interface CanvasToolbarProps {
  canBrowse: boolean
  imageData: string | null
  onUploadClick: () => void
  onUndo: () => void
  onRedo: () => void
  onSave: () => void
  onReset: () => void
  canUndo: boolean
  canRedo: boolean
  isSavingDesign: boolean
  hasUnsavedChanges: boolean
  designStateEdited: boolean
}

export function CanvasToolbar({
  canBrowse,
  imageData,
  onUploadClick,
  onUndo,
  onRedo,
  onSave,
  onReset,
  canUndo,
  canRedo,
  isSavingDesign,
  hasUnsavedChanges,
  designStateEdited,
}: CanvasToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 sm:justify-end">
      <button
        type="button"
        onClick={onUploadClick}
        disabled={!canBrowse}
        className={clsx(
          "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium shadow-md transition-all duration-200 min-h-[44px]",
          !canBrowse
            ? "cursor-not-allowed bg-neutral-800/40 text-neutral-500"
            : "bg-neutral-800/80 text-neutral-200 hover:bg-neutral-700/90 active:scale-95"
        )}
        title={imageData ? "Replace image" : "Upload image"}
      >
        <Upload className="h-4 w-4" />
        <span className="hidden sm:inline">{imageData ? "Replace" : "Upload"}</span>
      </button>
      
      {imageData && (
        <>
          <button
            type="button"
            onClick={onUndo}
            disabled={!canUndo}
            title="Undo"
            className={clsx(
              "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium shadow-md transition-all duration-200 min-h-[44px]",
              !canUndo
                ? "cursor-not-allowed bg-neutral-800/40 text-neutral-500"
                : "bg-neutral-800/80 text-neutral-200 hover:bg-neutral-700/90 active:scale-95"
            )}
          >
            <Undo2 className="h-4 w-4" />
            <span className="hidden sm:inline">Undo</span>
          </button>
          <button
            type="button"
            onClick={onRedo}
            disabled={!canRedo}
            title="Redo"
            className={clsx(
              "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium shadow-md transition-all duration-200 min-h-[44px]",
              !canRedo
                ? "cursor-not-allowed bg-neutral-800/40 text-neutral-500"
                : "bg-neutral-800/80 text-neutral-200 hover:bg-neutral-700/90 active:scale-95"
            )}
          >
            <Redo2 className="h-4 w-4" />
            <span className="hidden sm:inline">Redo</span>
          </button>
        </>
      )}

      <button
        type="button"
        onClick={onReset}
        disabled={!imageData}
        title="Reset"
        className={clsx(
          "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium shadow-md transition-all duration-200 min-h-[44px]",
          !imageData
            ? "cursor-not-allowed bg-neutral-800/40 text-neutral-500"
            : "bg-neutral-800/80 text-neutral-200 hover:bg-neutral-700/90 active:scale-95"
        )}
      >
        <RefreshCcw className="h-4 w-4" />
        <span className="hidden sm:inline">Reset</span>
      </button>
    </div>
  )
}
