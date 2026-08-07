import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };
const supabase = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "", { auth: { persistSession: false } });
const turnstileSecret = Deno.env.get("TURNSTILE_SECRET_KEY");
const rateLimitSalt = Deno.env.get("REGISTRATION_RATE_LIMIT_SALT");

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ success: false, error: "METHOD_NOT_ALLOWED" }, 405);
  try {
    const body = await req.json();
    const fullName = body.full_name?.trim(); const email = body.email?.trim().toLowerCase(); const phone = body.phone_number?.trim();
    if (!fullName || !email || !phone || !/^\S+@\S+\.\S+$/.test(email)) return json({ success: false, error: "MISSING_REQUIRED_FIELDS" }, 400);
    if (!turnstileSecret || !rateLimitSalt) return json({ success: false, error: "SECURITY_CONFIGURATION_MISSING" }, 503);
    const clientIp = getClientIp(req);
    const captchaValid = await verifyTurnstile(body.turnstile_token, clientIp);
    if (!captchaValid) return json({ success: false, error: "CAPTCHA_FAILED" }, 400);
    const { data: allowed, error: rateLimitError } = await supabase.rpc("consume_referral_registration_rate_limit", { p_ip_hash: await hashIp(clientIp) });
    if (rateLimitError) return json({ success: false, error: "RATE_LIMIT_UNAVAILABLE" }, 503);
    if (!allowed) return json({ success: false, error: "RATE_LIMITED" }, 429);
    const { data: consultantId, error } = await supabase.rpc("register_consultant", { p_full_name: fullName, p_email: email, p_phone_number: phone, p_bank_name: body.bank_name ?? null, p_account_number: body.account_number ?? null, p_account_name: body.account_name ?? null, p_ref_code: body.ref ?? null });
    if (error) { const code = knownError(error.message); return json({ success: false, error: code }, code === "EMAIL_TAKEN" || code === "PHONE_TAKEN" ? 409 : code === "INVALID_REF_CODE" ? 400 : 500); }
    const { error: profileError } = await supabase.from("consultants").update({ date_of_birth: body.date_of_birth || null, gender: body.gender || null, city: body.city || null, address: body.address || null, state: body.state || null, country: body.country || "Nigeria", terms_accepted_at: new Date().toISOString() }).eq("id", consultantId);
    if (profileError) return json({ success: false, error: "REGISTRATION_FAILED" }, 500);
    const { data: consultant, error: fetchError } = await supabase.from("consultants").select("id, full_name, referral_code").eq("id", consultantId).single();
    if (fetchError || !consultant) return json({ success: false, error: "REGISTRATION_FAILED" }, 500);
    const referralLink = `https://luxurypropertiesltd.com.ng/register?ref=${consultant.referral_code}`;
    const message = `Join Luxury Properties Ltd as a consultant: ${referralLink}`;
    return json({ success: true, data: { consultant, referralLink, whatsappShareUrl: `https://wa.me/?text=${encodeURIComponent(message)}` } }, 201);
  } catch (error) { return json({ success: false, error: "INVALID_REQUEST" }, 400); }
});
function knownError(message: string) { return ["EMAIL_TAKEN", "PHONE_TAKEN", "INVALID_REF_CODE"].find((code) => message.includes(code)) ?? "REGISTRATION_FAILED"; }
function json(payload: unknown, status = 200) { return new Response(JSON.stringify(payload), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } }); }
function getClientIp(req: Request) { return req.headers.get("x-forwarded-for")?.split(",")[0].trim() || req.headers.get("x-real-ip") || "unknown"; }
async function hashIp(ip: string) { const bytes = new TextEncoder().encode(`${rateLimitSalt}:${ip}`); const digest = await crypto.subtle.digest("SHA-256", bytes); return [...new Uint8Array(digest)].map((value) => value.toString(16).padStart(2, "0")).join(""); }
async function verifyTurnstile(token: unknown, remoteip: string) { if (typeof token !== "string" || !token) return false; const form = new FormData(); form.append("secret", turnstileSecret!); form.append("response", token); form.append("remoteip", remoteip); const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body: form }); const data = await response.json(); return response.ok && data.success === true; }
