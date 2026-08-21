// Diagnostic: print EXACT bytes (JSON-encoded) of the two <Link> lines,
// current working-tree version and original git HEAD version, so brace
// placement is unambiguous. Run: node tools/_diag.mjs
import { readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';
const root = 'C:/Users/BELLO IREBAMI/Desktop/Javascript/Apps/web';
const rd = (rel) => readFileSync(root + '/' + rel, 'utf8').split(/\r?\n/);
const ib = rd('src/pages/InvestmentBriefPage.jsx');
const pc = rd('src/components/PropertyCard.jsx');
let o = '';
o += 'CURR IB  line 316 (idx315): ' + JSON.stringify(ib[315]) + '\n';
o += 'CURR PC   line 47  (idx46):  ' + JSON.stringify(pc[46]) + '\n';
o += 'CURR IB  slice313-316: ' + JSON.stringify(ib.slice(313, 317)) + '\n';
o += 'CURR PC  slice45-47:   ' + JSON.stringify(pc.slice(45, 48)) + '\n';
try {
  const origIB = execSync('git --no-pager show HEAD:Apps/web/src/pages/InvestmentBriefPage.jsx', { encoding: 'utf8' }).split(/\r?\n/);
  const origPC = execSync('git --no-pager show HEAD:Apps/web/src/components/PropertyCard.jsx', { encoding: 'utf8' }).split(/\r?\n/);
  o += 'ORIG IB line 316: ' + JSON.stringify(origIB[315]) + '\n';
  o += 'ORIG PC line 47:  ' + JSON.stringify(origPC[46]) + '\n';
} catch (e) {
  o += 'git show error: ' + e.message + '\n';
}
writeFileSync('C:/Users/BELLO IREBAMI/Desktop/Javascript/tools/_diag.log', o, 'utf8');
console.log(o);
