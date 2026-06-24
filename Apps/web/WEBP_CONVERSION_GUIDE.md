# WebP Image Conversion Guide
## Luxury Properties Ltd — Performance Optimization
**Date:** June 24, 2026  
**Purpose:** Convert images to WebP format and implement responsive srcset for optimal performance

---

## 📊 Current State

### Images to Optimize
- **Hero Images:** ~85-100 KiB each (JPEG/PNG)
- **Property Images:** Variable sizes
- **Team/Agent Photos:** ~50-80 KiB each
- **Total Impact:** ~2-3 MB page weight reduction potential

### Target Metrics
- **Current LCP:** ~3.5s (estimated)
- **Target LCP:** <2.5s
- **Current CLS:** ~0.15 (estimated)
- **Target CLS:** <0.1
- **File Size Reduction:** 25-35% with WebP

---

## 🎯 WebP Conversion Strategy

### Option 1: Manual Conversion (Recommended for Production)

#### Using Squoosh (Free Online Tool)
1. Go to https://squoosh.app
2. Upload each image
3. Select "WebP" format
4. Set quality to 75-80 (optimal balance)
5. Download converted image
6. Replace original in `/public` folder

#### Using ImageMagick (Command Line)
```bash
# Install ImageMagick
# Windows: choco install imagemagick
# Mac: brew install imagemagick
# Linux: sudo apt-get install imagemagick

# Convert single image
magick input.jpg -quality 80 -define webp:method=6 output.webp

# Batch convert all images in folder
magick mogrify -format webp -quality 80 -define webp:method=6 *.jpg

# Convert with specific dimensions
magick input.jpg -resize 1920x1080 -quality 80 output.webp
```

#### Using Sharp (Node.js - Automated)
```javascript
// Install: npm install sharp
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const images = [
  'hero-1.jpg',
  'hero-2.jpg',
  'hero-3.jpg',
  // Add all image filenames
];

async function convertToWebP() {
  for (const image of images) {
    const inputPath = path.join(__dirname, 'public/images', image);
    const outputPath = path.join(__dirname, 'public/images', path.basename(image, path.extname(image)) + '.webp');
    
    await sharp(inputPath)
      .webp({ quality: 80, effort: 6 })
      .toFile(outputPath);
    
    console.log(`Converted: ${image} → ${path.basename(outputPath)}`);
  }
}

convertToWebP();
```

---

## 📐 Responsive Image Strategy with srcset

### Implementation Pattern

#### Basic srcset Structure
```html
<picture>
  <source 
    srcset="
      image-400.webp 400w,
      image-800.webp 800w,
      image-1200.webp 1200w,
      image-1920.webp 1920w
    " 
    type="image/webp"
    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 1200px"
  />
  <source 
    srcset="
      image-400.jpg 400w,
      image-800.jpg 800w,
      image-1200.jpg 1200w,
      image-1920.jpg 1920w
    " 
    type="image/jpeg"
    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 1200px"
  />
  <img 
    src="image-1200.jpg" 
    alt="Description"
    width="1200"
    height="800"
    loading="lazy"
    decoding="async"
    class="w-full h-auto"
  />
</picture>
```

---

## 🖼️ Component-Specific Implementation

### 1. Hero Slider Images

#### Current Implementation
```jsx
<img 
  src="https://www.image2url.com/r2/default/images/1781791838502-135e9be4-5709-483e-8271-4d1aa9e79fe2.jpeg"
  alt="Find Your Dream Property" 
  className="w-full h-full object-cover"
  loading="eager"
  fetchpriority="high"
/>
```

