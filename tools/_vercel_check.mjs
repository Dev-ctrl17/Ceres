import { readFileSync, writeFileSync } from 'fs';
const f = 'C:/Users/BELLO IREBAMI/Desktop/Javascript/Apps/web/vercel.json';
const b = readFileSync(f);
const s = Buffer.from(b).toString('utf8');
let msg = '';
let ok = false;
try {
  const j = JSON.parse(s);
  ok = true;
  msg = `keys=${Object.keys(j).join(',')}; rewrites=${j.rewrites?.length}; redirects=${j.redirects?.length}; headers=${j.headers?.length}`;
} catch (e) { msg = e.message; }
const out = `BOM=${b[0]===0xef}::JSON_${ok?'VALID':'INVALID'}::${msg}\n`;
writeFileSync('C:/Users/BELLO IREBAMI/Desktop/Javascript/tools/_vercel_check.out', out, 'utf8');
console.log('done');