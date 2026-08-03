import { execSync, spawn } from 'child_process';
import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import { getAllRoutes } from './scripts/getRoutes.js';

const require = createRequire(import.meta.url);
const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = 4173;
const BASE_URL = `http://localhost:${PORT}`;
const WAIT_MS = 4000;

// Load .env for Supabase credentials (getAllRoutes needs them)
function loadEnv() {
  const envPath = resolve(__dirname, '.env');
  if (existsSync(envPath)) {
    const envContent = readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const eqIndex = trimmed.indexOf('=');
        if (eqIndex > -1) {
          const key = trimmed.slice(0, eqIndex).trim();
          const value = trimmed.slice(eqIndex + 1).trim();
          if (!process.env[key]) {
            process.env[key] = value;
          }
        }
      }
    });
  }
}

loadEnv();

console.log('[prerender] Building...');
execSync('node --max-old-space-size=4096 node_modules/vite/bin/vite.js build', { stdio: 'inherit', cwd: __dirname });

console.log(`[prerender] Starting preview on :${PORT}...`);
const preview = spawn(process.platform === 'win32' ? 'npx.cmd' : 'npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], {
  stdio: 'pipe', cwd: __dirname, shell: true
});

await new Promise(r => setTimeout(r, WAIT_MS));

// Get all routes to prerender
const routes = await getAllRoutes();
console.log(`[prerender] Prerendering ${routes.length} routes...\n`);

// Use Puppeteer directly to render each route, waiting for the render-event
const puppeteer = require('puppeteer');

const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
});

let successCount = 0;
let failCount = 0;

for (const route of routes) {
  const page = await browser.newPage();
  try {
    // Set a reasonable viewport
    await page.setViewport({ width: 1280, height: 720 });

    // Wait for the render-event to be dispatched by the app
    await page.evaluateOnNewDocument(() => {
      window.__PRERENDER_STATUS = {};
      document.addEventListener('render-event', () => {
        window.__PRERENDER_STATUS.__DOCUMENT_EVENT_RESOLVED = true;
      });
    });

    // Navigate to the route
    await page.goto(`${BASE_URL}${route}`, { waitUntil: 'networkidle0', timeout: 30000 });

    // Wait for the render-event to fire (with a timeout fallback)
    try {
      await page.waitForFunction(
        () => window.__PRERENDER_STATUS && window.__PRERENDER_STATUS.__DOCUMENT_EVENT_RESOLVED === true,
        { timeout: 20000 }
      );
    } catch (e) {
      console.warn(`  ⚠️  ${route}: render-event not fired, using fallback wait`);
      await new Promise(r => setTimeout(r, 3000));
    }

    // Get the rendered HTML
    const html = await page.content();

    // Write the HTML to the appropriate output path
    const outPath = route === '/'
      ? resolve(__dirname, 'dist/index.html')
      : resolve(__dirname, `dist${route}/index.html`);
    mkdirSync(dirname(outPath), { recursive: true });
    writeFileSync(outPath, html);
    console.log(`  ✅ ${route}`);
    successCount++;
  } catch (e) {
    console.error(`  ❌ ${route}: ${e.message}`);
    failCount++;
  } finally {
    await page.close();
  }
}

await browser.close();
preview.kill('SIGTERM');

console.log(`\n[prerender] Done! ${successCount} succeeded, ${failCount} failed.`);
if (failCount > 0) process.exit(1);