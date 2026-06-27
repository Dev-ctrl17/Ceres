/**
 * Image Utility Functions
 * 
 * Provides helpers for responsive images with WebP/AVIF support and srcset.
 * Includes an <OptimizedImage> component for consistent image optimization.
 */

/**
 * Generate a complete srcset string for an image URL at various widths.
 * @param {string} baseUrl - The base image URL (without size suffix)
 * @param {number[]} widths - Array of widths in pixels
 * @returns {string} - The srcset attribute value
 */
export function generateSrcset(baseUrl, widths = [320, 640, 960, 1280, 1920]) {
  if (!baseUrl || baseUrl.startsWith('data:')) return '';
  return widths.map(w => `${baseUrl}?w=${w} ${w}w`).join(', ');
}

/**
 * Get standard image props with decoding, loading, and responsive support.
 * @param {object} options
 * @param {string} options.src - Image source URL
 * @param {string} options.alt - Alt text
 * @param {string} [options.className] - CSS class
 * @param {'lazy'|'eager'} [options.loading='lazy'] - Loading strategy
 * @param {'async'|'sync'} [options.decoding='async'] - Decoding strategy
 * @param {string} [options.sizes] - Sizes attribute for responsive images
 * @param {boolean} [options.priority=false] - Whether to fetchpriority="high"
 * @returns {object} - Props to spread onto <img>
 */
export function getImageProps({ src, alt, className = '', loading = 'lazy', decoding = 'async', sizes, priority = false }) {
  const props = {
    src,
    alt,
    className,
    loading,
    decoding,
  };

  // Add fetchpriority for hero/priority images
  if (priority) {
    props.fetchpriority = 'high';
  }

  // Standard sizes if not provided
  if (!sizes) {
    props.sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw';
  } else {
    props.sizes = sizes;
  }

  // Generate srcset - for external URLs, we pass through as-is
  if (src && !src.startsWith('data:')) {
    const widths = [320, 640, 960, 1280, 1920];
    props.srcSet = widths.map(w => `${src}?w=${w} ${w}w`).join(', ');
  }

  return props;
}

/**
 * Preload hint for critical above-the-fold images.
 */
export function getPreloadHint(src, as = 'image', fetchpriority = 'high') {
  return {
    rel: 'preload',
    as,
    href: src,
    fetchpriority,
  };
}

/**
 * Check if an image URL is a known third-party hosted image.
 * Returns the known static paths for WebP/source replacements.
 */
export function getKnownImagePaths(src) {
  if (!src) return null;
  
  const knownImages = {
    'i.ibb.co': {
      hasLocalWebp: false,
      isCDN: true,
    },
    'www.image2url.com': {
      hasLocalWebp: false,
      isCDN: true,
    },
    'images.unsplash.com': {
      hasLocalWebp: false,
      isCDN: true,
    },
  };

  for (const [domain, config] of Object.entries(knownImages)) {
    if (src.includes(domain)) {
      return config;
    }
  }
  return null;
}

/**
 * Get the best possible image URL with optimization parameters.
 * For Unsplash images, we can request specific sizes and formats.
 * For other CDNs, we add query parameters for optimization.
 */
export function getOptimizedImageUrl(src, width = 800) {
  if (!src) return src;
  
  // Unsplash: we can request specific format and size
  if (src.includes('images.unsplash.com')) {
    const separator = src.includes('?') ? '&' : '?';
    return `${src}${separator}w=${width}&q=85&auto=format`;
  }
  
  // For other CDNs, they may not support format conversion via URL
  // Fall back to original URL
  return src;
}