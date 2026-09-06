/**
 * Supabase Edge Function: register-consultant
 * -------------------------------------------
 * Deploy with: supabase functions deploy register-consultant
 *
 * POST /functions/v1/register-consultant
 * Body: { full_name, email, phone_number, bank_name?, account_number?,
 *         account_name?, ref? }
 *
 * Returns: { user, referralLink, whatsappShareUrl }
 */

import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const REFERRAL_BASE_URL = 'https://luxurypropertiesltd.com.ng/register';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'METHOD_NOT_ALLOWED' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await req.json();

    const fullName = body.full_name?.trim();
    const email = body.email?.trim().toLowerCase();
    const phone = body.phone_number?.trim();
    const refCode = body.ref?.trim() || null;

    if (!fullName || !email || !phone) {
      return json({ error: 'MISSING_REQUIRED_FIELDS' }, 400);
    }

    // ------------------------------------------------------------------------
    // 1. Validate unique email & phone
    // ------------------------------------------------------------------------
    const { data: emailExists } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (emailExists) {
      return json({ error: 'EMAIL_TAKEN' }, 409);
    }

    const { data: phoneExists } = await supabase
      .from('users')
      .select('id')
      .eq('phone_number', phone)
      .maybeSingle();

    if (phoneExists) {
      return json({ error: 'PHONE_TAKEN' }, 409);
    }

    // ------------------------------------------------------------------------
    // 2. Validate referral code (if provided)
    // ------------------------------------------------------------------------
    if (refCode) {
      const { data: parent } = await supabase
        .from('users')
        .select('id')
        .eq('referral_code', refCode.toUpperCase())
        .maybeSingle();

      if (!parent) {
        return json({ error: 'INVALID_REF_CODE' }, 400);
      }
    }

    // ------------------------------------------------------------------------
    // 3. Call the RPC — atomically inserts user + closure table rows
    // ------------------------------------------------------------------------
    const { data: newUserId, error: rpcError } = await supabase.rpc(
      'register_consultant',
      {
        p_full_name: fullName,
        p_email: email,
        p_phone_number: phone,
        p_bank_name: body.bank_name?.trim() ?? null,
        p_account_number: body.account_number?.trim() ?? null,
        p_account_name: body.account_name?.trim() ?? null,
        p_ref_code: refCode,
      }
    );

    if (rpcError) {
      const msg = rpcError.message ?? '';
      if (msg.includes('EMAIL_TAKEN')) return json({ error: 'EMAIL_TAKEN' }, 409);
      if (msg.includes('PHONE_TAKEN')) return json({ error: 'PHONE_TAKEN' }, 409);
      if (msg.includes('INVALID_REF_CODE')) return json({ error: 'INVALID_REF_CODE' }, 400);
      return json({ error: 'REGISTRATION_FAILED', detail: msg }, 500);
    }

    // ------------------------------------------------------------------------
    // 4. Fetch the new user
    // ------------------------------------------------------------------------
    const { data: newUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', newUserId)
      .single();

    if (fetchError || !newUser) {
      return json({ error: 'FAILED_TO_FETCH_NEW_USER' }, 500);
    }

    // ------------------------------------------------------------------------
    // 5. Build referral link + WhatsApp share URL
    // ------------------------------------------------------------------------
    const referralLink = `${REFERRAL_BASE_URL}?ref=${newUser.referral_code}`;

    const whatsappMessage =
      `🏠 *Join Luxury Properties Ltd — Earn on Every Referral!*\n\n` +
      `Hi! I've just joined Luxury Properties Ltd as a consultant and I'm earning ` +
      `commissions on luxury real estate deals. You can too!\n\n` +
      `👉 Register here: ${referralLink}\n\n` +
      `Earn up to 4 generations deep. Let's grow together! 🚀`;

    const whatsappShareUrl = `https://wa.me/?text=${encodeURIComponent(whatsappMessage)}`;

    return json(
      {
        success: true,
        data: {
          user: newUser,
          referralLink,
          whatsappShareUrl,
        },
      },
      201
    );
  } catch (err) {
    return json({ error: 'INTERNAL_SERVER_ERROR', detail: String(err) }, 500);
  }
});

/** Helper to return a JSON response with CORS headers. */
function json(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}