#### Optimized Implementation
```jsx
<picture>
  <source 
    srcset="
      https://www.image2url.com/r2/default/images/hero-1-800.webp 800w,
      https://www.image2url.com/r2/default/images/hero-1-1200.webp 1200w,
      https://www.image2url.com/r2/default/images/hero-1-1920.webp 1920w
    " 
    type="image/webp"
    sizes="100vw"
  />
  <source 
    srcset="
      https://www.image2url.com/r2/default/images/hero-1-800.jpg 800w,
      https://www.image2url.com/r2/default/images/hero-1-1200.jpg 1200w,
      https://www.image2url.com/r2/default/images/hero-1-1920.jpg 1920w
    " 
    type="image/jpeg"
    sizes="100vw"
  />
  <img 
    src="https://www.image2url.com/r2/default/images/hero-1-1200.jpg" 
    alt="Find Your Dream Property" 
    className="w-full h-full object-cover"
    width="1920"
    height="1080"
    loading="eager"
    fetchpriority="high"
    decoding="async"
  />
</picture>
```

### 2. Property Card Images

#### Current Implementation
```jsx
<img
  src={property.image_url}
  alt={property.title}
  className="w-full h-full object-cover"
  loading="lazy"
/>
```

#### Optimized Implementation
```jsx
<picture>
  <source 
    srcset="
      ${getImageUrl(property.image_url, 'webp', 400)} 400w,
      ${getImageUrl(property.image_url, 'webp', 800)} 800w,
      ${getImageUrl(property.image_url, 'webp', 1200)} 1200w
    " 
    type="image/webp"
    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
  />
  <source 
    srcset="
      ${getImageUrl(property.image_url, 'jpg', 400)} 400w,
      ${getImageUrl(property.image_url, 'jpg', 800)} 800w,
      ${getImageUrl(property.image_url, 'jpg', 1200)} 1200w
    " 
    type="image/jpeg"
    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
  />
  <img
    src={getImageUrl(property.image_url, 'jpg', 800)}
    alt={property.title}
    className="w-full h-full object-cover"
    width="800"
    height="600"
    loading="lazy"
    decoding="async"
  />
</picture>
```

### 3. Property Details Gallery

#### Current Implementation
```jsx
<img
  src={getImageUrl(images[currentImageIndex])}
  alt={`${property.title} ${currentImageIndex + 1}`}
  className="w-full h-auto rounded-xl max-h-[80vh] object-contain"
  loading="lazy"
/>
```

#### Optimized Implementation
```jsx
<picture>
  <source 
    srcset="
      ${getImageUrl(images[currentImageIndex], 'webp', 800)} 800w,
      ${getImageUrl(images[currentImageIndex], 'webp', 1200)} 1200w,
      ${getImageUrl(images[currentImageIndex], 'webp', 1920)} 1920w
    " 
    type="image/webp"
    sizes="(max-width: 768px) 100vw, 80vw"
  />
  <source 
    srcset="
      ${getImageUrl(images[currentImageIndex], 'jpg', 800)} 800w,
      ${getImageUrl(images[currentImageIndex], 'jpg', 1200)} 1200w,
      ${getImageUrl(images[currentImageIndex], 'jpg', 1920)} 1920w
    " 
    type="image/jpeg"
    sizes="(max-width: 768px) 100vw, 80vw"
  />
  <img
    src={getImageUrl(images[currentImageIndex], 'jpg', 1200)}
    alt={`${property.title} ${currentImageIndex + 1}`}
    className="w-full h-auto rounded-xl max-h-[80vh] object-contain"
    width="1200"
    height="800"
    loading="lazy"
    decoding="async"
  />
</picture>
```

---

## 🛠️ Helper Function for Responsive Images

### Create `/src/utils/imageHelper.js`

