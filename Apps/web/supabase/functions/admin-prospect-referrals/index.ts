import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json",
};
const statuses = ["New", "Contacted", "Closed"];

function response(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers });
}

serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers });
  if (request.method !== "POST") return response({ success: false, error: "Method not allowed." }, 405);

  const authClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: request.headers.get("Authorization") ?? "" } } },
  );
  const { data: { user } } = await authClient.auth.getUser();
  const allowedEmails = (Deno.env.get("REFERRAL_ADMIN_EMAILS") ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

  if (!user?.email || !allowedEmails.includes(user.email.toLowerCase())) {
    return response({ success: false, error: "FORBIDDEN" }, 403);
  }

  const serviceClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
  const body = await request.json().catch(() => ({}));

  if (body.action === "update-status") {
    if (!body.id || !statuses.includes(body.status)) {
      return response({ success: false, error: "A valid referral and status are required." }, 400);
    }
    const { data, error } = await serviceClient
      .from("prospect_referrals")
      .update({ status: body.status, updated_at: new Date().toISOString() })
      .eq("id", body.id)
      .select("id, status, updated_at")
      .single();
    if (error) return response({ success: false, error: "Could not update referral status." }, 500);
    return response({ success: true, data });
  }

  const { data, error } = await serviceClient
    .from("prospect_referrals")
    .select("id, submitted_at, status, email_sent, delivery_error, submitter_name, submitter_phone, submitter_email, property_suggestion, relationship, prospect_name, prospect_phone, prospect_email")
    .order("submitted_at", { ascending: false });
  if (error) return response({ success: false, error: "Could not load prospect referrals." }, 500);
  return response({ success: true, data: data ?? [] });
});