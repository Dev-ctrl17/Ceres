# Performance Optimization Guide

## Lighthouse Audit Results Summary

### ✅ Fixed Issues
1. **Accessibility**: Added `aria-label` and `aria-expanded` to mobile menu button in Header.jsx

### 🔧 Recommended Optimizations

## 1. Image Optimization (Est. savings: 84+ KiB)

### Current Issues:
- Logo image (ibb.co): 87.3 KiB - PNG format, could be WebP
- Content images (image2url.com): 85.8 KiB - JPEG, oversized for display dimensions

### Recommended Actions:

#### A. Convert Images to Modern Formats
```bash
# Convert PNG/JPEG to WebP using ImageMagick or Sharp
# Example: Convert logo to WebP
magick logo.png -quality 85 -resize 160x80 logo.webp

# Expected savings: 60-75% file size reduction
```

#### B. Implement Responsive Images
Replace static image URLs with responsive srcset:

```jsx
// In Header.jsx - Logo
<img
  src="https://i.ibb.co/39gLw9kX/Chat-GPT-Image-Jun-12-2026-01-18-03-AM.webp"
  srcSet="https://i.ibb.co/39gLw9kX/Chat-GPT-Image-Jun-12-2026-01-18-03-AM.webp 160w,
          https://i.ibb.co/39gLw9kX/Chat-GPT-Image-Jun-12-2026-01-18-03-AM@2x.webp 320w"
  sizes="(max-width: 640px) 120px, (max-width: 1024px) 140px, 160px"
  alt="Luxury Property"
  loading="eager"
  decoding="async"
/>
```

#### C. Add `decoding="async"` to All Images
```jsx
<img 
  src="..." 
  alt="..." 
  loading="lazy" 
  decoding="async"  // Add this
/>
```

#### D. Use CDN with Auto-Optimization
Consider using Cloudinary, Imgix, or similar CDN that auto-converts to WebP:
```
https://res.cloudinary.com/your-cloud/image/fetch/w_160,q_auto,f_webp/https://i.ibb.co/...
```

## 2. Reduce Render-Blocking Resources (Est. savings: 600ms)

### Current Issues:
- CSS file blocks initial render: 15.7 KiB, 340ms
- Google Fonts: 1.5 KiB, 750ms

### Solutions Implemented:
✅ Added CSS preload with `onload` trick in index.html
✅ Added `display=swap` to Google Fonts

### Additional Recommendations:

#### A. Inline Critical CSS
Extract and inline critical above-the-fold CSS to eliminate render-blocking:

```html
<style>
  /* Critical CSS for header, hero section */
  .sticky { position: sticky; top: 0; z-index: 50; }
  /* ... minimal styles for initial render */
</style>
<link rel="preload" href="/assets/index-qbjMrc1r.css" as="style" 
      onload="this.onload=null;this.rel='stylesheet'" />
<noscript><link rel="stylesheet" href="/assets/index-qbjMrc1r.css" /></noscript>
```

#### B. Split CSS by Route
Use dynamic imports for page-specific CSS:
```javascript
const BuyPage = lazy(() => import('./pages/BuyPage'));
```

## 3. Reduce Unused JavaScript (Est. savings: 154 KiB)

### Current Issues:
- vendor-supabase: 52.7 KiB (42.7 KiB unused)
- index.js: 59.0 KiB (26.3 KiB unused)
- vendor-ui: 40.9 KiB (22.2 KiB unused)
- Google Tag Manager: 156.0 KiB (62.6 KiB unused)

### Solutions:

#### A. Code Splitting
```javascript
// In App.jsx or main.jsx
import { lazy, Suspense } from 'react';

const BuyPage = lazy(() => import('./pages/BuyPage'));
const RentPage = lazy(() => import('./pages/RentPage'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));

// Wrap routes with Suspense
<Suspense fallback={<LoadingSpinner />}>
  <Routes>
    <Route path="/buy" element={<BuyPage />} />
    {/* ... */}
  </Routes>
</Suspense>
```

#### B. Tree Shaking
Ensure build tool (Vite) is configured for optimal tree shaking:
```javascript
// vite.config.js
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui': ['@radix-ui/react-select', '@radix-ui/react-dialog'],
          'vendor-supabase': ['@supabase/supabase-js'],
        }
      }
    }
  }
}
```