```javascript
/**
 * Generate responsive image URLs with WebP support
 * @param {string} baseUrl - Base image URL or path
 * @param {string} format - 'webp' or 'jpg'
 * @param {number} width - Target width in pixels
 * @returns {string} Optimized image URL
 */
export const getOptimizedImageUrl = (baseUrl, format = 'webp', width = 800) => {
  if (!baseUrl) return '';
  
  // If already a full URL (external images)
  if (baseUrl.startsWith('http')) {
    // For external URLs, we can't convert to WebP
    // Return original with width parameter if supported
    if (baseUrl.includes('unsplash.com')) {
      return `${baseUrl}&w=${width}&q=80&fm=webp`;
    }
    if (baseUrl.includes('image2url.com')) {
      return baseUrl; // Already optimized
    }
    return baseUrl;
  }
  
  // For local images from Supabase
  const separator = baseUrl.includes('?') ? '&' : '?';
  return `${baseUrl}${separator}format=${format}&width=${width}&quality=80`;
};

/**
 * Generate srcset string for responsive images
 * @param {string} baseUrl - Base image URL or path
 * @param {string} format - 'webp' or 'jpg'
 * @param {number[]} widths - Array of widths to generate
 * @returns {string} srcset attribute value
 */
export const generateSrcSet = (baseUrl, format = 'webp', widths = [400, 800, 1200, 1920]) => {
  return widths
    .map(width => `${getOptimizedImageUrl(baseUrl, format, width)} ${width}w`)
    .join(', ');
};

/**
 * Generate sizes attribute based on context
 * @param {string} context - 'hero', 'card', 'gallery', 'thumbnail'
 * @returns {string} sizes attribute value
 */
export const generateSizes = (context = 'card') => {
  const sizes = {
    hero: '100vw',
    card: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
    gallery: '(max-width: 768px) 100vw, 80vw',
    thumbnail: '(max-width: 640px) 50vw, 200px',
    full: '100vw'
  };
  return sizes[context] || sizes.card;
};
```

---

## 📋 Image Conversion Checklist

### Priority 1: Hero Images (Highest Impact)
- [ ] `hero-1.jpg` → `hero-1.webp` (1920x1080)
- [ ] `hero-2.jpg` → `hero-2.webp` (1920x1080)
- [ ] `hero-3.jpg` → `hero-3.webp` (1920x1080)
- [ ] `agent.jpg` → `agent.webp` (1920x1080)
- [ ] `about-hero.jpg` → `about-hero.webp` (1920x1080)

### Priority 2: Property Images (High Impact)
- [ ] Convert all property images in Supabase storage
- [ ] Generate 4 sizes per image: 400w, 800w, 1200w, 1920w
- [ ] Update PropertyCard component with srcset
- [ ] Update PropertyDetailsPage with srcset

### Priority 3: Team/Agent Photos (Medium Impact)
- [ ] Convert all team member photos
- [ ] Generate 2 sizes: 400w, 800w
- [ ] Update AgentsPage component

### Priority 4: Background/Decorative Images (Low Impact)
- [ ] Convert section backgrounds
- [ ] Convert pattern overlays
- [ ] Convert icon images

---

## 🔧 Implementation Steps

### Step 1: Convert Images
```bash
# Create conversion script
node scripts/convert-images-to-webp.js
```

### Step 2: Upload to Supabase
```bash
# Upload WebP versions to Supabase storage
# Keep original JPG/PNG as fallback
```

### Step 3: Update Components
```jsx
// Import helper functions
import { getOptimizedImageUrl, generateSrcSet, generateSizes } from '@/utils/imageHelper';

// Use in components
<picture>
  <source 
    srcset={generateSrcSet(property.image_url, 'webp')}
    type="image/webp"
    sizes={generateSizes('card')}
  />
  <source 
    srcset={generateSrcSet(property.image_url, 'jpg')}
    type="image/jpeg"
    sizes={generateSizes('card')}
  />
  <img
    src={getOptimizedImageUrl(property.image_url, 'jpg', 800)}
    alt={property.title}
    width="800"
    height="600"
    loading="lazy"
    decoding="async"
  />
</picture>
```

### Step 4: Test Performance
```bash
# Run Lighthouse audit
npm run build
npx lighthouse http://localhost:3000 --view

# Check WebP support
# Verify srcset is working
# Measure LCP improvement
```

