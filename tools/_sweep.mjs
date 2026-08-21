import { build } from 'file:///C:/Users/BELLO%20IREBAMI/Desktop/Javascript/Apps/web/node_modules/esbuild/lib/main.js';
import { writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const root = 'C:/Users/BELLO IREBAMI/Desktop/Javascript/Apps/web/src';
const files = [];
(function walk(dir) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) walk(p);
    else if (/\.(jsx?|tsx?)$/.test(e)) files.push(p);
  }
})(root);

let out = '';
let fails = 0;
for (const f of files) {
  try {
    await build({
      entryPoints: [f],
      bundle: false,
      write: false,
      loader: { '.jsx': 'jsx', '.js': 'js', '.tsx': 'tsx', '.ts': 'ts' },
      format: 'esm',
      logLevel: 'silent',
      absWorkingDir: 'C:/Users/BELLO IREBAMI/Desktop/Javascript/Apps/web',
    });
  } catch (e) {
    fails++;
    const loc = (e.errors && e.errors[0] && e.errors[0].location)
      ? `:${e.errors[0].location.line}:${e.errors[0].location.column}`
      : '';
    const txt = (e.errors && e.errors[0] && e.errors[0].text) || String(e);
    out += `FAIL ${f.replace(root + '\\\\', '')}${loc}: ${txt}\n`;
  }
}
out += `\nTotal files: ${files.length}, failures: ${fails}\n`;
writeFileSync('C:/Users/BELLO IREBAMI/Desktop/Javascript/tools/_sweep.out', out, 'utf8');
console.log('sweep done');