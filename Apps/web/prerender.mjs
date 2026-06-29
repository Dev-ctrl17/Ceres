import { execSync, spawn } from 'child_process';
import { writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import http from 'http';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = 4173;
const BASE_URL = `http://localhost:${PORT}`;
const WAIT_MS = 4000;

const ROUTES = [
  '/', '/buy', '/rent', '/sell', '/properties', '/services',
  '/agents', '/reviews', '/about', '/contact', '/faq'
];

// Property IDs to pre-render for SEO (update this list with actual property IDs from your database)
const PROPERTY_IDS = [
  'sample-property-1',
  'sample-property-2',
  'sample-property-3'
];

console.log('[prerender] Building...');
execSync('npx vite build', { stdio: 'inherit', cwd: __dirname });

console.log(`[prerender] Starting preview on :${PORT}...`);
const preview = spawn(process.platform === 'win32' ? 'npx.cmd' : 'npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], {
  stdio: 'pipe', cwd: __dirname, shell: true
});

await new Promise(r => setTimeout(r, WAIT_MS));

function fetch(url) {
  return new Promise((resolve, reject) => {
    http.get(url, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

console.log('[prerender] Fetching routes...\n');
for (const route of ROUTES) {
  try {
    const html = await fetch(`${BASE_URL}${route}`);
    const outPath = route === '/'
      ? resolve(__dirname, 'dist/index.html')
      : resolve(__dirname, `dist${route}/index.html`);
    mkdirSync(dirname(outPath), { recursive: true });
    writeFileSync(outPath, html);
    console.log(`  ✅ / ${route}`);
  } catch (e) {
    console.log(` ${route}: ${e.message}`);
  }
}

preview.kill('SIGTERM');
console.log('\n[prerender] Done!');