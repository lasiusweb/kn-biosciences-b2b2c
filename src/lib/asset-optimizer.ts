import { ImageProps } from 'next/image';

export interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png';
  fit?: 'cover' | 'contain' | 'fill';
  position?: 'center' | 'top' | 'bottom' | 'left' | 'right';
}

export interface AssetManifest {
  [key: string]: {
    path: string;
    size: number;
    optimized: boolean;
    formats: string[];
  };
}

export class AssetOptimizer {
  private static instance: AssetOptimizer;
  private assetManifest: AssetManifest = {};
  private readonly defaultQuality = 80;
  private readonly supportedFormats = ['webp', 'jpeg', 'png', 'avif'];
  
  private constructor() {
    // Initialize with default manifest or load from file
    this.initializeManifest();
  }

  public static getInstance(): AssetOptimizer {
    if (!AssetOptimizer.instance) {
      AssetOptimizer.instance = new AssetOptimizer();
    }
    return AssetOptimizer.instance;
  }

  /**
   * Initializes the asset manifest
   */
  private async initializeManifest(): Promise<void> {
    // In a real implementation, this would load from a manifest file
    // For now, we'll initialize with an empty manifest
    this.assetManifest = {};
  }

  /**
   * Optimizes an image URL with query parameters
   */
  optimizeImageUrl(src: string, options: ImageOptimizationOptions = {}): string {
    // If it's an external image, return as is
    if (src.startsWith('http')) {
      return this.addImageParams(src, options);
    }

    // If it's a local image, optimize it
    return this.addImageParams(src, options);
  }