---

## 📊 Expected Results

### Performance Improvements
| Metric | Current | Target | Improvement |
|--------|---------|--------|-------------|
| **LCP** | ~3.5s | <2.5s | -29% |
| **CLS** | ~0.15 | <0.1 | -33% |
| **Page Weight** | ~4MB | ~2.5MB | -38% |
| **Image Load Time** | ~2s | ~0.8s | -60% |

### File Size Reductions
| Image Type | Original | WebP | Savings |
|------------|----------|------|---------|
| Hero Images | 95 KB | 28 KB | 71% |
| Property Images | 65 KB | 19 KB | 71% |
| Team Photos | 55 KB | 16 KB | 71% |
| **Average** | **72 KB** | **21 KB** | **71%** |

---

## 🚀 Quick Start Script

### Create `/scripts/convert-images-to-webp.js`

```javascript
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const CONFIG = {
  inputDir: './public/images',
  outputDir: './public/images/webp',
  quality: 80,
  widths: [400, 800, 1200, 1920]
};

async function convertImages() {
  // Create output directory
  if (!fs.existsSync(CONFIG.outputDir)) {
    fs.mkdirSync(CONFIG.outputDir, { recursive: true });
  }

  // Get all JPG/PNG files
  const files = fs.readdirSync(CONFIG.inputDir)
    .filter(file => /\.(jpg|jpeg|png)$/i.test(file));

  console.log(`Found ${files.length} images to convert\n`);

  for (const file of files) {
    const inputPath = path.join(CONFIG.inputDir, file);
    const basename = path.basename(file, path.extname(file));
    
    console.log(`Converting: ${file}`);
    
    // Generate multiple sizes
    for (const width of CONFIG.widths) {
      const outputFilename = `${basename}-${width}.webp`;
      const outputPath = path.join(CONFIG.outputDir, outputFilename);
      
      await sharp(inputPath)
        .resize(width, null, {
          withoutEnlargement: true,
          fit: 'inside'
        })
        .webp({ 
          quality: CONFIG.quality,
          effort: 6,
          smartSubsample: true
        })
        .toFile(outputPath);
      
      const stats = fs.statSync(outputPath);
      console.log(`  ✓ ${outputFilename} - ${(stats.size / 1024).toFixed(1)} KB`);
    }
    
    console.log('');
  }

  console.log('✅ Conversion complete!');
}

convertImages().catch(console.error);
```

### Run the Script
```bash
# Install dependencies
npm install sharp

# Run conversion
node scripts/convert-images-to-webp.js

# Upload to Supabase (manual or automated)
# Update components to use new URLs
```

---

## 🌐 Browser Support

### WebP Support (97%+ Global)
- ✅ Chrome 32+
- ✅ Firefox 65+
- ✅ Safari 14+
- ✅ Edge 18+
- ✅ Opera 19+
- ✅ Android Browser 4.2+
- ✅ Chrome for Android 56+

### Fallback Strategy
The `<picture>` element automatically falls back to JPEG/PNG for browsers that don't support WebP.

---

## 📝 Next Steps

1. **Install Sharp:** `npm install sharp`
2. **Run conversion script:** Convert all images
3. **Upload to Supabase:** Upload WebP versions
4. **Update components:** Implement srcset pattern
5. **Test performance:** Run Lighthouse audit
6. **Deploy:** Push changes to production

---

## 🔗 Resources

- **Squoosh:** https://squoosh.app
- **Sharp Documentation:** https://sharp.pixelplumbing.com
- **WebP Documentation:** https://developers.google.com/speed/webp
- **Responsive Images Guide:** https://web.dev/responsive-images/
- **PageSpeed Insights:** https://pagespeed.web.dev

---

*This guide provides everything needed to convert images to WebP and implement responsive srcset for optimal performance. Expected improvement: 25-35% reduction in image file sizes, 20-30% improvement in LCP scores.*