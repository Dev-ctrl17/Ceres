import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const appDir = resolve(__dirname, '..');
const projectUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!projectUrl || !serviceRoleKey) {
  throw new Error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in the deployment environment.');
}

const sourcePath = resolve(appDir, 'public/property-image-placeholder.svg');
const asset = readFileSync(sourcePath);
const supabase = createClient(projectUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const storagePath = 'placeholders/property-image-placeholder.svg';
const { error } = await supabase.storage
  .from('property-images')
  .upload(storagePath, asset, {
    contentType: 'image/svg+xml',
    cacheControl: '31536000',
    upsert: true,
  });

if (error) throw new Error(`Placeholder upload failed: ${error.message}`);
console.log(supabase.storage.from('property-images').getPublicUrl(storagePath).data.publicUrl);
