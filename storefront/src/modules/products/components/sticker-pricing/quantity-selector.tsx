"use client"

import { Select } from "@medusajs/ui"
import { getStickerQuantityOptions, STICKER_MOQ } from "@lib/util/sticker-utils"

interface StickerQuantitySelectorProps {
  quantity: number
  onQuantityChange: (quantity: number) => void
  disabled?: boolean
}

export default function StickerQuantitySelector({
  quantity,
  onQuantityChange,
  disabled = false,
}: StickerQuantitySelectorProps) {
  const quantityOptions = getStickerQuantityOptions()

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-ui-fg-base">
        Quantity (Minimum {STICKER_MOQ.toLocaleString()})
      </label>
      <Select
        value={quantity.toString()}
        onValueChange={(value) => onQuantityChange(parseInt(value))}
        disabled={disabled}
      >
        <Select.Trigger className="w-full">
          <Select.Value placeholder="Select quantity" />
        </Select.Trigger>
        <Select.Content>
          {quantityOptions.map((option) => (
            <Select.Item key={option.value} value={option.value.toString()}>
              {option.label}
            </Select.Item>
          ))}
        </Select.Content>
      </Select>
    </div>
  )
} 