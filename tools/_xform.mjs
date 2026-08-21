import { build } from 'file:///C:/Users/BELLO%20IREBAMI/Desktop/Javascript/Apps/web/node_modules/esbuild/lib/main.js';
import { writeFileSync } from 'fs';
let out = '';
for (const f of [
  'C:/Users/BELLO IREBAMI/Desktop/Javascript/Apps/web/src/components/PropertyCard.jsx',
  'C:/Users/BELLO IREBAMI/Desktop/Javascript/Apps/web/src/pages/InvestmentBriefPage.jsx',
  'C:/Users/BELLO IREBAMI/Desktop/Javascript/Apps/web/src/pages/PropertyDetailsPage.jsx',
]) {
  try {
    const r = await build({
      entryPoints: [f],
      bundle: false,
      write: false,
      loader: { '.jsx': 'jsx' },
      format: 'esm',
      logLevel: 'silent',
      absWorkingDir: 'C:/Users/BELLO IREBAMI/Desktop/Javascript/Apps/web',
    });
    out += 'OK   ' + f.split(/[/\\]/).pop() + ' (outfiles=' + r.outputFiles.length + ')\n';
  } catch (e) {
    const err = (Array.isArray(e.errors) && e.errors[0]) ? JSON.stringify(e.errors[0]) : String(e);
    out += 'FAIL ' + f.split(/[/\\]/).pop() + ': ' + err + '\n';
  }
}
writeFileSync('C:/Users/BELLO IREBAMI/Desktop/Javascript/tools/_xform.out', out, 'utf8');
console.log('done');