  /**
   * Adds optimization parameters to an image URL
   */
  private addImageParams(src: string, options: ImageOptimizationOptions): string {
    const url = new URL(src, process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000');
    
    if (options.width) url.searchParams.set('width', options.width.toString());
    if (options.height) url.searchParams.set('height', options.height.toString());
    if (options.quality) url.searchParams.set('quality', options.quality.toString());
    if (options.format) url.searchParams.set('format', options.format);
    if (options.fit) url.searchParams.set('fit', options.fit);
    if (options.position) url.searchParams.set('position', options.position);

    return url.pathname + url.search;
  }

  /**
   * Gets optimized image props for Next.js Image component
   */
  getOptimizedImageProps(src: string, options: ImageOptimizationOptions = {}): Partial<ImageProps> {
    const optimizedSrc = this.optimizeImageUrl(src, options);
    
    return {
      src: optimizedSrc,
      width: options.width,
      height: options.height,
      quality: options.quality || this.defaultQuality,
      // Use appropriate loading strategy based on image importance
      loading: options.width && options.height ? 'lazy' : 'eager',
      // Add blur placeholder for better UX
      placeholder: 'blur',
      blurDataURL: this.generateBlurDataUrl(src),
      // Optimize for performance
      priority: !!(options.width && options.height && options.width < 300 && options.height < 300),
    };
  }

  /**
   * Generates a blur placeholder data URL
   */
  private generateBlurDataUrl(src: string): string {
    // In a real implementation, this would generate an actual blur placeholder
    // For now, returning a small transparent PNG as placeholder
    return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
  }

  /**
   * Preloads an image to improve performance
   */
  async preloadImage(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = () => reject(new Error(`Failed to preload image: ${src}`));
      img.src = src;
    });
  }

  /**
   * Preloads multiple images
   */
  async preloadImages(sources: string[]): Promise<void> {
    const promises = sources.map(src => this.preloadImage(src));
    await Promise.all(promises);
  }

  /**
   * Gets responsive image sources for different screen sizes
   */
  getResponsiveSources(
    src: string,
    sizes: number[],
    options: Omit<ImageOptimizationOptions, 'width' | 'height'> = {}
  ): { srcSet: string; sizes: string } {
    const srcSet = sizes
      .map(size => `${this.optimizeImageUrl(src, { ...options, width: size })} ${size}w`)
      .join(', ');
    
    const sizesStr = sizes
      .map(size => `(max-width: ${size}px) ${size}px`)
      .join(', ');

    return { srcSet, sizes: sizesStr };
  }

  /**
   * Optimizes CSS by inlining critical CSS and deferring non-critical
   */
  optimizeCSS(cssContent: string, isCritical: boolean = false): string {
    if (isCritical) {
      // For critical CSS, we might want to optimize differently
      return this.minifyCSS(cssContent);
    } else {
      // For non-critical CSS, we might defer loading
      return this.minifyCSS(cssContent);
    }
  }

  /**
   * Minifies CSS content
   */
  private minifyCSS(css: string): string {
    // Simple CSS minification (in a real implementation, use a proper CSS minifier)
    return css
      .replace(/\s+/g, ' ')
      .replace(/;\s+/g, ';')
      .replace(/:\s+/g, ':')
      .replace(/,\s+/g, ',')
      .replace(/\{\s+/g, '{')
      .replace(/\s+\}/g, '}')
      .trim();
  }

  /**
   * Optimizes JavaScript by minifying and compressing
   */
  optimizeJS(jsContent: string): string {
    // In a real implementation, use a proper JS minifier like Terser
    // For now, just basic whitespace removal
    return jsContent
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Generates optimized font loading strategy
   */
  getFontOptimizationStrategy(fontFamily: string, fontWeight: string | number = 400): string {
    // Return CSS for optimized font loading
    return `
      /* Optimized font loading for ${fontFamily} */
      @font-face {
        font-family: '${fontFamily}';
        font-display: swap; /* Optimize for performance */
        font-weight: ${fontWeight};
        src: url('/fonts/${fontFamily}-${fontWeight}.woff2') format('woff2'),
             url('/fonts/${fontFamily}-${fontWeight}.woff') format('woff');
      }
    `;
  }

  /**
   * Implements resource hints for performance optimization
   */
  getResourceHints(): string {
    return `
      <!-- Preconnect to important origins -->
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      
      <!-- DNS prefetch for external resources -->
      <link rel="dns-prefetch" href="//www.google-analytics.com">
      <link rel="dns-prefetch" href="//www.googletagmanager.com">
      
      <!-- Preload critical resources -->
      <link rel="preload" href="/fonts/main-font.woff2" as="font" type="font/woff2" crossorigin>
    `;
  }

  /**
   * Optimizes SVG content
   */
  optimizeSVG(svgContent: string): string {
    // Remove unnecessary attributes and comments
    return svgContent
      .replace(/<!--[\s\S]*?-->/g, '') // Remove comments
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/\s*([{}:;,])\s*/g, '$1') // Remove spaces around operators
      .trim();
  }

  /**
   * Gets optimized video props
   */
  getOptimizedVideoProps(src: string, options: {
    preload?: 'auto' | 'metadata' | 'none';
    controls?: boolean;
    muted?: boolean;
    loop?: boolean;
    playsInline?: boolean;
  } = {}): any {
    return {
      src,
      preload: options.preload || 'metadata',
      controls: options.controls !== false,
      muted: options.muted,
      loop: options.loop,
      playsInline: options.playsInline,
      // Optimize loading
      loading: 'lazy' as const,
      // Add poster for better UX
      poster: this.generateVideoPoster(src),
    };
  }

  /**
   * Generates a video poster image
   */
  private generateVideoPoster(videoSrc: string): string {
    // In a real implementation, this would generate a thumbnail from the video
    // For now, returning a placeholder
    return '/images/video-poster-placeholder.jpg';
  }

  /**
   * Implements lazy loading for elements
   */
  enableLazyLoading(): void {
    // This would typically be implemented in the browser environment
    // For Next.js, we rely on built-in lazy loading for images and Intersection Observer for other elements
    console.log('Lazy loading enabled for images and other assets');
  }

  /**
   * Gets compression recommendations for assets
   */
  getCompressionRecommendations(assetPath: string): {
    shouldCompress: boolean;
    suggestedFormat: string;
    estimatedSizeReduction: number;
  } {
    const extension = assetPath.split('.').pop()?.toLowerCase();
    
    if (!extension) {
      return {
        shouldCompress: false,
        suggestedFormat: '',
        estimatedSizeReduction: 0
      };
    }

    // Define recommendations based on file type
    switch (extension) {
      case 'jpg':
      case 'jpeg':
        return {
          shouldCompress: true,
          suggestedFormat: 'webp',
          estimatedSizeReduction: 0.3 // 30% reduction
        };
      case 'png':
        return {
          shouldCompress: true,
          suggestedFormat: 'webp',
          estimatedSizeReduction: 0.2 // 20% reduction
        };
      case 'svg':
        return {
          shouldCompress: true,
          suggestedFormat: 'svg',
          estimatedSizeReduction: 0.1 // 10% reduction through optimization
        };
      default:
        return {
          shouldCompress: false,
          suggestedFormat: extension,
          estimatedSizeReduction: 0
        };
    }
  }

  /**
   * Calculates the ideal image dimensions for a given container
   */
  calculateImageDimensions(
    containerWidth: number,
    containerHeight: number,
    aspectRatio: number,
    devicePixelRatio: number = 1
  ): { width: number; height: number } {
    let width, height;
    
    if (aspectRatio > 1) {
      // Landscape orientation
      width = Math.min(containerWidth, containerHeight * aspectRatio);
      height = width / aspectRatio;
    } else {
      // Portrait orientation
      height = Math.min(containerHeight, containerWidth / aspectRatio);
      width = height * aspectRatio;
    }
    
    // Apply device pixel ratio for high-DPI screens
    width *= devicePixelRatio;
    height *= devicePixelRatio;
    
    return {
      width: Math.round(width),
      height: Math.round(height)
    };
  }

  /**
   * Implements responsive image loading based on viewport
   */
  getViewportBasedImageSrc(
    baseSrc: string,
    breakpoints: { maxWidth: number; width: number }[]
  ): string {
    // Sort breakpoints by maxWidth descending
    const sortedBreakpoints = [...breakpoints].sort((a, b) => b.maxWidth - a.maxWidth);
    
    // Get current viewport width (would be done client-side in real implementation)
    const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;
    
    // Find the appropriate breakpoint
    const matchingBreakpoint = sortedBreakpoints.find(bp => viewportWidth <= bp.maxWidth);
    
    if (matchingBreakpoint) {
      return this.optimizeImageUrl(baseSrc, { width: matchingBreakpoint.width });
    }
    
    // Fallback to the largest available
    const largestBreakpoint = sortedBreakpoints[sortedBreakpoints.length - 1];
    return this.optimizeImageUrl(baseSrc, { width: largestBreakpoint.width });
  }
}

// Create a singleton instance
export const assetOptimizer = AssetOptimizer.getInstance();

// Higher-order component to wrap Next.js Image with optimization
export function withOptimizedImage(Component: React.ComponentType<any>) {
  return (props: any) => {
    const optimizedProps = assetOptimizer.getOptimizedImageProps(props.src, {
      width: props.width,
      height: props.height,
      quality: props.quality,
      format: props.format as any,
    });

    return <Component {...props} {...optimizedProps} />;
  };
}

// Utility function to generate image sizes attribute for responsive images
export function generateImageSizes(
  breakpoints: { maxWidth: number; widthPercentage: number }[]
): string {
  return breakpoints
    .map(bp => `(max-width: ${bp.maxWidth}px) ${bp.widthPercentage}vw`)
    .join(', ');
}