#### C. Defer Non-Critical Scripts
```html
<!-- Move GTM to end of body or use custom loading -->
<script>
  // Load GTM after page is interactive
  window.addEventListener('load', () => {
    const script = document.createElement('script');
    script.src = 'https://www.googletagmanager.com/gtag/js?id=G-0E4JGVMVLV';
    script.async = true;
    document.body.appendChild(script);
  });
</script>
```

## 4. Reduce Unused CSS (Est. savings: 13 KiB)

### Solutions:

#### A. Use PurgeCSS with Tailwind
```javascript
// tailwind.config.js
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './public/**/*.html',
  ],
  // ...
}
```

#### B. Remove Unused UI Components
Audit and remove unused shadcn/ui components:
```bash
# Only import components you actually use
import { Button } from '@/components/ui/button';
// Remove: import { Calendar } from '@/components/ui/calendar';
```

## 5. Minimize Main-Thread Work (2.1s)

### Current Issues:
- Script Evaluation: 947ms
- Style & Layout: 315ms
- Script Parsing: 296ms

### Solutions:

#### A. Use Web Workers for Heavy Computation
```javascript
// Move data processing to web worker
const processProperties = (properties) => {
  // Heavy filtering/sorting logic
  return filtered;
};
```

#### B. Optimize React Rendering
```javascript
// Use React.memo for expensive components
const PropertyCard = React.memo(({ property }) => {
  // ...
});

// Use useMemo for expensive calculations
const filteredProperties = useMemo(() => {
  return properties.filter(p => p.status === 'Available');
}, [properties]);
```

#### C. Reduce Re-renders
```javascript
// Use useCallback for event handlers
const handleSearch = useCallback(() => {
  // ...
}, [filters]);
```

## 6. Implement Service Worker for Caching

```javascript
// public/sw.js
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open('luxury-properties-v1').then((cache) => {
      return cache.addAll([
        '/',
        '/assets/index.css',
        '/assets/index.js',
        // Critical assets
      ]);
    })
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => {
      return response || fetch(e.request);
    })
  );
});
```

## 7. Image Optimization Checklist

- [ ] Convert all PNG/JPEG to WebP format
- [ ] Implement responsive images with srcset
- [ ] Add `decoding="async"` to all images
- [ ] Use `loading="lazy"` for below-fold images
- [ ] Specify width/height attributes to prevent layout shift
- [ ] Use CDN with auto-format conversion
- [ ] Compress images to optimal quality (80-85%)
- [ ] Remove EXIF data from images

## 8. JavaScript Optimization Checklist

- [ ] Implement code splitting with React.lazy()
- [ ] Configure manual chunks in Vite/Rollup
- [ ] Remove unused dependencies from package.json
- [ ] Defer non-critical scripts (analytics, reviews widget)
- [ ] Use dynamic imports for heavy libraries
- [ ] Implement service worker for caching
- [ ] Audit bundle size with `rollup-plugin-visualizer`

## 9. CSS Optimization Checklist

- [ ] Enable PurgeCSS/Tailwind content scanning
- [ ] Remove unused UI components
- [ ] Inline critical CSS
- [ ] Defer non-critical CSS
- [ ] Minify CSS in production build

## Priority Implementation Order

1. **High Priority** (Quick wins, big impact):
   - ✅ Add aria-label to buttons (DONE)
   - Add `decoding="async"` to all images
   - Implement CSS preload (DONE)
   - Add `display=swap` to fonts (DONE)

2. **Medium Priority** (Moderate effort, good impact):
   - Convert images to WebP
   - Implement code splitting
   - Configure Vite for optimal bundling
   - Defer GTM and Elfsight scripts

3. **Low Priority** (Longer-term optimizations):
   - Implement service worker
   - Set up image CDN
   - Inline critical CSS
   - Advanced React performance optimizations

## Expected Performance Improvements

After implementing all recommendations:
- **LCP**: 4.0s → 2.0s (50% improvement)
- **FCP**: 2.3s → 1.2s (48% improvement)
- **TBT**: 2.1s → 0.8s (62% improvement)
- **Total Page Size**: ~500 KiB → ~300 KiB (40% reduction)
- **Accessibility Score**: 85 → 100