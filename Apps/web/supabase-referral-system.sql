-- Run once in the Supabase SQL Editor for the same project used by Apps/web.
create extension if not exists "pgcrypto";

create table if not exists public.consultants (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  phone_number text not null,
  bank_name text,
  account_number text,
  account_name text,
  referral_code text not null unique,
  parent_id uuid references public.consultants(id) on delete set null,
  created_at timestamptz not null default now()
);
create unique index if not exists consultants_email_lower_key on public.consultants (lower(email));
create unique index if not exists consultants_phone_number_key on public.consultants (phone_number);
create index if not exists consultants_parent_id_idx on public.consultants (parent_id);

create table if not exists public.referral_trees (
  ancestor_id uuid not null references public.consultants(id) on delete cascade,
  descendant_id uuid not null references public.consultants(id) on delete cascade,
  depth integer not null check (depth between 0 and 4),
  primary key (ancestor_id, descendant_id)
);
create index if not exists referral_trees_descendant_depth_idx on public.referral_trees (descendant_id, depth);
alter table public.referral_trees drop constraint if exists referral_trees_depth_check;
alter table public.referral_trees add constraint referral_trees_depth_check check (depth between 0 and 4);

create table if not exists public.referral_deals (
  id uuid primary key default gen_random_uuid(),
  property_name text not null,
  deal_amount numeric(14,2) not null check (deal_amount >= 0),
  closing_consultant_id uuid not null references public.consultants(id) on delete restrict,
  status text not null default 'pending' check (status in ('pending', 'verified', 'paid')),
  created_at timestamptz not null default now()
);

create table if not exists public.referral_commissions (
  id uuid primary key default gen_random_uuid(),
  deal_id uuid not null references public.referral_deals(id) on delete cascade,
  consultant_id uuid not null references public.consultants(id) on delete restrict,
  generation_level integer not null check (generation_level between 1 and 4),
  amount numeric(14,2) not null check (amount >= 0),
  status text not null default 'pending' check (status in ('pending', 'disbursed')),
  created_at timestamptz not null default now(),
  unique (deal_id, consultant_id)
);

create table if not exists public.referral_registration_rate_limits (
  ip_hash text primary key,
  window_started_at timestamptz not null default now(),
  attempt_count integer not null default 0 check (attempt_count >= 0)
);

create or replace function public.register_consultant(p_full_name text, p_email text, p_phone_number text, p_bank_name text, p_account_number text, p_account_name text, p_ref_code text default null)
returns uuid language plpgsql security definer set search_path = public as $$
declare v_parent_id uuid; v_new_id uuid; v_code text;
begin
  if exists (select 1 from consultants where lower(email) = lower(trim(p_email))) then raise exception 'EMAIL_TAKEN'; end if;
  if exists (select 1 from consultants where phone_number = trim(p_phone_number)) then raise exception 'PHONE_TAKEN'; end if;
  if nullif(trim(p_ref_code), '') is not null then
    select id into v_parent_id from consultants where referral_code = upper(trim(p_ref_code));
    if v_parent_id is null then raise exception 'INVALID_REF_CODE'; end if;
  end if;
  loop
    v_code := upper(substr(md5(random()::text || clock_timestamp()::text), 1, 8));
    exit when not exists (select 1 from consultants where referral_code = v_code);
  end loop;
  insert into consultants (full_name, email, phone_number, bank_name, account_number, account_name, referral_code, parent_id)
  values (trim(p_full_name), lower(trim(p_email)), trim(p_phone_number), nullif(trim(p_bank_name), ''), nullif(trim(p_account_number), ''), nullif(trim(p_account_name), ''), v_code, v_parent_id) returning id into v_new_id;
  insert into referral_trees (ancestor_id, descendant_id, depth) values (v_new_id, v_new_id, 0);
  if v_parent_id is not null then
    -- Parent's self row becomes depth 1, so this creates no duplicate row.
    insert into referral_trees (ancestor_id, descendant_id, depth)
    select ancestor_id, v_new_id, depth + 1 from referral_trees where descendant_id = v_parent_id and depth < 4;
  end if;
  return v_new_id;
end;
$$;

drop function if exists public.process_referral_commission(uuid, numeric);
create or replace function public.process_referral_commission(p_deal_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare v_closer uuid; v_deal_amount numeric; v_first_amount numeric; v_second_amount numeric; v_third_amount numeric; v_fourth_amount numeric;
begin
  select closing_consultant_id, deal_amount into v_closer, v_deal_amount from referral_deals where id = p_deal_id for update;
  if v_closer is null then raise exception 'DEAL_NOT_FOUND'; end if;
  if exists (select 1 from referral_commissions where deal_id = p_deal_id) then raise exception 'ALREADY_PROCESSED'; end if;
  if v_deal_amount >= 1000000000 then
    v_first_amount := 900000; v_second_amount := 400000; v_third_amount := 200000; v_fourth_amount := 100000;
  elsif v_deal_amount >= 500000000 then
    v_first_amount := 700000; v_second_amount := 300000; v_third_amount := 150000; v_fourth_amount := 70000;
  elsif v_deal_amount >= 100000000 then
    v_first_amount := 500000; v_second_amount := 250000; v_third_amount := 100000; v_fourth_amount := 50000;
  else
    raise exception 'DEAL_BELOW_MINIMUM_VALUE';
  end if;
  insert into referral_commissions (deal_id, consultant_id, generation_level, amount)
  select p_deal_id, ancestor_id, depth,
    case depth when 1 then v_first_amount when 2 then v_second_amount when 3 then v_third_amount when 4 then v_fourth_amount end
  from referral_trees where descendant_id = v_closer and depth between 1 and 4;
  update referral_deals set status = 'verified' where id = p_deal_id;
end;
$$;

create or replace function public.consume_referral_registration_rate_limit(p_ip_hash text)
returns boolean language plpgsql security definer set search_path = public as $$
declare v_window_started_at timestamptz; v_attempt_count integer;
begin
  insert into referral_registration_rate_limits (ip_hash, window_started_at, attempt_count)
  values (p_ip_hash, now(), 1)
  on conflict (ip_hash) do update set
    window_started_at = case when referral_registration_rate_limits.window_started_at < now() - interval '15 minutes' then now() else referral_registration_rate_limits.window_started_at end,
    attempt_count = case when referral_registration_rate_limits.window_started_at < now() - interval '15 minutes' then 1 else referral_registration_rate_limits.attempt_count + 1 end
  returning window_started_at, attempt_count into v_window_started_at, v_attempt_count;
  return v_attempt_count <= 5;
end;
$$;

revoke all on function public.register_consultant(text, text, text, text, text, text, text) from public, anon, authenticated;
revoke all on function public.process_referral_commission(uuid) from public, anon, authenticated;
revoke all on function public.consume_referral_registration_rate_limit(text) from public, anon, authenticated;
grant execute on function public.register_consultant(text, text, text, text, text, text, text) to service_role;
grant execute on function public.process_referral_commission(uuid) to service_role;
grant execute on function public.consume_referral_registration_rate_limit(text) to service_role;

alter table public.consultants enable row level security;
alter table public.referral_trees enable row level security;
alter table public.referral_deals enable row level security;
alter table public.referral_commissions enable row level security;
alter table public.referral_registration_rate_limits enable row level security;
-- Browser access is deliberately denied; the Edge Function and admin processes use service_role.
