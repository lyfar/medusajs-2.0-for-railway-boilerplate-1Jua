"use client"

import { useEffect, useState } from "react"
import { X } from "lucide-react"

interface LightboxProps {
  src: string
  alt: string
  isOpen: boolean
  onClose: () => void
}

const Lightbox = ({ src, alt, isOpen, onClose }: LightboxProps) => {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }

    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape)
    }

    return () => {
      document.removeEventListener("keydown", handleEscape)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
      <div className="relative max-w-4xl max-h-[90vh] mx-4">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
          aria-label="Close lightbox"
        >
          <X size={32} />
        </button>

        {/* Image container */}
        <div className="relative">
          {isLoading && (
            <div className="flex items-center justify-center w-96 h-96 bg-gray-800 rounded-lg">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
          )}
          
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt}
            className={`max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl ${
              isLoading ? "hidden" : "block"
            }`}
            onLoad={() => setIsLoading(false)}
            onError={() => setIsLoading(false)}
          />
        </div>
      </div>

      {/* Backdrop - clicking outside closes the lightbox */}
      <div
        className="absolute inset-0 -z-10"
        onClick={onClose}
        aria-label="Close lightbox"
      />
    </div>
  )
}

export default Lightbox