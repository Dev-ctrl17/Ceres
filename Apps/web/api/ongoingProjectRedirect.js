import { createClient } from '@supabase/supabase-js';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DOMAIN = 'https://www.luxurypropertiesltd.com.ng';

export default async function ongoingProjectRedirect(req, res) {
  const uuid = req.query?.uuid;
  if (!uuid || !UUID_RE.test(uuid)) return res.status(404).send('Project not found');

  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) return res.status(500).send('Server misconfigured');

  const supabase = createClient(supabaseUrl, supabaseKey);
  const { data, error } = await supabase
    .from('ongoing_projects')
    .select('slug')
    .eq('id', uuid)
    .maybeSingle();
  if (error) {
    console.error('[ongoingProjectRedirect] lookup failed:', error.code || 'unknown');
    return res.status(503).send('Project lookup unavailable');
  }
  if (!data?.slug) return res.status(404).send('Project not found');

  return res.redirect(301, `${DOMAIN}/ongoing-projects/${encodeURIComponent(data.slug)}`);
}
