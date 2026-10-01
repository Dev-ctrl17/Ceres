import { execSync, spawn } from 'child_process';
import { writeFileSync, mkdirSync, existsSync, readFileSync, rmSync, readdirSync, statSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';
import { getAllRoutes } from './scripts/getRoutes.js';
import { buildImageUrl, buildSeoDescription, buildSeoTitle, getCanonicalUrl } from './src/lib/siteConfig.js';
import { blogPostsData } from './src/data/blogPosts.js';

const require = createRequire(import.meta.url);
const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = 4173;
const BASE_URL = `http://localhost:${PORT}`;
const WAIT_MS = 1500;

function escapeAttribute(value) {
  return String(value).replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;');
}

function setMetaTag(html, attribute, name, value) {
  const pattern = new RegExp(`<meta\\b(?=[^>]*\\b${attribute}\\s*=["']${name}["'])[^>]*>`, 'gi');
  const tag = `<meta ${attribute}="${name}" content="${escapeAttribute(value)}">`;
  return html.replace(pattern, '').replace('</head>', `${tag}\n</head>`);
}

function normalizeStaticMetadata(html, filePath) {
  const canonicalTags = [...html.matchAll(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/gi)];
  const canonical = canonicalTags.at(-1)?.[1];
  if (!canonical) return html;

  const normalizedCanonical = getCanonicalUrl(canonical);
  const originalTitle = [...html.matchAll(/<title[^>]*>([\s\S]*?)<\/title>/gi)].at(-1)?.[1]?.trim() || '';
  const descriptionTags = [...html.matchAll(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/gi)];
  const originalDescription = descriptionTags.at(-1)?.[1] || '';
  const isProperty = new URL(normalizedCanonical).pathname.startsWith('/properties/');
  if (originalTitle.length > 60) console.warn(`[seo-guard] Title exceeds 60 characters in ${filePath}: ${originalTitle.length}`);
  if (originalDescription.length < 120 || originalDescription.length > 155) {
    console.warn(`[seo-guard] Description must be 120-155 characters in ${filePath}: ${originalDescription.length}`);
  }

  const title = isProperty ? originalTitle : buildSeoTitle(originalTitle);
  const description = isProperty ? originalDescription : buildSeoDescription(originalDescription);
  const imageTags = [...html.matchAll(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']*)["']/gi)];
  const image = imageTags.at(-1)?.[1];
  const socialImage = buildImageUrl(image || '/og-image.png');
  const isBlog = /[\\/]blog[\\/]/i.test(filePath)
    && !/[\\/]blog[\\/](?:index\.html|comparison[\\/]index\.html|listicle[\\/]index\.html)$/i.test(filePath);
  const canonicalTag = `<link rel="canonical" href="${escapeAttribute(normalizedCanonical)}">`;
  let output = html.replace(/<title[^>]*>[\s\S]*?<\/title>/gi, '');
  output = output.replace(/<link[^>]+rel=["']canonical["'][^>]*>/gi, '');
  output = output.replace('</head>', `<title>${escapeAttribute(title)}</title>\n${canonicalTag}\n</head>`);
  output = output.replace(/https?:\/\/(?:www\.)?luxurypropertiesltd\.com\.ng[^\s"'<>},\]]*/gi, (url) => getCanonicalUrl(url));
  output = setMetaTag(output, 'name', 'description', description);
  output = setMetaTag(output, 'property', 'og:title', title);
  output = setMetaTag(output, 'property', 'og:description', description);
  output = setMetaTag(output, 'property', 'og:image', socialImage);
  output = setMetaTag(output, 'property', 'og:url', normalizedCanonical);
  output = setMetaTag(output, 'property', 'og:type', isBlog ? 'article' : 'website');
  output = setMetaTag(output, 'property', 'og:site_name', 'Luxury Properties Ltd');
  output = setMetaTag(output, 'property', 'og:locale', 'en_NG');
  output = setMetaTag(output, 'name', 'twitter:card', 'summary_large_image');
  output = setMetaTag(output, 'name', 'twitter:title', title);
  output = setMetaTag(output, 'name', 'twitter:description', description);
  output = setMetaTag(output, 'name', 'twitter:image', socialImage);

  const blogSlug = new URL(normalizedCanonical).pathname.split('/').filter(Boolean).at(-1);
  const post = blogPostsData.find((item) => item.slug === blogSlug);
  if (post?.datePublished) {
    output = output.replace(/(<script\b[^>]*type=["']application\/ld\+json["'][^>]*>)([\s\S]*?)(<\/script>)/gi, (tag, open, json, close) => {
      try {
        const schema = JSON.parse(json);
        const enrichArticle = (value) => {
          if (!value || typeof value !== 'object') return;
          if (Array.isArray(value)) return value.forEach(enrichArticle);
          if (['Article', 'BlogPosting', 'NewsArticle'].includes(value['@type'])) {
            value.image ||= buildImageUrl(post.ogImage || '/og-image.png');
            value.datePublished ||= post.datePublished;
            if (post.dateModified) value.dateModified ||= post.dateModified;
          }
          Object.values(value).forEach(enrichArticle);
        };
        enrichArticle(schema);
        return `${open}${JSON.stringify(schema)}${close}`;
      } catch {
        return tag;
      }
    });
  }

  return output;
}

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
    if (/\.html$/i.test(path)) text = normalizeStaticMetadata(text, normalizedPath);
    if (/\/dist\/blog\/[^/]+\/index\.html$/i.test(normalizedPath)) {
      const canonical = text.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i)?.[1];
      if (canonical && !/<meta[^>]+property=["']og:url["']/i.test(text)) {
        text = text.replace('</head>', `<meta property="og:url" content="${canonical}">\n</head>`);
      }
      if (canonical && !/application\/ld\+json/i.test(text)) {
        const title = text.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1] || 'Luxury Properties Ltd Blog';
        const description = text.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i)?.[1] || '';
        const slug = new URL(canonical).pathname.split('/').filter(Boolean).at(-1);
        const post = blogPostsData.find((item) => item.slug === slug);
        const published = post?.datePublished;
        const modified = post?.dateModified;
        const schema = JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: post?.title || title,
          description: post?.metaDescription || description,
          image: buildImageUrl(post?.ogImage || '/og-image.png'),
          mainEntityOfPage: canonical,
          author: { '@type': 'Organization', name: 'Luxury Properties Ltd', url: getCanonicalUrl('/') },
          publisher: {
            '@type': 'Organization',
            name: 'Luxury Properties Ltd',
            logo: { '@type': 'ImageObject', url: getCanonicalUrl('/favicon.svg') },
          },
          ...(published ? { datePublished: published } : {}),
          ...(modified ? { dateModified: modified } : {}),
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
  const h1Matches = [...html.matchAll(/<h1\b[^>]*>\s*([\s\S]*?)\s*<\/h1>/gi)];
  const h1 = h1Matches[0]?.[1]
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

  if (!title || !description || !h1 || h1Matches.length !== 1) {
    throw new Error(`Invalid page metadata for ${route} (title: ${Boolean(title)}, description: ${Boolean(description)}, h1 count: ${h1Matches.length})`);
  }

  if (title.length > 60) console.warn(`[seo-guard] Title exceeds 60 characters in ${route}: ${title.length}`);
  if (description.length < 120 || description.length > 155) {
    console.warn(`[seo-guard] Description must be 120-155 characters in ${route}: ${description.length}`);
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