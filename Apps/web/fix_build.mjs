import fs from 'fs';

// Fix 1: Move Google Fonts from HTML to CSS to avoid html-inline-proxy build error
const indexPath = 'index.html';
let indexHtml = fs.readFileSync(indexPath, 'utf8');

const oldFontLinks = `    <!-- Google Fonts: Optimized with display=swap for FCP, wght restrictions for smaller payload -->
    <link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Playfair+Display:wght@400;600;700&display=swap" />
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Playfair+Display:wght@400;600;700&display=swap" media="print" onload="this.media='all'" />
    <noscript>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Playfair+Display:wght@400;600;700&display=swap" />
    </noscript>`;

const newFontLinks = `    <!-- Google Fonts loaded via CSS @import in src/index.css to avoid Vite html-inline-proxy errors with external URLs -->
    <!-- Preconnect hints kept for connection performance -->`;

if (indexHtml.includes(oldFontLinks)) {
  indexHtml = indexHtml.replace(oldFontLinks, newFontLinks);
  fs.writeFileSync(indexPath, indexHtml);
  console.log('✓ Fixed index.html: removed external stylesheet links');
} else {
  console.log('⚠ Could not find font links in index.html - may already be fixed');
}

// Fix 2: Add font import to CSS
const cssPath = 'src/index.css';
let css = fs.readFileSync(cssPath, 'utf8');

if (!css.includes('fonts.googleapis.com')) {
  const fontImport = "@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Playfair+Display:wght@400;600;700&display=swap');\n\n";
  css = fontImport + css;
  fs.writeFileSync(cssPath, css);
  console.log('✓ Fixed src/index.css: added @import for Google Fonts');
} else {
  console.log('⚠ Font import already exists in index.css');
}

console.log('\nDone. Run `npx vite build` to verify.');
