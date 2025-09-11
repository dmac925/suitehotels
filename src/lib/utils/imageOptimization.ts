/**
 * Image optimization utilities for Cloudflare R2 images
 * Uses Cloudflare Image Resizing to serve optimized images
 */

interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png' | 'avif';
  fit?: 'scale-down' | 'contain' | 'cover' | 'crop' | 'pad';
}

const DEFAULT_OPTIONS: ImageOptimizationOptions = {
  quality: 80,
  format: 'webp',
  fit: 'cover'
};

/**
 * Optimizes an image URL using Cloudflare Image Resizing
 * Works with R2 images served through Cloudflare
 */
export function optimizeImage(
  imageUrl: string, 
  options: ImageOptimizationOptions = {}
): string {
  if (!imageUrl) return imageUrl;

  // Don't optimize non-suitetheory images
  if (!imageUrl.includes('images.suitetheory.com')) {
    return imageUrl;
  }

  const opts = { ...DEFAULT_OPTIONS, ...options };

  // Try Cloudflare Image Resizing first
  if (imageUrl.includes('images.suitetheory.com') && !imageUrl.includes('/cdn-cgi/image/')) {
    const params: string[] = [];

    if (opts.width) params.push(`w=${opts.width}`);
    if (opts.height) params.push(`h=${opts.height}`);
    if (opts.quality) params.push(`q=${opts.quality}`);
    if (opts.format) params.push(`f=${opts.format}`);
    if (opts.fit) params.push(`fit=${opts.fit}`);

    if (params.length > 0) {
      const paramString = params.join(',');
      return imageUrl.replace(
        'https://images.suitetheory.com/',
        `https://images.suitetheory.com/cdn-cgi/image/${paramString}/`
      );
    }
  }

  // Fallback: return original URL (Cloudflare Polish will still optimize if enabled)
  return imageUrl;
}

/**
 * Predefined image size presets for common use cases
 */
export const IMAGE_PRESETS = {
  thumbnail: { width: 300, height: 200, quality: 75 },
  card: { width: 400, height: 280, quality: 80 },
  gallery: { width: 800, height: 600, quality: 85 },
  hero: { width: 1200, height: 800, quality: 90 },
  full: { quality: 95 }
} as const;

/**
 * Quick preset functions for common image sizes
 */
export const getImageUrl = {
  thumbnail: (url: string) => optimizeImage(url, IMAGE_PRESETS.thumbnail),
  card: (url: string) => optimizeImage(url, IMAGE_PRESETS.card),
  gallery: (url: string) => optimizeImage(url, IMAGE_PRESETS.gallery),
  hero: (url: string) => optimizeImage(url, IMAGE_PRESETS.hero),
  full: (url: string) => optimizeImage(url, IMAGE_PRESETS.full)
};

/**
 * Generate srcset for responsive images
 */
export function generateSrcSet(
  imageUrl: string, 
  sizes: Array<{ width: number; quality?: number }>
): string {
  return sizes
    .map(({ width, quality = 80 }) => {
      const optimizedUrl = optimizeImage(imageUrl, { width, quality });
      return `${optimizedUrl} ${width}w`;
    })
    .join(', ');
}

/**
 * Generate sizes attribute for responsive images
 */
export function generateSizes(breakpoints: Array<{ minWidth?: string; size: string }>): string {
  return breakpoints
    .map(({ minWidth, size }) => 
      minWidth ? `(min-width: ${minWidth}) ${size}` : size
    )
    .join(', ');
}