-- Safe remediation for the Supabase Security Advisor findings.
-- Run this in Supabase SQL Editor, then rerun the Security Advisor.
begin;

-- Pin search_path for functions reported as mutable.
alter function public.handle_new_user() set search_path = public, pg_temp;
alter function public.update_updated_at_column() set search_path = public, pg_temp;
alter function public.increment_property_view_count(uuid) set search_path = public, pg_temp;
alter function public.increment_property_inquiry_count(uuid) set search_path = public, pg_temp;
alter function public.update_proposals_updated_at() set search_path = public, pg_temp;
alter function public.generate_proposal_slug(text) set search_path = public, pg_temp;
alter function public.estateos_touch_api_key(text, text) set search_path = public, pg_temp;
alter function public.estateos_mark_webhook_sent(bigint, smallint, text) set search_path = public, pg_temp;
alter function public.estateos_increment_webhook_attempt(bigint, text) set search_path = public, pg_temp;
alter function public.estateos_log_property_change() set search_path = public, pg_temp;
alter function public.set_properties_updated_at() set search_path = public, pg_temp;
alter function public.rls_auto_enable() set search_path = public, pg_temp;

-- These are trigger/server-only functions. Block all direct browser RPC calls.
revoke all on function public.handle_new_user() from anon, authenticated;
revoke all on function public.estateos_log_property_change() from anon, authenticated;
revoke all on function public.estateos_mark_webhook_sent(bigint, smallint, text) from anon, authenticated;
revoke all on function public.estateos_increment_webhook_attempt(bigint, text) from anon, authenticated;
revoke all on function public.estateos_touch_api_key(text, text) from anon, authenticated;
revoke all on function public.rls_auto_enable() from anon, authenticated;

commit;

-- Do not blindly remove the remaining permissive RLS policies listed by the
-- advisor: public lead/newsletter/visitor writes and authenticated admin writes
-- are currently used by the application. Move them to validated Edge Functions
-- or apply an explicit admin-role policy before replacing those policies.
