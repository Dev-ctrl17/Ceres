import fs from 'fs';

const indexPath = 'index.html';
let html = fs.readFileSync(indexPath, 'utf8');

console.log('BEFORE has media=print:', html.includes('media="print" onload'));

// Remove the specific problematic stylesheet line
const sheetLine = '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Playfair+Display:wght@400;600;700&display=swap" media="print" onload="this.media=\'all\'" />';
html = html.replace(sheetLine, '    <!-- stylesheet moved to CSS @import to avoid html-inline-proxy build error -->');

// Remove the noscript block
const noscriptBlock = `<noscript>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Playfair+Display:wght@400;600;700&display=swap" />
    </noscript>`;
html = html.replace(noscriptBlock, '');

fs.writeFileSync(indexPath, html);

const after = fs.readFileSync(indexPath, 'utf8');
console.log('AFTER has media=print:', after.includes('media="print" onload'));
console.log('AFTER has noscript:', after.includes('<noscript>'));
console.log('Done.');
