# Admin UI Widgets for Sticker Orders

This directory contains custom admin UI widgets that enhance the display of sticker orders in the Medusa admin dashboard.

## Widgets

### 1. `sticker-info-widget.tsx`
- **Purpose**: Displays detailed sticker information in order details
- **Location**: Shows at the top of order details page 
- **Features**:
  - Shape, dimensions, and area for each sticker
  - Proper quantity display (500+ units instead of "1")
  - Accurate unit pricing (€0.0253 instead of generic pricing)
  - Clear note about dynamic pricing

### 2. `order-line-item-widget.tsx`
- **Purpose**: Alternative widget for order line items
- **Location**: Shows before order details section
- **Features**:
  - Compact display of sticker specifications
  - Pricing breakdown per item

## How It Works

The widgets automatically detect sticker line items by:
1. Checking if `variant_id` matches the sticker variant
2. Looking for `dynamic_shape_pricing` metadata
3. Displaying formatted shape/dimension information

## What Users See

**Before (Default):**
- "Default option value"
- Generic quantities
- Standard pricing display

**After (With Widgets):**
- "Circle • 10cm diameter • 78.5 cm²"
- "Square • 8×8cm • 64.0 cm²" 
- Correct quantities (10000x, 1000x)
- Accurate unit pricing (€0.25, €0.23)

## Installation

These widgets are automatically loaded when the Medusa server starts. No additional configuration needed.

## Development

To modify the widgets:
1. Edit the `.tsx` files in this directory
2. Restart the Medusa server
3. Refresh the admin dashboard

The widgets use inline styles to ensure consistent appearance across different admin themes. 