"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stickerOutlineService = exports.StickerOutlineService = void 0;
/**
 * Service for creating outlined sticker previews using Potrace
 * Converts PNG/image alpha channel into crisp SVG paths with borders
 */
class StickerOutlineService {
    constructor() {
        this.defaultOptions = {
            borderWidth: 3,
            borderColor: '#ffffff',
            backgroundColor: 'transparent'
        };
    }
    /**
     * Generate SVG outline from image buffer
     */
    async generateOutline(imageBuffer, options = {}) {
        try {
            const potrace = require('potrace');
            const opts = { ...this.defaultOptions, ...options };
            // Use Potrace to trace the image into SVG paths
            const svgPath = await this.traceToPath(imageBuffer, potrace);
            if (!svgPath) {
                return {
                    svg: '',
                    svgPath: '',
                    success: false,
                    error: 'Failed to generate SVG path from image'
                };
            }
            // Create complete SVG with border styling
            const svg = this.createStyledSVG(svgPath, opts);
            return {
                svg,
                svgPath,
                success: true
            };
        }
        catch (error) {
            return {
                svg: '',
                svgPath: '',
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }
    /**
     * Generate SVG outline from base64 data URL
     */
    async generateOutlineFromDataURL(dataURL, options = {}) {
        try {
            // Extract base64 data from data URL
            const base64Data = dataURL.split(',')[1];
            if (!base64Data) {
                throw new Error('Invalid data URL format');
            }
            const imageBuffer = Buffer.from(base64Data, 'base64');
            return await this.generateOutline(imageBuffer, options);
        }
        catch (error) {
            return {
                svg: '',
                svgPath: '',
                success: false,
                error: error instanceof Error ? error.message : 'Failed to process data URL'
            };
        }
    }
    /**
     * Trace image to SVG path using Potrace
     */
    async traceToPath(imageBuffer, potrace) {
        return new Promise((resolve, reject) => {
            // Add error handling for the potrace operation
            try {
                potrace.trace(imageBuffer, {
                    // Potrace options for better die-cut outlines
                    turdSize: 2, // Suppress small features
                    turnPolicy: 'black', // How to resolve ambiguities in path decomposition
                    alphaMax: 1, // Corner threshold parameter
                    optCurve: true, // Curve optimization
                    optTolerance: 0.2, // Curve optimization tolerance
                    threshold: 128, // Threshold for bitmap conversion
                    blackOnWhite: true, // Trace black pixels on white background
                }, (err, svg) => {
                    if (err) {
                        console.error('Potrace tracing error:', err.message);
                        reject(new Error(`Potrace failed: ${err.message}`));
                        return;
                    }
                    if (!svg) {
                        reject(new Error('Potrace returned empty SVG'));
                        return;
                    }
                    // Extract just the path data from the SVG
                    const pathMatch = svg.match(/<path[^>]*d="([^"]*)"/);
                    if (pathMatch && pathMatch[1]) {
                        resolve(pathMatch[1]);
                    }
                    else {
                        console.warn('No path found in SVG:', svg.substring(0, 200));
                        reject(new Error('No valid path found in generated SVG'));
                    }
                });
            }
            catch (syncError) {
                reject(new Error(`Potrace setup failed: ${syncError.message}`));
            }
        });
    }
    /**
     * Create styled SVG with border around the traced path
     */
    createStyledSVG(pathData, options) {
        return `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
        <defs>
          <style>
            .sticker-outline {
              fill: ${options.backgroundColor};
              stroke: ${options.borderColor};
              stroke-width: ${options.borderWidth};
              stroke-linejoin: round;
              stroke-linecap: round;
            }
          </style>
        </defs>
        <path d="${pathData}" class="sticker-outline" />
      </svg>
    `.trim();
    }
    /**
     * Generate multiple border weights for preview
     */
    async generateBorderVariations(imageBuffer, borderWidths = [1, 3, 5, 8]) {
        const results = {};
        for (const width of borderWidths) {
            results[width] = await this.generateOutline(imageBuffer, {
                borderWidth: width,
                borderColor: '#ffffff'
            });
        }
        return results;
    }
}
exports.StickerOutlineService = StickerOutlineService;
// Export singleton instance
exports.stickerOutlineService = new StickerOutlineService();
//# sourceMappingURL=index.js.map