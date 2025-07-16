# Sticker Potrace Service

A service for generating crisp, vector-based outlined previews for die-cut stickers using the Potrace library.

## Overview

This service converts uploaded PNG/image files into SVG paths with customizable borders, providing production-ready cut-line previews for sticker printing.

## Features

- **Vector-based outlines**: Crisp, scalable SVG paths instead of blurry canvas effects
- **Customizable borders**: Adjustable width and color
- **Production-ready**: SVG paths can be used directly with cutting machines
- **Multiple variations**: Generate different border weights for preview
- **Client-server architecture**: API endpoint + React hook for easy integration

## Setup

### 1. Install Dependencies

```bash
cd portace
npm install
```

### 2. Install Potrace System Dependency

**Ubuntu/Debian:**
```bash
sudo apt-get install potrace
```

**macOS:**
```bash
brew install potrace
```

**Windows:**
Download from [http://potrace.sourceforge.net/](http://potrace.sourceforge.net/)

### 3. Install in Main Project

Add to your main `package.json`:
```bash
npm install potrace
```

## Usage

### API Endpoint

```typescript
// POST /api/sticker-outline
const formData = new FormData()
formData.append('image', file)
formData.append('borderWidth', '5')
formData.append('borderColor', '#ffffff')

const response = await fetch('/api/sticker-outline', {
  method: 'POST',
  body: formData,
})

const result = await response.json()
// { success: true, svg: "...", svgPath: "M10,10 L90,10..." }
```

### React Hook

```typescript
import { useStickerOutline } from './hooks/useStickerOutline'

function StickerPreview() {
  const { generateOutline, isGenerating, lastResult } = useStickerOutline()

  const handleFileUpload = async (file: File) => {
    const result = await generateOutline(file, {
      borderWidth: 5,
      borderColor: '#ffffff'
    })
    
    if (result?.success) {
      // Use result.svg for preview
      // Use result.svgPath for production cutting
    }
  }

  return (
    <div>
      {isGenerating && <div>Generating outline...</div>}
      {lastResult?.svg && (
        <div dangerouslySetInnerHTML={{ __html: lastResult.svg }} />
      )}
    </div>
  )
}
```

### Direct Service Usage

```typescript
import { stickerOutlineService } from './portace'

// From file buffer
const result = await stickerOutlineService.generateOutline(buffer, {
  borderWidth: 3,
  borderColor: '#ff1493',
  backgroundColor: 'transparent'
})

// From data URL
const result = await stickerOutlineService.generateOutlineFromDataURL(dataURL)

// Multiple border variations
const variations = await stickerOutlineService.generateBorderVariations(buffer, [1, 3, 5, 8])
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `borderWidth` | number | 3 | Border thickness in SVG units |
| `borderColor` | string | '#ffffff' | Border color (hex, rgb, named) |
| `backgroundColor` | string | 'transparent' | Fill color for the shape |

## Potrace Options

Fine-tune the tracing algorithm:

```typescript
{
  turdSize: 2,        // Suppress small features
  turnPolicy: 'black', // Path decomposition policy
  alphaMax: 1,        // Corner threshold
  optCurve: true,     // Enable curve optimization
  optTolerance: 0.2,  // Curve optimization tolerance
  threshold: 128,     // Bitmap conversion threshold
  blackOnWhite: true  // Trace black on white
}
```

## Integration with Sticker Calculator

Replace the canvas-based approach with SVG outlines:

```typescript
// In ImageDropZone component
import { useStickerOutline } from './hooks/useStickerOutline'

const { generateOutlineFromDataURL } = useStickerOutline()

// When image is uploaded
useEffect(() => {
  if (image && shape === 'diecut') {
    generateOutlineFromDataURL(image, { borderWidth: 5 })
  }
}, [image, shape])
```

## Production Benefits

1. **Scalable**: SVG paths work at any resolution
2. **Precise**: Perfect corners and edges
3. **Compatible**: Direct integration with cutting machines
4. **Lightweight**: Smaller file sizes than raster images
5. **Editable**: SVG paths can be modified programmatically

## Troubleshooting

### "Cannot find module 'potrace'"
Install the potrace package: `npm install potrace`

### "Potrace system dependency not found"
Install the system-level potrace binary (see Setup section)

### "Failed to generate SVG path"
- Ensure image has sufficient contrast
- Try adjusting `threshold` option
- Check image format (PNG works best)

## Development

The service includes a placeholder mode when potrace isn't installed, returning a basic rectangle SVG for development.

To enable full functionality:
1. Install system potrace dependency
2. Install npm potrace package  
3. Remove `@ts-nocheck` from service files
4. Update API route to use actual service

## Example Output

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
  <defs>
    <style>
      .sticker-outline {
        fill: transparent;
        stroke: #ffffff;
        stroke-width: 5;
        stroke-linejoin: round;
        stroke-linecap: round;
      }
    </style>
  </defs>
  <path d="M10.5,45.2 C12.1,43.8 14.7,42.9..." class="sticker-outline" />
</svg>
``` 