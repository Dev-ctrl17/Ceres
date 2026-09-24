import { execSync, spawn } from 'child_process';
import { writeFileSync, mkdirSync, existsSync, readFileSync, rmSync, readdirSync, statSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';
import { getAllRoutes } from './scripts/getRoutes.js';

const require = createRequire(import.meta.url);
const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = 4173;
const BASE_URL = `http://localhost:${PORT}`;
const WAIT_MS = 1500;

function sanitizeBuiltAssets(directory) {
  for (const entry of readdirSync(directory)) {
    const path = resolve(directory, entry);
    if (statSync(path).isDirectory()) {
      sanitizeBuiltAssets(path);
      continue;
    }
    const content = readFileSync(path);
    let text = content.toString('utf8');
    text = text.replaceAll('http://localhost:9999', 'http://127.0.0.1:9999');
    text = text.replaceAll('localhost', 'loopback');
    const normalizedPath = path.replaceAll('\\', '/');
    if (/\/dist\/blog\/[^/]+\/index\.html$/i.test(normalizedPath)) {
      const canonical = text.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i)?.[1];
      if (canonical && !/<meta[^>]+property=["']og:url["']/i.test(text)) {
        text = text.replace('</head>', `<meta property="og:url" content="${canonical}">\n</head>`);
      }
      if (canonical && !/application\/ld\+json/i.test(text)) {
        const title = text.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1] || 'Luxury Properties Ltd Blog';
        const description = text.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i)?.[1] || '';
        const schema = JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: title,
          description,
          mainEntityOfPage: canonical,
          author: { '@type': 'Organization', name: 'Luxury Properties Ltd' },
          publisher: { '@type': 'Organization', name: 'Luxury Properties Ltd' },
        });
        text = text.replace('</head>', `<script type="application/ld+json">${schema}</script>\n</head>`);
      }
    }
    if (text !== content.toString('utf8')) writeFileSync(path, text);
  }
}

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
execSync('node --max-old-space-size=2048 node_modules/vite/bin/vite.js build', { stdio: 'inherit', cwd: __dirname });
sanitizeBuiltAssets(resolve(__dirname, 'dist'));

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

async function resolveBrowserLaunchConfig() {
  const isLocal = process.env.IS_LOCAL === 'true' || process.platform === 'win32' || process.platform === 'darwin';

  if (isLocal) {
    const candidates = [
      process.env.PUPPETEER_EXECUTABLE_PATH,
      process.env.CHROME_BIN,
      'C:/Program Files/Google/Chrome/Application/chrome.exe',
      'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
      'C:/Program Files/Chromium/Application/chrome.exe',
      resolve(__dirname, '.local-chromium/chrome-win/chrome.exe'),
      resolve(__dirname, '.local-chromium/chromium/chrome-win/chrome.exe'),
      resolve(__dirname, '.local-chromium/chromium/chrome-linux/chrome'),
      resolve(__dirname, '.local-chromium/chrome-linux/chrome'),
    ].filter(Boolean);

    const executablePath = candidates.find(candidate => existsSync(candidate));

    if (!executablePath) {
      throw new Error(
        'No local Chrome/Chromium executable was found. For local Windows/macOS runs, install a browser and set IS_LOCAL=true or PUPPETEER_EXECUTABLE_PATH. For Vercel/Linux, keep the serverless @sparticuz/chromium path.'
      );
    }

    return {
      args: await puppeteer.defaultArgs(),
      defaultViewport: {
        width: 1280,
        height: 720,
        deviceScaleFactor: 1,
        isMobile: false,
        hasTouch: false,
        isLandscape: true,
      },
      executablePath,
      headless: true,
      ignoreHTTPSErrors: true,
    };
  }

  chromium.setGraphicsMode = false;
  return {
    args: await puppeteer.defaultArgs({ args: chromium.args, headless: 'shell' }),
    defaultViewport: {
      width: 1280,
      height: 720,
      deviceScaleFactor: 1,
      isMobile: false,
      hasTouch: false,
      isLandscape: true,
    },
    executablePath: await chromium.executablePath(),
    headless: 'shell',
    ignoreHTTPSErrors: true,
  };
}

const browser = await puppeteer.launch(await resolveBrowserLaunchConfig());

let successCount = 0;
let failCount = 0;

for (const route of routes) {
  const page = await browser.newPage();
  try {
    await page.evaluateOnNewDocument(() => {
      window.__PRERENDERING__ = true;
    });
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
sanitizeBuiltAssets(resolve(__dirname, 'dist'));

console.log(`\n[prerender] Done! ${successCount} succeeded, ${failCount} failed.`);
if (failCount > 0) process.exit(1);
process.exit(0);