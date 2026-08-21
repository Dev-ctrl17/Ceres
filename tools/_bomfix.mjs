import { readFileSync, writeFileSync } from 'fs';

const files = [
  'C:/Users/BELLO IREBAMI/Desktop/Javascript/Apps/web/vercel.json',
  'C:/Users/BELLO IREBAMI/Desktop/Javascript/Apps/web/package.json',
];

let out = '';
for (const f of files) {
  const buf = readFileSync(f);
  const hasBom = buf.length >= 3 && buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf;
  out += `${f.split(/[/\\]/).pop()}: BOM=${hasBom} size=${buf.length}\n`;
  if (hasBom) {
    const stripped = buf.subarray(3);
    try {
      JSON.parse(Buffer.from(stripped).toString('utf8'));
      writeFileSync(f, stripped);
      out += `  -> BOM stripped, JSON now valid, new size=${stripped.length}\n`;
    } catch (e) {
      out += `  -> after BOM strip STILL invalid: ${e.message}\n`;
    }
  } else {
    try {
      JSON.parse(Buffer.from(buf).toString('utf8'));
      out += '  -> JSON valid\n';
    } catch (e) {
      out += `  -> JSON INVALID: ${e.message}\n`;
    }
  }
}
writeFileSync('C:/Users/BELLO IREBAMI/Desktop/Javascript/tools/_bomfix.out', out, 'utf8');
console.log('bomfix done');