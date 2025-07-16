/// <reference types="node" />

// Type definitions for potrace module
declare module 'potrace' {
  interface PotraceOptions {
    turdSize?: number
    turnPolicy?: 'black' | 'white' | 'left' | 'right' | 'minority' | 'majority'
    alphaMax?: number
    optCurve?: boolean
    optTolerance?: number
    threshold?: number
    blackOnWhite?: boolean
  }

  interface PotraceCallback {
    (error: Error | null, svg: string): void
  }

  export function trace(
    imageBuffer: Buffer,
    options: PotraceOptions,
    callback: PotraceCallback
  ): void

  export function trace(
    imageBuffer: Buffer,
    callback: PotraceCallback
  ): void
} 