import { execSync, spawn } from 'child_process';
import { writeFileSync, mkdirSync, existsSync, readFileSync, rmSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import { getAllRoutes } from './scripts/getRoutes.js';

const require = createRequire(import.meta.url);
const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = 4173;
const BASE_URL = `http://localhost:${PORT}`;
const WAIT_MS = 1500;

function validateRenderedHtml(html, route) {
  const title = html.match(/<title[^>]*>\s*([^<]+?)\s*<\/title>/i)?.[1]?.trim();
  const description = html.match(/<meta\s+[^>]*name=["']description["'][^>]*content=["']([^"']+)["'][^>]*>/i)?.[1]?.trim();
  const h1 = html.match(/<h1\b[^>]*>\s*([\s\S]*?)\s*<\/h1>/i)?.[1]
    ?.replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  const hasMeta = (attribute, value) => new RegExp(`<meta\\s+[^>]*${attribute}=["']${value}["'][^>]*>`, 'i').test(html);
  const socialTags = [
    ['property', 'og:title'],
    ['property', 'og:description'],
    ['property', 'og:url'],
    ['name', 'twitter:card'],
    ['name', 'twitter:title'],
    ['name', 'twitter:description'],
    ['name', 'twitter:image'],
  ];

  if (!title || !description || !h1) {
    throw new Error(`Missing page metadata for ${route} (title: ${Boolean(title)}, description: ${Boolean(description)}, h1: ${Boolean(h1)})`);
  }

  if (!route.startsWith('/blog/')) {
    const missingSocialTags = socialTags.filter(([attribute, value]) => !hasMeta(attribute, value));
    if (missingSocialTags.length > 0) {
      throw new Error(`Missing social metadata for ${route}: ${missingSocialTags.map(([, value]) => value).join(', ')}`);
    }
  }

  if (!/<a\s+[^>]*href=["'][^"']+["']/i.test(html)) {
    throw new Error(`No crawlable anchor links found for ${route}`);
  }
}

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
rmSync(resolve(__dirname, 'dist'), { recursive: true, force: true });
execSync('node --max-old-space-size=4096 node_modules/vite/bin/vite.js build', { stdio: 'inherit', cwd: __dirname });

console.log(`[prerender] Starting preview on :${PORT}...`);
const preview = spawn(process.platform === 'win32' ? 'npx.cmd' : 'npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], {
  stdio: 'pipe', cwd: __dirname, shell: true
});

await new Promise(async (resolveReady) => {
  const deadline = Date.now() + 20000;
  while (Date.now() < deadline) {
    try {
      await fetch(`${BASE_URL}/`);
      resolveReady();
      return;
    } catch {
      await new Promise(resolveRetry => setTimeout(resolveRetry, WAIT_MS));
    }
  }
  throw new Error(`Preview server did not become ready on ${BASE_URL}`);
});

// Get all routes to prerender
const routes = await getAllRoutes();
console.log(`[prerender] Prerendering ${routes.length} routes...\n`);

// Use Puppeteer directly to render each route, waiting for real page content.
const puppeteer = require('puppeteer');
const executablePath = await puppeteer.executablePath();

const browser = await puppeteer.launch({
  headless: true,
  executablePath,
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
  ]
});

let successCount = 0;
let failCount = 0;

for (const route of routes) {
  const page = await browser.newPage();
  try {
    // Set a reasonable viewport
    await page.setViewport({ width: 1280, height: 720 });

    // Navigate to the route
    await page.goto(`${BASE_URL}${route}`, { waitUntil: 'domcontentloaded', timeout: 30000 });

    // Require actual page content before capturing. Async pages expose a
    // false marker while loading; static pages only need their visible H1.
    await page.waitForFunction(
      () => document.querySelector('h1') && !document.querySelector('[data-prerender-ready="false"]'),
      { timeout: 20000 }
    );
    // Get the rendered HTML
    const html = await page.content();
    validateRenderedHtml(html, route);

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