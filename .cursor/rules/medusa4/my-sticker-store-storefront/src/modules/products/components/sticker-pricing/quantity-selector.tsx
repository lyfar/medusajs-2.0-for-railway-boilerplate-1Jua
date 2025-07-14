"use client"

import { useState, useEffect } from "react"
import { Button } from "@medusajs/ui"
import { validateStickerQuantity, STICKER_MOQ } from "@lib/validations/sticker-quantity"
import clsx from "clsx"

interface StickerQuantitySelectorProps {
  quantity: number
  onQuantityChange: (quantity: number) => void
  tiers?: Array<{ min: number; max?: number; price: number }>
  disabled?: boolean
  className?: string
}

// Predefined popular quantities (all 500+)
const popularQuantities = [500, 750, 1000, 1500, 2000, 2500]

export default function StickerQuantitySelector({
  quantity,
  onQuantityChange,
  tiers = [],
  disabled = false,
  className,
}: StickerQuantitySelectorProps) {
  const [localQuantity, setLocalQuantity] = useState<string>(quantity.toString())
  const [isCustom, setIsCustom] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)

  // Update local state when quantity prop changes
  useEffect(() => {
    setLocalQuantity(quantity.toString())
    
    // Check if current quantity matches any predefined quantity
    const isMatchingPredefined = popularQuantities.includes(quantity)
    setIsCustom(!isMatchingPredefined)
  }, [quantity])

  const handleQuantityChange = (newQuantity: number) => {
    const validation = validateStickerQuantity(newQuantity)
    
    if (validation.isValid) {
      setValidationError(null)
      onQuantityChange(newQuantity)
    } else {
      setValidationError(validation.error || "Invalid quantity")
    }
  }

  const handleInputChange = (value: string) => {
    setLocalQuantity(value)
    const numValue = parseInt(value) || 0
    
    if (numValue > 0) {
      handleQuantityChange(numValue)
      setIsCustom(true)
    }
  }

  const handlePredefinedQuantityClick = (predefinedQuantity: number) => {
    setLocalQuantity(predefinedQuantity.toString())
    handleQuantityChange(predefinedQuantity)
    setIsCustom(false)
  }

  const incrementQuantity = () => {
    const newQuantity = quantity + 250
    handleQuantityChange(newQuantity)
    setLocalQuantity(newQuantity.toString())
    setIsCustom(true)
  }

  const decrementQuantity = () => {
    const newQuantity = Math.max(quantity - 250, STICKER_MOQ)
    handleQuantityChange(newQuantity)
    setLocalQuantity(newQuantity.toString())
    setIsCustom(true)
  }

  return (
    <div className={className}>
      <div className="space-y-3">
        <label className="block text-sm font-medium text-ui-fg-base">
          Quantity (min. {STICKER_MOQ})
        </label>

        {/* Popular Quantities - Simple Grid */}
        <div className="grid grid-cols-3 gap-2">
          {popularQuantities.map((qty) => {
            const isSelected = !isCustom && qty === quantity
            
            return (
              <Button
                key={qty}
                variant={isSelected ? "primary" : "secondary"}
                onClick={() => handlePredefinedQuantityClick(qty)}
                disabled={disabled}
                className="h-10 font-medium"
              >
                {qty.toLocaleString()}
              </Button>
            )
          })}
        </div>

        {/* Custom Quantity Input */}
        <Button
          variant={isCustom ? "primary" : "secondary"}
          onClick={() => setIsCustom(!isCustom)}
          disabled={disabled}
          className="w-full h-10 font-medium"
        >
          {isCustom ? "✓ Custom Quantity" : "Enter Custom Quantity"}
        </Button>

        {isCustom && (
          <div className="flex items-center space-x-2">
            <Button
              variant="secondary"
              onClick={decrementQuantity}
              disabled={disabled || quantity <= STICKER_MOQ}
              className="w-10 h-10 p-0 font-bold"
            >
              −
            </Button>
            
            <input
              type="number"
              value={localQuantity}
              onChange={(e) => handleInputChange(e.target.value)}
              disabled={disabled}
              min={STICKER_MOQ}
              max="50000"
              className="flex-1 h-10 px-3 border rounded text-center font-medium"
            />
            
            <Button
              variant="secondary"
              onClick={incrementQuantity}
              disabled={disabled}
              className="w-10 h-10 p-0 font-bold"
            >
              +
            </Button>
          </div>
        )}

        {/* Validation Error */}
        {validationError && (
          <div className="p-3 bg-red-50 rounded border text-sm text-red-600">
            ⚠ {validationError}
          </div>
        )}

        {/* Selected Quantity Display */}
        <div className="p-3 bg-green-50 rounded border">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Selected:</span>
            <span className="font-bold text-green-600">
              {quantity.toLocaleString()} pieces
            </span>
          </div>
        </div>
      </div>
    </div>
  )
} 