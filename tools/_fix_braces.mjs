// Fix latent JSX: `<Link to=\`...${x}...\`>`  -> `<Link to={\`...${x}...\`}>`
// Only matches the no-brace form (to= followed immediately by a backtick).
// The braced form (to={`) is left untouched. Safe to re-run.
// Run: node tools/_fix_braces.mjs
import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
const B = '`';
const root = 'C:/Users/BELLO IREBAMI/Desktop/Javascript/Apps/web/src';
const openRe = /to=`/g;     // `to=` immediately followed by backtick (no brace)
const closeRe = /`>/g;      // backtick immediately followed by `>` (no `}` before it)

function walk(dir, acc) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.isDirectory() ? e.name : e.name);
    const full = join(dir, e.name);
    if (e.isDirectory()) walk(full, acc);
    else if (e.name.endsWith('.jsx') || e.name.endsWith('.js')) acc.push(full);
  }
}
const files = [];
walk(root, files);
let log = '';
for (const f of files) {
  const raw = readFileSync(f, 'utf8');
  const nl = raw.includes('\r\n') ? '\r\n' : '\n';
  const lines = raw.split(nl);
  const changed = [];
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('to=' + B)) {
      const before = lines[i];
      let l = lines[i].replace(openRe, 'to={`').replace(closeRe, '`}>`');
      if (l !== before) changed.push('line ' + (i + 1) + ': ' + JSON.stringify(before) + ' -> ' + JSON.stringify(l));
    }
  }
  if (changed.length) {
    writeFileSync(f, lines.map((ln) => {
      if (ln.includes('to=' + B)) {
        return ln.replace(openRe, 'to={`').replace(closeRe, '`}>`');
      }
      return ln;
    }).join(nl), 'utf8');
    log += f.replace(root, '.') + ' (' + changed.length + '):\n';
    for (const c of changed) log += '  ' + c + '\n';
  }
}
writeFileSync('C:/Users/BELLO IREBAMI/Desktop/Javascript/tools/_fix_braces.log', log || 'no changes', 'utf8');
console.log(log || 'no changes');
