import { execSync, spawn } from 'child_process';
import { writeFileSync, mkdirSync, existsSync, readFileSync, rmSync, readdirSync, statSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';
import { getAllRoutes } from './scripts/getRoutes.js';
import { buildImageUrl, buildSeoDescription, buildSeoTitle, getCanonicalUrl } from './src/lib/siteConfig.js';
import { buildPropertySeo } from './src/lib/propertySeo.js';
import { blogPostsData } from './src/data/blogPosts.js';

const require = createRequire(import.meta.url);
const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = 4173;
const BASE_URL = `http://localhost:${PORT}`;
const WAIT_MS = 1500;
const HOMEPAGE_TITLE = 'Luxury Properties Ltd - Premium Real Estate in Nigeria';
const HOMEPAGE_CANONICAL = getCanonicalUrl('/');
const isPropertyDetailRoute = (route) => /^\/properties\/(?!page\/)[^/]+\/?$/.test(route);

function escapeAttribute(value) {
  return String(value).replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;');
}

function getAttribute(tag, name) {
  const match = tag.match(new RegExp(`\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i'));
  return match?.[1] ?? match?.[2] ?? match?.[3] ?? '';
}

function getMetaContent(html, attribute, name) {
  const tag = [...html.matchAll(/<meta\b[^>]*>/gi)]
    .map(([match]) => match)
    .find((match) => new RegExp(`\\b${attribute}\\s*=["']${name}["']`, 'i').test(match));
  return tag ? getAttribute(tag, 'content') : '';
}

function decodeHtmlEntities(value) {
  return value
    .replaceAll('&amp;', '&')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
    .replaceAll('&apos;', "'")
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>');
}

function collectJsonLdValues(value, values = []) {
  if (!value || typeof value !== 'object') return values;
  if (Array.isArray(value)) {
    value.forEach((item) => collectJsonLdValues(item, values));
    return values;
  }
  if (value['@type']) values.push(value);
  Object.values(value).forEach((item) => collectJsonLdValues(item, values));
  return values;
}

function getVisibleText(html) {
  return decodeHtmlEntities(html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim()
    .toLocaleLowerCase();
}

function filterInvisibleFaqSchemas(value, visibleText) {
  if (Array.isArray(value)) {
    return value
      .map((item) => filterInvisibleFaqSchemas(item, visibleText))
      .filter((item) => item !== null);
  }
  if (!value || typeof value !== 'object') return value;
  if (value['@type'] === 'FAQPage') {
    const questions = Array.isArray(value.mainEntity) ? value.mainEntity : [];
    const matchesVisibleContent = questions.length > 0 && questions.every((question) => (
      question?.name
      && question.acceptedAnswer?.text
      && visibleText.includes(decodeHtmlEntities(String(question.name)).toLocaleLowerCase())
      && visibleText.includes(decodeHtmlEntities(String(question.acceptedAnswer.text)).toLocaleLowerCase())
    ));
    if (!matchesVisibleContent) return null;
  }
  return Object.fromEntries(Object.entries(value)
    .map(([key, child]) => [key, filterInvisibleFaqSchemas(child, visibleText)])
    .filter(([, child]) => child !== null));
}

function setMetaTag(html, attribute, name, value) {
  const pattern = new RegExp(`<meta\\b(?=[^>]*\\b${attribute}\\s*=["']${name}["'])[^>]*>`, 'gi');
  const tag = `<meta ${attribute}="${name}" content="${escapeAttribute(value)}">`;
  return html.replace(pattern, '').replace('</head>', `${tag}\n</head>`);
}

function normalizeStaticMetadata(html, filePath) {
  const canonicalTags = [...html.matchAll(/<link\b[^>]*\brel=["']canonical["'][^>]*>/gi)];
  const canonical = canonicalTags.length ? getAttribute(canonicalTags.at(-1)[0], 'href') : '';
  if (!canonical) return html;

  const normalizedCanonical = getCanonicalUrl(canonical);
  const originalTitle = [...html.matchAll(/<title[^>]*>([\s\S]*?)<\/title>/gi)].at(-1)?.[1]?.trim() || '';
  const originalDescription = getMetaContent(html, 'name', 'description');
  const isProperty = new URL(normalizedCanonical).pathname.startsWith('/properties/');
  const pathname = new URL(normalizedCanonical).pathname;
  const isCertificateGuide = pathname === '/blog/certificate-of-occupancy-vs-governors-consent';
  const isCookiePolicy = pathname === '/cookie-policy';
  if (isProperty && (!originalTitle || !originalDescription)) {
    throw new Error(`[seo-guard] Listing metadata is missing in ${filePath}`);
  }

  const title = isProperty || isCertificateGuide || isCookiePolicy ? originalTitle : buildSeoTitle(originalTitle);
  const description = isProperty || isCertificateGuide || isCookiePolicy ? originalDescription : buildSeoDescription(originalDescription);
  const image = getMetaContent(html, 'property', 'og:image');
  const socialImage = buildImageUrl(image || '/og-image.png');
  const isBlog = /[\\/]blog[\\/]/i.test(filePath)
    && !/[\\/]blog[\\/](?:index\.html|listicle(?:[\\/]index\.html)?)$/i.test(filePath);
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
  if (pathname !== '/') {
    output = output.replace(/<link\b[^>]*>/gi, (tag) => (
      getAttribute(tag, 'rel').toLowerCase() === 'preload'
      && getAttribute(tag, 'href') === '/hero/slide-1-1600.webp'
        ? ''
        : tag
    ));
  }

  const blogSlug = new URL(normalizedCanonical).pathname.split('/').filter(Boolean).at(-1);
  const post = blogPostsData.find((item) => item.slug === blogSlug);
  let hasBlogPosting = false;
  if (isBlog) {
    if (/\[author name to be added\]/i.test(html) || /\[author name to be added\]/i.test(post?.authorName || '')) {
      throw new Error(`[seo-guard] Blog author placeholder found in ${filePath}`);
    }
    const visibleText = getVisibleText(html);
    output = output.replace(/(<script\b[^>]*type=["']application\/ld\+json["'][^>]*>)([\s\S]*?)(<\/script>)/gi, (tag, open, json, close) => {
      try {
        const schema = filterInvisibleFaqSchemas(JSON.parse(json), visibleText);
        if (!schema) return '';
        const enrichArticle = (value) => {
          if (!value || typeof value !== 'object') return;
          if (Array.isArray(value)) return value.forEach(enrichArticle);
          if (['Article', 'BlogPosting', 'NewsArticle'].includes(value['@type'])) {
            value['@type'] = 'BlogPosting';
            value['@id'] ||= `${normalizedCanonical}#blogposting`;
            value.headline ||= post?.title || title;
            value.description ||= post?.metaDescription || description;
            value.image ||= buildImageUrl(post?.ogImage || image || '/og-image.png');
            value.datePublished ||= post?.datePublished;
            value.dateModified ||= post?.dateModified || post?.datePublished;
            value.mainEntityOfPage ||= { '@type': 'WebPage', '@id': normalizedCanonical };
            if (!value.author?.['@type']) {
              value.author = post?.authorName
                ? { '@type': 'Person', name: post.authorName }
                : { '@type': 'Organization', name: 'Luxury Properties Ltd', url: getCanonicalUrl('/') };
            }
            if (!value.publisher?.logo) {
              value.publisher = {
                '@type': 'Organization',
                name: 'Luxury Properties Ltd',
                url: getCanonicalUrl('/'),
                logo: { '@type': 'ImageObject', url: getCanonicalUrl('/favicon.svg') },
              };
            }
            value.inLanguage ||= 'en-NG';
            hasBlogPosting = true;
          }
          Object.values(value).forEach(enrichArticle);
        };
        enrichArticle(schema);
        return `${open}${JSON.stringify(schema)}${close}`;
      } catch (error) {
        console.warn(`[seo-guard] Could not enrich JSON-LD in ${filePath}: ${error.message}`);
        return tag;
      }
    });
  }

  if (isBlog && !post && !hasBlogPosting) {
    throw new Error(`[seo-guard] No blog metadata found for ${normalizedCanonical}`);
  }
  if (isBlog && post && !hasBlogPosting) {
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      '@id': `${normalizedCanonical}#blogposting`,
      headline: post.title,
      description: post.metaDescription || description,
      image: buildImageUrl(post.ogImage || '/og-image.png'),
      datePublished: post.datePublished,
      dateModified: post.dateModified || post.datePublished,
      author: post.authorName
        ? { '@type': 'Person', name: post.authorName }
        : { '@type': 'Organization', name: 'Luxury Properties Ltd', url: getCanonicalUrl('/') },
      publisher: {
        '@type': 'Organization',
        name: 'Luxury Properties Ltd',
        url: getCanonicalUrl('/'),
        logo: { '@type': 'ImageObject', url: getCanonicalUrl('/favicon.svg') },
      },
      mainEntityOfPage: { '@type': 'WebPage', '@id': normalizedCanonical },
      inLanguage: 'en-NG',
    };
    output = output.replace('</head>', `<script type="application/ld+json">${JSON.stringify(schema)}</script>\n</head>`);
  }

  if (isCookiePolicy) {
    const hasWebPage = /"@type"\s*:\s*"WebPage"/.test(output);
    if (!hasWebPage) {
      const schema = {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: title,
        description,
        url: normalizedCanonical,
        inLanguage: 'en-NG',
      };
      output = output.replace('</head>', `<script type="application/ld+json">${JSON.stringify(schema)}</script>\n</head>`);
    }
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

function validateRenderedHtml(html, route, property = null) {
  const titleTags = [...html.matchAll(/<title\b[^>]*>([\s\S]*?)<\/title>/gi)];
  const title = decodeHtmlEntities(titleTags[0]?.[1]?.replace(/<[^>]+>/g, '').trim() || '');
  const descriptionTags = [...html.matchAll(/<meta\b[^>]*>/gi)]
    .map(([tag]) => tag)
    .filter((tag) => /\bname=["']description["']/i.test(tag));
  const description = decodeHtmlEntities(getMetaContent(html, 'name', 'description').trim());
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
    ['property', 'og:image'],
    ['name', 'twitter:card'],
    ['name', 'twitter:title'],
    ['name', 'twitter:description'],
    ['name', 'twitter:image'],
  ];

  const canonicalTags = [...html.matchAll(/<link\b[^>]*\brel=["']canonical["'][^>]*>/gi)];
  const canonical = canonicalTags.length ? getAttribute(canonicalTags[0][0], 'href') : '';
  if (!title || titleTags.length !== 1 || !description || descriptionTags.length !== 1 || !h1 || h1Matches.length !== 1) {
    throw new Error(`Invalid page metadata for ${route} (title count: ${titleTags.length}, description count: ${descriptionTags.length}, h1 count: ${h1Matches.length})`);
  }
  if (route !== '/' && (title === HOMEPAGE_TITLE || canonical === HOMEPAGE_CANONICAL)) {
    throw new Error(`Homepage title or canonical leaked into ${route}`);
  }
  if (isPropertyDetailRoute(route) && (canonicalTags.length !== 1 || canonical !== getCanonicalUrl(route))) {
    throw new Error(`Listing canonical is not unique and self-referencing in ${route}: ${canonical || '(missing)'}`);
  }

  if (isPropertyDetailRoute(route)) {
    if (title.length > 60) throw new Error(`Listing title exceeds 60 characters in ${route}: ${title.length}`);
    if (description.length < 140 || description.length > 160) {
      throw new Error(`Listing description must be 140-160 characters in ${route}: ${description.length}`);
    }
    if (!/data-listing-ready=["']true["']/.test(html)) {
      throw new Error(`Listing data is missing from prerendered HTML for ${route}`);
    }
    if (!/"@type"\s*:\s*"RealEstateListing"/.test(html)) {
      throw new Error(`RealEstateListing JSON-LD is missing for ${route}`);
    }
    if (!property) throw new Error(`Listing data is missing for ${route}`);
    const numericPrice = Number(String(property.price || '').replace(/[^\d.]/g, ''));
    if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
      throw new Error(`Listing price is missing or invalid for ${route}`);
    }
    const visiblePrice = new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(numericPrice);
    const body = html.slice(html.indexOf('</head>') + 7).toLocaleLowerCase();
    if (!body.includes(visiblePrice.toLocaleLowerCase())) {
      throw new Error(`Listing price in NGN is missing from rendered HTML for ${route}`);
    }
    const location = buildPropertySeo(property).area;
    if (!location || !body.includes(location.toLocaleLowerCase())) {
      throw new Error(`Listing location is missing from rendered HTML for ${route}`);
    }
    if (!property.property_type || !body.includes(String(property.property_type).toLocaleLowerCase())) {
      throw new Error(`Listing key facts are missing from rendered HTML for ${route}`);
    }
    const jsonLdValues = [...html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)]
      .flatMap(([, json]) => {
        try {
          return collectJsonLdValues(JSON.parse(json));
        } catch (error) {
          throw new Error(`Invalid JSON-LD in ${route}: ${error.message}`);
        }
      });
    const listing = jsonLdValues.find((value) => value['@type'] === 'RealEstateListing');
    const offer = listing?.offers;
    const availability = offer?.availability;
    if (!listing?.image || !listing.address?.addressLocality
      || listing.address.addressRegion !== 'Lagos'
      || listing.address.addressCountry !== 'NG'
      || listing.seller?.['@type'] !== 'RealEstateAgent'
      || !offer || offer.priceCurrency !== 'NGN'
      || Number(offer.price) !== numericPrice
      || !/^https:\/\/schema\.org\/(?:InStock|LimitedAvailability|SoldOut|OutOfStock)$/.test(availability || '')) {
      throw new Error(`RealEstateListing JSON-LD has incomplete or invalid listing data for ${route}`);
    }
  } else if (title.length > 60) {
    console.warn(`[seo-guard] Title exceeds 60 characters in ${route}: ${title.length}`);
  }
  if (!isPropertyDetailRoute(route) && (description.length < 70 || description.length > 160)) {
    console.warn(`[seo-guard] Description should be 70-160 characters in ${route}: ${description.length}`);
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
const propertyRecords = routes.propertyRecords || [];
const propertyRecordsBySlug = new Map(propertyRecords.map((property) => [property.slug, property]));
const missingListingData = routes
  .filter(isPropertyDetailRoute)
  .map((route) => {
    const slug = decodeURIComponent(route.slice('/properties/'.length));
    const property = propertyRecordsBySlug.get(slug);
    const seo = property ? buildPropertySeo(property) : null;
    if (!(Number(property?.bedrooms) > 0)) {
      console.warn(`[seo-guard] Bedroom count is missing for ${route}; using a property-specific title without a bedroom count.`);
    }
    const missing = [!property?.title && 'title', !seo?.area && 'neighbourhood'].filter(Boolean);
    return missing.length ? `${route}: ${missing.join(', ')}` : '';
  })
  .filter(Boolean);
if (missingListingData.length) {
  preview.kill('SIGTERM');
  throw new Error(`[prerender] Cannot emit listing SEO without complete listing data:\n- ${missingListingData.join('\n- ')}`);
}
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
  const isDynamicPropertyRoute = isPropertyDetailRoute(route);
  const expectedCanonical = route.startsWith('/investment-brief/')
    ? null
    : getCanonicalUrl(route);
  const page = await browser.newPage();
  const pageErrors = [];
  page.on('pageerror', (error) => pageErrors.push(error));
  try {
    await page.evaluateOnNewDocument(() => {
      window.__PRERENDERING__ = true;
    });
    await page.evaluateOnNewDocument((records) => {
      window.__PRERENDER_PROPERTIES__ = records;
    }, propertyRecords);
    // Set a reasonable viewport
    await page.setViewport({ width: 1280, height: 720 });

    // Navigate to the route
    await page.goto(`${BASE_URL}${route}`, { waitUntil: 'domcontentloaded', timeout: 30000 });

    // Require actual page content before capturing. Async pages expose a
    // false marker while loading; static pages only need their visible H1.
    await page.waitForFunction(
      (canonicalUrl, propertyRoute) => document.querySelector('h1')
        && document.title.trim()
        && document.querySelector('meta[name="description"]')?.content.trim()
        && (!canonicalUrl || document.querySelector('link[rel="canonical"]')?.href === canonicalUrl)
        && (!propertyRoute || document.querySelector('[data-listing-ready="true"]'))
        && !document.querySelector('[data-prerender-ready="false"]'),
      { timeout: isDynamicPropertyRoute ? 30000 : 20000 },
      expectedCanonical,
      isDynamicPropertyRoute,
    );
    if (pageErrors.length > 0) {
      throw new Error(`Uncaught browser error on ${route}: ${pageErrors.map((error) => error.message).join('; ')}`);
    }
    // Get the rendered HTML
    const html = await page.content();
    const property = isDynamicPropertyRoute
      ? propertyRecordsBySlug.get(decodeURIComponent(route.slice('/properties/'.length)))
      : null;
    validateRenderedHtml(html, route, property);

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