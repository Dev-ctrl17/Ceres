import { createClient } from '@supabase/supabase-js';
import { generateSlug, getCurrentPropertySlug } from '../src/lib/slug.js';
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REDIRECTED_PROPERTY_SLUGS = new Set([
  'exquiisite-5-bedroom-fully-detached-smart-luxury-residence',
]);

// Load .env file manually (Vite loads it for config, but this script may also be run standalone)
function loadEnv() {
  const envPath = resolve(__dirname, '../.env');
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

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

// Static routes to always prerender. Keep this list in sync with public routes
// so every core page receives its own HTML document at build time.
export const STATIC_ROUTES = [
  '/',
  '/about',
  '/contact',
  '/properties',
  '/buy',
  '/sell',
  '/rent',
  '/agents',
  '/services',
  '/faq',
  '/reviews',
  '/ongoing-projects',
  '/client-success',
  '/investment-brief',
  '/company-registration',
  '/office-locations',
  '/refund-policy',
  '/cookie-policy',
  '/terms-conditions',
  '/privacy-policy',
  '/blog',
  '/refer-and-earn',
  '/epan',
  '/become-an-agent',
  '/careers/nysc-legal-admin',
];

/**
 * Fetch all routes to prerender:
 * - Static routes: all public core pages plus /blog
   * - Dynamic property routes: /properties/:slug for every row with a slug in the `properties` table
 * - Dynamic blog routes: /blog/:slug for every post in the local blogPostsData
 */
export async function getAllRoutes() {
  const routes = [...STATIC_ROUTES];
  const propertyRecords = [];

  // --- Fetch property IDs from Supabase ---
  if (supabaseUrl && supabaseAnonKey) {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { data: properties, error } = await supabase
      .from('properties')
      .select('*');

    if (error) {
      throw new Error(`[getRoutes] Failed to fetch property data for prerendering: ${error.message}`);
    }
    propertyRecords.push(...(properties || []));
    propertyRecords.forEach((property) => {
      if (property.slug && !REDIRECTED_PROPERTY_SLUGS.has(property.slug) && property.slug === generateSlug(property.slug) && property.slug === getCurrentPropertySlug(property.slug)) {
        routes.push(`/properties/${encodeURIComponent(property.slug)}`);
      }
    });
    const listingPages = Math.ceil(propertyRecords.length / 24);
    for (let page = 2; page <= listingPages; page++) routes.push(`/properties/page/${page}`);
    console.log(`[getRoutes] Found ${propertyRecords.length} property records for prerendering`);
  } else {
    throw new Error('[getRoutes] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY; refusing to skip property prerendering.');
  }

  if (supabaseUrl && supabaseAnonKey) {
    try {
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      const [{ data: proposals }, { data: projects }, { data: brochures }] = await Promise.all([
        supabase.from('proposals').select('slug').eq('status', 'published'),
        supabase.from('ongoing_projects').select('id'),
        supabase.from('brochures').select('id').eq('status', 'published'),
      ]);
      (proposals || []).forEach(item => {
        if (item.slug) routes.push(`/client-success/${encodeURIComponent(item.slug)}`);
      });
      (projects || []).forEach(item => {
        if (item.id) routes.push(`/ongoing-projects/${encodeURIComponent(item.id)}`);
      });
      (brochures || []).forEach(item => {
        if (item.id) routes.push(`/investment-brief/${encodeURIComponent(item.id)}`);
      });
      console.log(`[getRoutes] Found ${proposals?.length || 0} client success, ${projects?.length || 0} project, and ${brochures?.length || 0} brochure routes`);
    } catch (err) {
      console.warn('[getRoutes] Failed to enumerate secondary public routes:', err.message);
    }
  }

  // --- Fetch blog slugs from local data ---
  try {
    const { blogPostsData } = await import('../src/data/blogPosts.js');
    if (blogPostsData && blogPostsData.length > 0) {
      blogPostsData.forEach(post => {
        if (post.slug) routes.push(`/blog/${post.slug}`);
      });
      console.log(`[getRoutes] Found ${blogPostsData.length} blog routes`);
    }
  } catch (err) {
    console.warn('[getRoutes] Failed to load blog posts data:', err.message);
  }

  const uniqueRoutes = [...new Set(routes)];
  Object.defineProperty(uniqueRoutes, 'propertyRecords', { value: propertyRecords });
  console.log(`[getRoutes] Total routes to prerender: ${uniqueRoutes.length}`);
  return uniqueRoutes;
}

export default getAllRoutes;
