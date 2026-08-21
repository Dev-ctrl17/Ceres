import { readFileSync, writeFileSync } from 'fs';
let out = '';
for (const [f, n] of [
  ['C:/Users/BELLO IREBAMI/Desktop/Javascript/Apps/web/src/components/PropertyCard.jsx', 47],
  ['C:/Users/BELLO IREBAMI/Desktop/Javascript/Apps/web/src/pages/InvestmentBriefPage.jsx', 316],
  ['C:/Users/BELLO IREBAMI/Desktop/Javascript/Apps/web/src/pages/InvestmentBriefPage.jsx', 323],
]) {
  const lines = readFileSync(f, 'utf8').split(/\r?\n/);
  const line = lines[n - 1];
  out += f.split(/[/\\]/).pop() + ':' + n + ' raw=' + JSON.stringify(line) + '\n';
  out += '  codes=' + Array.from(line).map(c => c.charCodeAt(0)).join(',') + '\n';
}
writeFileSync('C:/Users/BELLO IREBAMI/Desktop/Javascript/tools/_dbg2.out', out, 'utf8');
console.log('done');


