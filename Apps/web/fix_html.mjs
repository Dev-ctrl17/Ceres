import fs from 'fs';

const indexPath = 'index.html';
let html = fs.readFileSync(indexPath, 'utf8');

// Replace only the problematic stylesheet link that html-inline-proxy chokes on
const oldSheet = '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Playfair+Display:wght@400;600;700&display=swap" media="print" onload="this.media=\'all\'" />\n    <noscript>\n      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Playfair+Display:wght@400;600;700&display=swap" />\n    </noscript>';
const newSheet = '    <!-- Font stylesheet moved to src/index.css as @import to avoid html-inline-proxy build error -->';

if (html.includes(oldSheet)) {
  html = html.replace(oldSheet, newSheet);
  fs.writeFileSync(indexPath, html);
  console.log('✓ Removed external stylesheet link from index.html');
} else {
  console.log('⚠ Pattern not found - checking current state...');
  if (html.includes('media="print" onload')) {
    console.log('  Found media=print link, trying simpler replacement...');
    // Just replace the single line
    html = html.replace(
      '    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Playfair+Display:wght@400;600;700&display=swap" media="print" onload="this.media=\'all\'" />\n',
      '    <!-- stylesheet moved to CSS @import -->\n'
    );
    // Also remove noscript block
    html = html.replace(
      '    <noscript>\n      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Playfair+Display:wght@400;600;700&display=swap" />\n    </noscript>\n',
      ''
    );
    fs.writeFileSync(indexPath, html);
    console.log('✓ Applied simpler replacement');
  }
}
