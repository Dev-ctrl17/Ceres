import fs from 'fs';

const indexPath = 'index.html';
let html = fs.readFileSync(indexPath, 'utf8');

// Remove any remaining external Google Fonts stylesheet references
// Match the full noscript block with flexible whitespace
html = html.replace(
  /<noscript>\s*<link rel="stylesheet" href="https:\/\/fonts\.googleapis\.com\/css2\?family=DM\+Sans[^"]+" \/>\s*<\/noscript>/g,
  '    <!-- noscript font stylesheet: not needed since fonts are loaded via CSS @import in src/index.css -->'
);

// Also remove the preload for external style since we're using @import now
html = html.replace(
  /<link rel="preload" as="style" href="https:\/\/fonts\.googleapis\.com\/css2\?family=DM\+Sans[^"]+" \/>\n/g,
  '    <!-- font preconnect handled above, CSS @import in src/index.css -->\n'
);

fs.writeFileSync(indexPath, html);
const after = fs.readFileSync(indexPath, 'utf8');
console.log('AFTER has noscript:', after.includes('<noscript>'));
console.log('AFTER has googleapis stylesheet:', after.includes('fonts.googleapis.com/css2'));
console.log('Done.');
