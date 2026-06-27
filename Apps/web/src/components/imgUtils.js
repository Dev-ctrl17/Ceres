/**
 * Image Utility Functions
 * 
 * Provides helpers for responsive images with WebP support and srcset.
 */

/**
 * Generate a complete srcset string for an image URL at various widths.
 * @param {string} baseUrl - The base image URL (without size suffix)
 * @param {number[]} widths - Array of widths in pixels
 * @returns {string} - The srcset attribute value
 */
export function generateSrcset(baseUrl, widths = [320, 640, 960, 1280, 1920]) {
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
  // For local images, we'd need multiple variants
  if (src && !src.startsWith('data:')) {
    // For external images, we provide a responsive srcset hint
    // by appending query parameters that CDNs can use
    const widths = [320, 640, 960, 1280, 1920];
    props.srcSet = widths.map(w => `${src}?w=${w} ${w}w`).join(', ');
  }

  return props;
}

/**
 * Preload hint for critical above-the-fold images.
 * Insert into <head> to improve LCP.
 */
export function getPreloadHint(src, as = 'image', fetchpriority = 'high') {
  return {
    rel: 'preload',
    as,
    href: src,
    fetchpriority,
  };
}