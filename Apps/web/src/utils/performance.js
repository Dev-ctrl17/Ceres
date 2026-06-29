// Performance Optimization Utilities
// Handles caching, prefetching, and Core Web Vitals optimization

// Resource hints for critical resources
export const resourceHints = {
  // Preconnect to critical origins
  preconnect: [
    'https://lrmljudwbzjawafuztwp.supabase.co',
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com',
  ],
  
  // DNS prefetch for less critical resources
  dnsPrefetch: [
    'https://images.unsplash.com',
    'https://i.ibb.co',
    'https://www.google-analytics.com',
  ],
  
  // Preload critical assets
  preload: [
    {
      href: '/og-image.png',
      as: 'image',
      type: 'image/png',
    },
  ],
  
  // Prefetch next likely pages
  prefetch: [
    '/properties',
    '/buy',
    '/rent',
  ],
};

// Cache strategies for different resource types
export const cacheStrategies = {
  // Static assets - cache for 1 year
  static: {
    maxAge: '1y',
    immutable: true,
    staleWhileRevalidate: '1d',
  },
  
  // Images - cache for 30 days
  images: {
    maxAge: '30d',
    immutable: false,
    staleWhileRevalidate: '7d',
  },
  
  // HTML pages - no cache, always revalidate
  html: {
    maxAge: '0',
    noCache: true,
    mustRevalidate: true,
  },
  
  // API responses - cache for 5 minutes
  api: {
    maxAge: '5m',
    staleWhileRevalidate: '1h',
  },
  
  // Fonts - cache for 1 year
  fonts: {
    maxAge: '1y',
    immutable: true,
    crossOrigin: 'anonymous',
  },
};

// Core Web Vitals optimization
export const webVitalsOptimization = {
  // Largest Contentful Paint (LCP) optimization
  lcp: {
    // Preload LCP image
    preloadHeroImage: (imageUrl) => {
      if (typeof document === 'undefined') return;
      
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = imageUrl;
      if (imageUrl.includes('.webp') || imageUrl.includes('webp')) {
        link.type = 'image/webp';
      }
      document.head.appendChild(link);
    },
    
    // Optimize hero image
    optimizeHeroImage: (url) => {
      return getOptimizedImageUrl(url, { 
        width: 1200, 
        quality: 80, 
        format: 'webp' 
      });
    },
  },
  
  // Cumulative Layout Shift (CLS) optimization
  cls: {
    // Reserve space for images
    reserveImageSpace: (aspectRatio = '16/9') => {
      return {
        aspectRatio,
        className: 'bg-gray-100 animate-pulse',
      };
    },
    
    // Reserve space for iframes
    reserveIframeSpace: (aspectRatio = '16/9') => {
      return {
        aspectRatio,
        className: 'bg-gray-100',
      };
    },
  },
  
  // First Input Delay (FID) / Interaction to Next Paint (INP) optimization
  inp: {
    // Debounce function for search inputs
    debounce: (func, wait) => {
      let timeout;
      return function executedFunction(...args) {
        const later = () => {
          clearTimeout(timeout);
          func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    },
    
    // Throttle function for scroll events
    throttle: (func, limit) => {
      let inThrottle;
      return function(...args) {
        if (!inThrottle) {
          func.apply(this, args);
          inThrottle = true;
          setTimeout(() => inThrottle = false, limit);
        }
      };
    },
  },
};

// Service Worker registration for offline caching
export const registerServiceWorker = async () => {
  if (typeof window === 'undefined') return;
  
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered:', registration);
      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }
};

// Prefetch critical routes
export const prefetchRoutes = (routes) => {
  if (typeof window === 'undefined') return;
  
  // Use requestIdleCallback to prefetch during idle time
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(() => {
      routes.forEach(route => {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = route;
        link.as = 'document';
        document.head.appendChild(link);
      });
    });
  }
};

// Lazy load non-critical components
export const lazyLoadComponent = (importFn) => {
  return import(/* webpackChunkName: "lazy-[request]" */ importFn);
};

// Bundle size optimization
export const optimizationConfig = {
  // Split code by routes
  codeSplitting: {
    strategy: 'route-based',
    maxSize: 100, // KB
  },
  
  // Tree shaking
  treeShaking: {
    enabled: true,
    sideEffects: false,
  },
  
  // Minification
  minification: {
    enabled: true,
    removeComments: true,
    dropConsole: true, // Remove console.log in production
    dropDebugger: true,
  },
  
  // Compression
  compression: {
    gzip: true,
    brotli: true,
  },
};

// Mobile optimization
export const mobileOptimization = {
  // Viewport configuration
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
  },
  
  // Touch target sizes (minimum 44x44px for accessibility)
  touchTarget: {
    minSize: 44,
    padding: 8,
  },
  
  // Font sizes (minimum 16px to prevent zoom on iOS)
  fontSize: {
    base: 16,
    small: 14,
    large: 18,
  },
  
  // Responsive breakpoints
  breakpoints: {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536,
  },
  
  // Image optimization for mobile
  mobileImages: {
    maxWidth: 768,
    quality: 70,
    format: 'webp',
  },
  
  // Reduce animations on mobile for performance
  reduceMotion: {
    mediaQuery: '(prefers-reduced-motion: reduce)',
    fallback: true,
  },
};

// Critical CSS extraction (inline critical CSS)
export const extractCriticalCSS = () => {
  // This would typically be done at build time
  // For now, return critical styles that should be inlined
  return `
    body { font-family: 'DM Sans', sans-serif; margin: 0; }
    .container { max-width: 1200px; margin: 0 auto; }
    img { max-width: 100%; height: auto; }
  `;
};

// Performance monitoring
export const measurePerformance = () => {
  if (typeof window === 'undefined' || !('performance' in window)) return;
  
  // Measure Core Web Vitals
  const vitals = {
    // LCP - Largest Contentful Paint
    lcp: null,
    
    // FID - First Input Delay
    fid: null,
    
    // CLS - Cumulative Layout Shift
    cls: null,
    
    // FCP - First Contentful Paint
    fcp: null,
    
    // TTFB - Time to First Byte
    ttfb: null,
  };
  
  // Measure LCP
  if ('PerformanceObserver' in window) {
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        vitals.lcp = lastEntry.renderTime || lastEntry.loadTime;
        console.log('LCP:', vitals.lcp);
      });
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
    } catch (e) {
      console.error('LCP measurement failed:', e);
    }
    
    // Measure CLS
    try {
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        }
        vitals.cls = clsValue;
        console.log('CLS:', vitals.cls);
      });
      clsObserver.observe({ type: 'layout-shift', buffered: true });
    } catch (e) {
      console.error('CLS measurement failed:', e);
    }
  }
  
  // Measure FCP and TTFB
  window.addEventListener('load', () => {
    const timing = performance.timing;
    vitals.fcp = timing.responseStart - timing.navigationStart;
    vitals.ttfb = timing.responseStart - timing.requestStart;
    console.log('FCP:', vitals.fcp);
    console.log('TTFB:', vitals.ttfb);
  });
  
  return vitals;
};

// Export all utilities
export default {
  resourceHints,
  cacheStrategies,
  webVitalsOptimization,
  registerServiceWorker,
  prefetchRoutes,
  lazyLoadComponent,
  optimizationConfig,
  mobileOptimization,
  extractCriticalCSS,
  measurePerformance,
};