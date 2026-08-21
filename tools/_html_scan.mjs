// Scan every static HTML in public/ for <title> and meta description content
// with exact line numbers, so targeted fixes can be applied with precision.
import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';

const root = 'C:/Users/BELLO IREBAMI/Desktop/Javascript/Apps/web/public';
const files = [];
(function walk(dir) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) walk(p);
    else if (/\.html$/i.test(e)) files.push(p);
  }
})(root);

let out = '';
for (const f of files) {
  const lines = readFileSync(f, 'utf8').split(/\r?\n/);
  let title = null, titleLine = null, metaDesc = null, metaLine = null, canonical = null, canonLine = null, hasH1 = 0;
  const titleRe = /<title[^>]*>(.*?)<\/title>/i;
  const metaRe = /<meta[^>]*name=["']description["'][^>]*content=["'](.*?)["'][^>]*>/i;
  const canonRe = /<link[^>]*rel=["']canonical["'][^>]*href=["'](.*?)["'][^>]*>/i;
  for (let i = 0; i < lines.length; i += 1) {
    const l = lines[i];
    if (!title && titleRe.test(l)) { title = titleRe.exec(l)[1]; titleLine = i + 1; }
    if (!metaDesc && metaRe.test(l)) { metaDesc = metaRe.exec(l)[1]; metaLine = i + 1; }
    if (!canonical && canonRe.test(l)) { canonical = canonRe.exec(l)[1]; canonLine = i + 1; }
    if (/<h1\b/i.test(l)) hasH1 += 1;
  }
  out += `${relative(root, f)}\t${title ? title.length : 'NO_TITLE'}\t${titleLine ?? ''}\t${metaDesc ? metaDesc.length : 'NO_META'}\t${metaLine ?? ''}\t${canonical ?? 'NO_CANON'}\t${canonLine ?? ''}\tH1=${hasH1}\n`;
}
writeFileSync('C:/Users/BELLO IREBAMI/Desktop/Javascript/tools/_html_scan.tsv', out, 'utf8');
console.log('scan done: ' + files.length);