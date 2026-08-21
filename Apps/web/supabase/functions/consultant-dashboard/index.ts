import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const headers = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type", "Content-Type": "application/json" };
const service = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

serve(async (req) => {
	if (req.method === "OPTIONS") return new Response("ok", { headers });
	const auth = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } } });
	const { data: { user } } = await auth.auth.getUser();
	if (!user) return reply({ success: false, error: "UNAUTHENTICATED" }, 401);
	const { data: consultant } = await service.from("consultants").select("id,full_name,email,referral_code,is_team_leader").eq("auth_user_id", user.id).maybeSingle();
	if (!consultant) return reply({ success: false, error: "CONSULTANT_NOT_FOUND" }, 404);
	if (!consultant.is_team_leader) return reply({ success: false, error: "This account does not have portal access." }, 403);
	const [{ data: referrals }, { data: commissions }] = await Promise.all([
		service.from("consultants").select("id,full_name,phone_number,email,city,state,created_at,referral_code").eq("referred_by", consultant.id).order("created_at", { ascending: false }),
		service.from("referral_commissions").select("amount,status").eq("consultant_id", consultant.id)
	]);
	const referralIds = (referrals ?? []).map((row) => row.id);
	const { data: deals } = referralIds.length ? await service.from("referral_deals").select("id,property_name,deal_amount,status").in("closing_consultant_id", referralIds).order("created_at", { ascending: false }).limit(10) : { data: [] };
	const sums = (commissions ?? []).reduce((total, row) => ({ pendingCommission: total.pendingCommission + (row.status === "pending" ? Number(row.amount) : 0), paidCommission: total.paidCommission + (row.status === "disbursed" ? Number(row.amount) : 0) }), { pendingCommission: 0, paidCommission: 0 });
	return reply({ success: true, data: { consultant, referrals: referrals ?? [], deals: deals ?? [], stats: { directReferrals: referrals?.length ?? 0, totalNetwork: referrals?.length ?? 0, ...sums } } });
});
function reply(body: unknown, status = 200) { return new Response(JSON.stringify(body), { status, headers }); }
