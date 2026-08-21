// Targeted fix: normalize the edit-form generateSlug indent (const #2 only).
// const #1 (create-form) uses `= (title) =>` (no brace); this matches only
// the `= (title) => {` variant (const #2), so it never touches #1.
// Run: node tools/_fix_admin.mjs
import { readFileSync, writeFileSync } from 'fs';
const p = 'C:/Users/BELLO IREBAMI/Desktop/Javascript/Apps/web/src/pages/AdminDashboard.jsx';
let raw = readFileSync(p, 'utf8');
const nl = raw.includes('\r\n') ? '\r\n' : '\n';
const lines = raw.split(nl);
let fixed = 0;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('const generateSlug = (title) => {')) {
    const before = lines[i];
    lines[i] = '  const generateSlug = (title) => {';
    fixed++;
    console.log(`line ${i + 1}: ${JSON.stringify(before)} -> 2sp '${lines[i]}'`);
  }
}
writeFileSync(p, lines.join(nl), 'utf8');
console.log(`fixed=${fixed}`);
