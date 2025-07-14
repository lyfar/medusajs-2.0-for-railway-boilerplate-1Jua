# Admin Widgets Documentation

This directory contains custom widgets for the Medusa Admin dashboard. These widgets extend the functionality of the admin interface to provide additional features and information.

## Available Widgets

### Order Sticker Designs Widget

**File:** `widgets/order-sticker-designs.tsx`

This widget displays custom images in the order details page:

1. **Sticker Designs**: Shows sticker designs from order items that have either a `design_url` or `file_key` in their metadata.
2. **Customer Custom Images**: Displays custom user images attached to the order metadata as `user_image_url` or `user_image_key`.

#### Configuration

The widget is configured to appear in the `order.details.after` zone, which places it after the order details section.

#### Data Requirements

For the widget to display images:

- For sticker designs: Order items must have `metadata.design_url` or `metadata.file_key`.
- For custom user images: The order must have `metadata.user_image_url` or `metadata.user_image_key`.

If neither is available, the widget will not be displayed.

## Creating New Widgets

To create a new widget:

1. Create a new `.tsx` file in the `widgets` directory.
2. Import necessary components from `@medusajs/admin` and `@medusajs/ui`.
3. Create a React component that accepts the appropriate props (e.g., `OrderDetailsWidgetProps`).
4. Export a `config` object with the appropriate `zone` property.
5. Export the component as default.

### Example

```tsx
import React from "react"
import type { OrderDetailsWidgetProps } from "@medusajs/admin"
import { Container, Heading } from "@medusajs/ui"

const MyWidget = ({ order }: OrderDetailsWidgetProps) => {
  return (
    <Container>
      <Heading level="h2">My Custom Widget</Heading>
      {/* Widget content */}
    </Container>
  )
}

export const config = {
  zone: "order.details.after", // Place widget after order details
}

export default MyWidget
```

## Available Zones

Widgets can be placed in various zones in the admin dashboard. Common zones include:

- `order.details.after` - After order details
- `product.details.after` - After product details
- `customer.details.after` - After customer details

For a complete list of available zones, refer to the Medusa documentation. 