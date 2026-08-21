import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

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

// Static routes to always prerender
const STATIC_ROUTES = ['/', '/about', '/contact', '/blog'];

/**
 * Fetch all routes to prerender:
 * - Static routes: /, /about, /contact, /blog
  * - Dynamic property routes: /properties/:slug for every row in the `properties` table
 * - Dynamic blog routes: /blog/:slug for every post in the local blogPostsData
 */
export async function getAllRoutes() {
  const routes = [...STATIC_ROUTES];

  // --- Fetch property IDs from Supabase ---
  if (supabaseUrl && supabaseAnonKey) {
    try {
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      const { data: properties, error } = await supabase
        .from('properties')
        .select('slug');

      if (error) {
        console.warn('[getRoutes] Failed to fetch properties from Supabase:', error.message);
      } else if (properties && properties.length > 0) {
        properties.forEach(prop => {
          if (prop.slug) routes.push(`/properties/${prop.slug}`);
        });
        console.log(`[getRoutes] Found ${properties.length} property routes`);
      } else {
        console.warn('[getRoutes] No properties found in Supabase');
      }
    } catch (err) {
      console.warn('[getRoutes] Error connecting to Supabase:', err.message);
    }
  } else {
    console.warn('[getRoutes] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY — skipping property routes');
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

  console.log(`[getRoutes] Total routes to prerender: ${routes.length}`);
  return routes;
}

export default getAllRoutes;
