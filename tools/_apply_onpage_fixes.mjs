import { fixes, root } from './_onpage_fixes1.mjs';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

let out = '';
let errors = 0;
for (const fx of fixes) {
  const path = join(root, fx.f.replace(/\\/g, '/'));
  let s = readFileSync(path, 'utf8');
  for (const [target, repl] of fx.finds) {
    const n = s.split(target).length - 1;
    if (n !== 1) {
      errors += 1;
      out += `MISS/MULTI (${n}) ${fx.f} :: ${target.slice(0, 60)}\n`;
      continue;
    }
    s = s.replace(target, repl);
  }
  writeFileSync(path, s, 'utf8');
  out += `OK ${fx.f}\n`;
}
console.log('part1 applied, errors=' + errors);