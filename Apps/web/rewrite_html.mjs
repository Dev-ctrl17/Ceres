import fs from 'fs';

const indexPath = 'index.html';
let html = fs.readFileSync(indexPath, 'utf8');

// Find and remove everything from the Google Fonts comment to the blank line before "Vite will inject"
const marker1 = '    <!-- Google Fonts: Optimized with display=swap for FCP, wght restrictions for smaller payload -->';
const marker2 = '    <!-- Vite will inject the CSS link automatically with correct hash -->';

const idx1 = html.indexOf(marker1);
const idx2 = html.indexOf(marker2);

if (idx1 !== -1 && idx2 !== -1) {
  // Find the newline before marker2
  const beforeMarker2 = html.lastIndexOf('\n', idx2);
  html = html.substring(0, idx1) + '    <!-- Google Fonts loaded via @import in src/index.css -->\n' + html.substring(beforeMarker2);
  fs.writeFileSync(indexPath, html);
  console.log('✓ Rewrote index.html font section');
} else {
  console.log('Markers not found, idx1:', idx1, 'idx2:', idx2);
}
