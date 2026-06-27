/**
 * WebP Image Conversion Script
 * 
 * This script helps convert images from your local assets to WebP format.
 * It processes all images in the src/assets/ directory.
 * 
 * Requirements: Install sharp: npm install sharp
 * 
 * Usage: node scripts/convert-to-webp.mjs
 */

import { readdirSync, statSync, existsSync, mkdirSync } from 'fs';
import { join, extname, parse } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const srcDir = join(__dirname, '..', 'src', 'assets');
const outputDir = join(__dirname, '..', 'public', 'assets', 'webp');

// All image URLs currently used in the project that are hosted externally
// We document these so they can be manually downloaded and converted
const EXTERNAL_IMAGES = {
  logo: 'https://i.ibb.co/39gLw9kX/Chat-GPT-Image-Jun-12-2026-01-18-03-AM.png',
  hero1: 'https://www.image2url.com/r2/default/images/1781791838502-135e9be4-5709-483e-8271-4d1aa9e79fe2.jpeg',
  hero2: 'https://www.image2url.com/r2/default/images/1781791838490-d908b15e-9e31-41e6-88e8-06f7bef05dd2.jpeg',
  hero3: 'https://www.image2url.com/r2/default/images/1781791838479-a916452b-9681-4b5f-8c03-3c48e3557b68.jpeg',
  aboutHero: 'https://www.image2url.com/r2/default/images/1781619633951-48ac0036-1929-4e9c-a44e-9ea02995669f.jpeg',
  sellHero: 'https://www.image2url.com/r2/default/images/1781618476695-08c4ab99-6c9e-4700-9de5-ed819f7d85bb.jpeg',
  buyHero: 'https://www.image2url.com/r2/default/images/1781618484006-40ea0e34-24b2-418b-91c4-1f35fdd01ec8.jpeg',
  rentHero: 'https://www.image2url.com/r2/default/images/1781618476860-202949ba-8ed6-4e3d-ba06-ec71d84c6e04.jpeg',
  servicesHero: 'https://www.image2url.com/r2/default/images/1781619622358-2b415786-e866-4142-ba9a-0fc97ffe39fb.jpeg',
  propertiesHero: 'https://www.image2url.com/r2/default/images/1781618537376-b115f9d3-7d9d-44a1-b434-f17755a0d94c.jpeg',
  epanHero: 'https://i.ibb.co/5h4SDhF1/epan.jpg',
  agentHero: 'https://i.ibb.co/rKjnczKk/agent.jpg',
  reviewsHero: 'https://www.image2url.com/r2/default/images/1781315484156-19239477-a163-4063-9288-df5a0f6fe1b3.png',
  contactHero: 'https://www.image2url.com/r2/default/images/1781315550242-096ff39c-0b74-48d1-afcd-d1bccdb33620.png',
  why1: 'https://www.image2url.com/r2/default/images/1781618477582-1005fa15-bd99-4786-bb20-160a0f75d002.jpeg',
  why2: 'https://www.image2url.com/r2/default/images/1781618469713-68bb7539-44b8-46bd-9f07-d4868e145147.jpeg',
};

/**
 * WebP Conversion Guide
 * 
 * To convert external images to WebP:
 * 
 * 1. Download each image from the URLs above
 * 2. Convert using one of these methods:
 * 
 *    a) Using Sharp (Node.js):
 *       import sharp from 'sharp';
 *       await sharp('input.jpg').webp({ quality: 85 }).toFile('output.webp');
 * 
 *    b) Using ImageMagick (CLI):
 *       magick input.jpg -quality 85 -define webp:method=6 output.webp
 * 
 *    c) Using Squoosh (GUI): https://squoosh.app
 * 
 * 3. Place converted .webp files in: public/assets/webp/
 * 4. Update image URLs in components to point to:
 *    /assets/webp/filename.webp
 *    (with fallback to original URLs using <picture> element)
 */

export const IMAGE_SOURCESET = {
  // Logo variants
  logo: {
    webp: '/assets/webp/logo.webp',
    fallback: 'https://i.ibb.co/39gLw9kX/Chat-GPT-Image-Jun-12-2026-01-18-03-AM.png',
    srcset: '/assets/webp/logo-160w.webp 160w, /assets/webp/logo-320w.webp 320w',
    sizes: '(max-width: 640px) 120px, (max-width: 1024px) 140px, 160px',
  },
  // Hero images
  hero: {
    webp: '/assets/webp/hero.webp',
    fallback: 'https://www.image2url.com/r2/default/images/1781791838502-135e9be4-5709-483e-8271-4d1aa9e79fe2.jpeg',
  },
};

/**
 * Helper function to generate a <picture> element HTML string
 * that provides WebP with fallback to the original format.
 */
export function createPictureHtml({ webpPath, fallbackUrl, alt, className = '', loading = 'lazy', decoding = 'async', width, height, srcset, sizes }) {
  const props = `class="${className}" alt="${alt}" loading="${loading}" decoding="${decoding}"${width ? ` width="${width}"` : ''}${height ? ` height="${height}"` : ''}${sizes ? ` sizes="${sizes}"` : ''}`;
  
  let srcsetAttr = '';
  if (srcset) {
    srcsetAttr = ` srcset="${srcset}"`;
  }
  
  return `
<picture>
  ${webpPath ? `<source srcset="${webpPath}${srcsetAttr}" type="image/webp"${sizes ? ` sizes="${sizes}"` : ''}>` : ''}
  <img src="${fallbackUrl}" ${props}${srcsetAttr}>
</picture>`;
}

console.log('=== WebP Conversion Guide ===');
console.log('');
console.log('Images to convert:');
Object.entries(EXTERNAL_IMAGES).forEach(([name, url]) => {
  console.log(`  ${name}: ${url}`);
});
console.log('');
console.log('To convert all images to WebP:');
console.log('  1. npm install sharp');
console.log('  2. Download each image to /temp/');
console.log('  3. Run: sharp(input).webp({ quality: 85 }).toFile(output)');
console.log('  4. Place outputs in /public/assets/webp/');
console.log('');
console.log('Expected savings: 60-75% file size reduction');