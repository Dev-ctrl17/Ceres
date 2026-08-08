import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const headers = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type", "Content-Type": "application/json" };
const service = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

serve(async (request) => {
  if (request.method === "OPTIONS") return response({}, 204);
  if (request.method !== "POST") return response({ error: "METHOD_NOT_ALLOWED" }, 405);
  const auth = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: request.headers.get("Authorization") ?? "" } } });
  const { data: { user } } = await auth.auth.getUser();
  const admins = (Deno.env.get("ESTATEOS_ADMIN_EMAILS") ?? Deno.env.get("REFERRAL_ADMIN_EMAILS") ?? "").split(",").map((email) => email.trim().toLowerCase());
  if (!user?.email || !admins.includes(user.email.toLowerCase())) return response({ error: "FORBIDDEN" }, 403);
  const body = await request.json();
  if (body.action === "create") {
    const key = `estateos_live_${[...crypto.getRandomValues(new Uint8Array(16))].map((value) => value.toString(16).padStart(2, "0")).join("")}`;
    const { error } = await service.from("estateos_api_keys").insert({ name: body.name || "EstateOS Production 2", key_hash: await sha256(key), key_prefix: "estateos_", key_suffix: key.slice(-4), is_active: true, is_read_only: true, created_by: user.id });
    return error ? response({ error: "CREATE_FAILED" }, 500) : response({ success: true, key, message: "Copy this key now. It will not be shown again." }, 201);
  }
  if (body.action === "revoke" && body.keyId) {
    const { error } = await service.from("estateos_api_keys").update({ is_active: false, revoked_at: new Date().toISOString() }).eq("id", body.keyId);
    return error ? response({ error: "REVOKE_FAILED" }, 500) : response({ success: true });
  }
  return response({ error: "INVALID_ACTION" }, 400);
});
async function sha256(value: string) { const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)); return [...new Uint8Array(bytes)].map((byte) => byte.toString(16).padStart(2, "0")).join(""); }
function response(body: unknown, status = 200) { return new Response(JSON.stringify(body), { status, headers }); }
