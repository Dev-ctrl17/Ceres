// Image Optimization Utilities
// Handles WebP/AVIF conversion, responsive srcset, and lazy loading

export const generateImageSrcSet = (baseUrl, options = {}) => {
  const {
    widths = [320, 640, 768, 1024, 1280, 1536],
    formats = ['webp', 'avif', 'fallback'],
    quality = 75,
  } = options;

  if (!baseUrl) return '';

  // If already an external URL, return as-is
  if (baseUrl.startsWith('http')) {
    return baseUrl;
  }

  const srcSet = [];
  
  for (const width of widths) {
    for (const format of formats) {
      let url;
      if (format === 'fallback') {
        url = baseUrl;
      } else if (baseUrl.includes('.')) {
        // Replace extension with format
        const parts = baseUrl.split('.');
        parts[parts.length - 1] = format;
        url = parts.join('.');
      } else {
        url = baseUrl;
      }
      
      // Add width parameter for Supabase or other CDNs
      if (baseUrl.includes('supabase') || baseUrl.includes('cloudinary')) {
        url = `${url}?width=${width}&quality=${quality}&format=${format === 'fallback' ? 'auto' : format}`;
      }
      
      srcSet.push(`${url} ${width}w`);
    }
  }

  return srcSet.join(', ');
};

export const getOptimizedImageUrl = (url, options = {}) => {
  const {
    width = 800,
    quality = 75,
    format = 'webp',
    fallbackFormat = 'auto',
  } = options;

  if (!url) return '';
  
  // External URLs - return as-is or add parameters for CDNs
  if (url.startsWith('http')) {
    if (url.includes('unsplash.com')) {
      return `${url}?w=${width}&q=${quality}&fm=${format}`;
    }
    if (url.includes('ibb.co')) {
      return url; // Already optimized
    }
    return url;
  }

  // Supabase storage URLs
  if (url.includes('supabase') || url.includes('/storage/')) {
    return `${url}?width=${width}&quality=${quality}&format=${format}`;
  }

  // Local images - return as-is (Vite will handle optimization)
  return url;
};

export const getImagePlaceholder = (width = 20, height = 20) => {
  // Generate a tiny SVG placeholder (LQIP - Low Quality Image Placeholder)
  const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="#e5e7eb"/>
  </svg>`;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

export const getBlurDataURL = (color = '#e5e7eb') => {
  // Generate a 10x10 pixel canvas for blur effect
  const canvas = `
    <svg width="10" height="10" xmlns="http://www.w3.org/2000/svg">
      <rect width="10" height="10" fill="${color}"/>
    </svg>
  `;
  return `data:image/svg+xml;base64,${btoa(canvas)}`;
};

// Lazy loading configuration
export const lazyLoadConfig = {
  // Use native lazy loading for images
  native: true,
  
  // Intersection Observer options
  observer: {
    root: null, // viewport
    rootMargin: '50px 0px', // Load 50px before entering viewport
    threshold: 0.01,
  },
  
  // Fallback for browsers that don't support native lazy loading
  fallback: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNlNWU3ZGIiLz48L3N2Zz4=',
};

// Image formats support detection
export const supportsWebP = () => {
  if (typeof window === 'undefined') return true;
  
  const canvas = document.createElement('canvas');
  if (canvas.getContext && canvas.getContext('2d')) {
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  }
  return false;
};

export const supportsAVIF = () => {
  if (typeof window === 'undefined') return true;
  
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    try {
      return ctx.getImageData(0, 0, 1, 1).data.length === 4;
    } catch (e) {
      return false;
    }
  }
  return false;
};

// Get best supported format
export const getBestImageFormat = () => {
  if (supportsAVIF()) return 'avif';
  if (supportsWebP()) return 'webp';
  return 'fallback';
};

// Preload critical images
export const preloadImage = (src, as = 'image') => {
  if (typeof document === 'undefined') return;
  
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = as;
  link.href = src;
  if (as === 'image') {
    link.type = 'image/webp';
  }
  document.head.appendChild(link);
};

// Preload multiple images
export const preloadImages = (urls) => {
  urls.forEach(url => preloadImage(url));
};

// Responsive image component props generator
export const generateImageProps = (src, alt, options = {}) => {
  const {
    width = 800,
    height,
    sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
    priority = false,
  } = options;

  const optimizedSrc = getOptimizedImageUrl(src, { width, quality: 75 });
  const srcSet = generateImageSrcSet(src, { 
    widths: [320, 640, 768, 1024, 1280],
    quality: 75 
  });

  return {
    src: optimizedSrc,
    srcSet: srcSet || undefined,
    sizes: sizes || undefined,
    alt: alt || '',
    width: height ? undefined : width,
    height: height,
    loading: priority ? 'eager' : 'lazy',
    decoding: 'async',
    fetchpriority: priority ? 'high' : 'auto',
  };
};