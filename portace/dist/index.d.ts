export interface StickerOutlineOptions {
    borderWidth?: number;
    borderColor?: string;
    backgroundColor?: string;
}
export interface StickerOutlineResult {
    svg: string;
    svgPath: string;
    success: boolean;
    error?: string;
}
/**
 * Service for creating outlined sticker previews using Potrace
 * Converts PNG/image alpha channel into crisp SVG paths with borders
 */
export declare class StickerOutlineService {
    private defaultOptions;
    /**
     * Generate SVG outline from image buffer
     */
    generateOutline(imageBuffer: Buffer, options?: StickerOutlineOptions): Promise<StickerOutlineResult>;
    /**
     * Generate SVG outline from base64 data URL
     */
    generateOutlineFromDataURL(dataURL: string, options?: StickerOutlineOptions): Promise<StickerOutlineResult>;
    /**
     * Trace image to SVG path using Potrace
     */
    private traceToPath;
    /**
     * Create styled SVG with border around the traced path
     */
    private createStyledSVG;
    /**
     * Generate multiple border weights for preview
     */
    generateBorderVariations(imageBuffer: Buffer, borderWidths?: number[]): Promise<{
        [key: number]: StickerOutlineResult;
    }>;
}
export declare const stickerOutlineService: StickerOutlineService;
//# sourceMappingURL=index.d.ts.map