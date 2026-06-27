import fs from 'fs';

const indexPath = 'index.html';
let html = fs.readFileSync(indexPath, 'utf8');

// Remove the problematic preload link that html-inline-proxy chokes on
html = html.replace(
  '<link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Playfair+Display:wght@400;600;700&display=swap" />\n',
  ''
);

// Remove the comment placeholders from earlier fixes
html = html.replace(
  '    <!-- stylesheet moved to CSS @import to avoid html-inline-proxy build error -->\n',
  ''
);
html = html.replace(
  '    <!-- noscript font stylesheet: not needed since fonts are loaded via CSS @import in src/index.css -->\n',
  ''
);

fs.writeFileSync(indexPath, html);
const after = fs.readFileSync(indexPath, 'utf8');
console.log('AFTER has preload style:', after.includes('rel="preload" as="style"'));
console.log('AFTER has googleapis:', after.includes('fonts.googleapis.com'));
console.log('Done.');
