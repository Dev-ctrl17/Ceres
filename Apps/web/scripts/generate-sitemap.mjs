import { createClient } from '@supabase/supabase-js';
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'fs';
import { resolve, dirname, basename } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { STATIC_ROUTES } from './getRoutes.js';
import { blogPostsData } from '../src/data/blogPosts.js';
import { generateSlug } from '../src/lib/slug.js';
import { getCanonicalUrl } from '../src/lib/siteConfig.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = resolve(__dirname, '../public');
const SITEMAP_PATH = resolve(PUBLIC_DIR, 'sitemap.xml');
const LANDING_DIR = resolve(PUBLIC_DIR, 'landing');
const PROPERTY_PAGE_SIZE = 24;
const REDIRECTED_PROPERTY_SLUGS = new Set([
  'governor-s-consent-approved-building-plan',
  'governor-s-consent-approved-building-plan-0f6d',
  'governor-s-consent-approved-building-plan-253k',
  'governor-s-consent-approved-building-plan-dhu4',
  '-long-lease-investment-opportunity',
  'exquiisite-5-bedroom-fully-detached-smart-luxury-residence',
]);
const LANDING_SLUGS = new Map([
  ['house-for-sale-lekki', 'houses-for-sale-lekki'],
  ['shortlet-apartment-lagos', 'shortlet-apartments-lagos'],
]);
const NON_INDEXABLE_ROUTES = new Set(['/refer-and-earn']);

function loadEnv() {
  const envPath = resolve(__dirname, '../.env');
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const entry = line.trim();
    if (!entry || entry.startsWith('#')) continue;
    const separator = entry.indexOf('=');
    if (separator < 0) continue;
    const key = entry.slice(0, separator).trim();
    if (!process.env[key]) process.env[key] = entry.slice(separator + 1).trim();
  }
}

const escapeXml = (value) => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');

function isIndexableLanding(slug) {
  const htmlPath = resolve(LANDING_DIR, `${slug}.html`);
  if (!existsSync(htmlPath)) return false;
  const html = readFileSync(htmlPath, 'utf8');
  return !/<meta\s+[^>]*name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(html);
}

export async function fetchPropertySlugs() {
  loadEnv();
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const anon = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  if (!url || !anon) {
    throw new Error('Missing Supabase credentials; refusing to write an incomplete sitemap.');
  }

  const supabase = createClient(url, anon);
  const { data, count, error } = await supabase.from('properties').select('slug, updated_at', { count: 'exact' });
  if (error) throw new Error(`Supabase property query failed: ${error.message}`);

  const seen = new Set();
  const records = (data || []).filter(({ slug }) => {
    if (!slug || slug !== generateSlug(slug) || seen.has(slug)) return false;
    seen.add(slug);
    return true;
  });
  Object.defineProperty(records, 'totalCount', { value: count || data?.length || 0 });
  return records;
}

export async function fetchSecondaryRoutes() {
  loadEnv();
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const anon = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  if (!url || !anon) throw new Error('Missing Supabase credentials; refusing to write an incomplete sitemap.');

  const supabase = createClient(url, anon);
  const [{ data: proposals, error: proposalsError }, { data: projects, error: projectsError }] = await Promise.all([
    supabase.from('proposals').select('slug').eq('status', 'published'),
    supabase.from('ongoing_projects').select('id'),
  ]);
  if (proposalsError) throw new Error(`Supabase proposal query failed: ${proposalsError.message}`);
  if (projectsError) throw new Error(`Supabase project query failed: ${projectsError.message}`);

  return [
    ...(proposals || []).filter((item) => item.slug).map((item) => `/client-success/${encodeURIComponent(item.slug)}`),
    ...(projects || []).filter((item) => item.id).map((item) => `/ongoing-projects/${encodeURIComponent(item.id)}`),
  ];
}

function validLastmod(value) {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.valueOf()) ? '' : date.toISOString().slice(0, 10);
}

export function buildSitemap(propertyRecords = [], secondaryRoutes = []) {
  const routes = new Set(STATIC_ROUTES.filter((route) => !NON_INDEXABLE_ROUTES.has(route)));
  const lastmodByRoute = new Map();

  for (const route of secondaryRoutes) routes.add(route);

  for (const post of blogPostsData) {
    if (post.slug) {
      const route = `/blog/${post.slug}`;
      routes.add(route);
      const lastmod = validLastmod(post.dateModified || post.datePublished);
      if (lastmod) lastmodByRoute.set(route, lastmod);
    }
  }

  for (const file of readdirSync(LANDING_DIR)) {
    if (file.endsWith('.html')) {
      const slug = basename(file, '.html');
      if (isIndexableLanding(slug)) routes.add(`/landing/${LANDING_SLUGS.get(slug) || slug}`);
    }
  }

  const properties = propertyRecords.map((property) =>
    typeof property === 'string' ? { slug: property } : property
  );
  for (const property of properties) {
    const { slug } = property || {};
    if (slug && slug === generateSlug(slug) && !REDIRECTED_PROPERTY_SLUGS.has(slug)) {
      const route = `/properties/${slug}`;
      routes.add(route);
      const lastmod = validLastmod(property.updated_at);
      if (lastmod) lastmodByRoute.set(route, lastmod);
    }
  }

  const pageCount = Math.ceil((propertyRecords.totalCount || properties.length) / PROPERTY_PAGE_SIZE);
  for (let page = 2; page <= pageCount; page++) routes.add(`/properties/page/${page}`);

  const urls = [...routes]
    .map((route) => getCanonicalUrl(route))
    .filter((url, index, all) => all.indexOf(url) === index)
    .sort()
    .map((loc) => {
      const route = new URL(loc).pathname;
      const lastmod = lastmodByRoute.get(route);
      return `  <url>\n    <loc>${escapeXml(loc)}</loc>${lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ''}\n  </url>`;
    });

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`;
}

async function main() {
  const slugs = await fetchPropertySlugs();
  const secondaryRoutes = await fetchSecondaryRoutes();
  const xml = buildSitemap(slugs, secondaryRoutes);
  writeFileSync(SITEMAP_PATH, xml, 'utf8');
  console.log(`[generate-sitemap] Wrote ${SITEMAP_PATH} with ${xml.match(/<url>/g)?.length || 0} URLs.`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch((error) => {
    console.error('[generate-sitemap] Failed:', error.message);
    process.exit(1);
  });
}