-- ============================================================================
-- MULTI-TIER REFERRAL & CONSULTANT ONBOARDING SYSTEM
-- Supabase / PostgreSQL Schema
-- Run this in the Supabase SQL Editor (or via `supabase db push`)
--
-- This schema implements a 4-generation referral tree using the
-- CLOSURE TABLE pattern. A closure table stores every ancestor→descendant
-- relationship (including self at depth 0), which makes multi-level
-- queries (e.g. "who are all uplines of user X up to 4 generations?")
-- a single indexed JOIN instead of a recursive CTE.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- EXTENSIONS
-- ----------------------------------------------------------------------------
create extension if not exists "pgcrypto";  -- provides gen_random_uuid()

-- ============================================================================
-- 1. USERS TABLE
--    Stores consultant/agent profiles and the direct parent (upline) link.
-- ============================================================================
create table if not exists public.users (
  id              uuid primary key default gen_random_uuid(),
  full_name       text not null,
  email           text not null unique,
  phone_number    text not null unique,
  bank_name       text,
  account_number  text,
  account_name    text,
  referral_code   text not null unique,
  parent_id       uuid references public.users(id) on delete set null,
  created_at      timestamptz not null default now()
);

-- Index for fast lookup of a user by their referral code (used during signup)
create index if not exists idx_users_referral_code on public.users(referral_code);

-- Index for fast lookup of direct children of a user
create index if not exists idx_users_parent_id on public.users(parent_id);

-- ============================================================================
-- 2. REFERRAL_TREES (CLOSURE TABLE)
--    ancestor_id  → the upline user
--    descendant_id→ the downline user
--    depth        → 0 = self, 1 = direct parent, 2 = grandparent, etc.
--
--    WHY CLOSURE TABLE?
--    - Querying "all uplines of user X up to depth 4" is a single indexed
--      SELECT on (descendant_id, depth) — no recursive CTE needed.
--    - Querying "all downlines of user X" is a single indexed SELECT on
--      (ancestor_id).
--    - Inserting a new user requires copying the parent's ancestor rows
--      (plus self + direct parent), which is O(depth) — very cheap.
-- ============================================================================
create table if not exists public.referral_trees (
  ancestor_id    uuid not null references public.users(id) on delete cascade,
  descendant_id  uuid not null references public.users(id) on delete cascade,
  depth          int  not null check (depth between 0 and 4),
  primary key (ancestor_id, descendant_id)
);

-- Composite index to make "find all ancestors of X up to depth 4" fast
create index if not exists idx_referral_trees_descendant
  on public.referral_trees(descendant_id, depth);

-- Composite index to make "find all descendants of X" fast
create index if not exists idx_referral_trees_ancestor
  on public.referral_trees(ancestor_id, depth);

-- ============================================================================
-- 3. DEALS TABLE
--    A completed property deal that triggers commission distribution.
-- ============================================================================
create table if not exists public.deals (
  id               uuid primary key default gen_random_uuid(),
  property_name    text not null,
  deal_amount      numeric(14,2) not null check (deal_amount >= 0),
  closing_user_id  uuid not null references public.users(id) on delete restrict,
  status           text not null default 'pending'
                   check (status in ('pending', 'verified', 'paid')),
  created_at       timestamptz not null default now()
);

create index if not exists idx_deals_closing_user on public.deals(closing_user_id);

-- ============================================================================
-- 4. COMMISSIONS TABLE
--    One row per (deal, upline) pair representing the commission owed.
-- ============================================================================
create table if not exists public.commissions (
  id                uuid primary key default gen_random_uuid(),
  deal_id           uuid not null references public.deals(id) on delete cascade,
  user_id           uuid not null references public.users(id) on delete cascade,
  generation_level  int  not null check (generation_level between 1 and 4),
  amount            numeric(14,2) not null check (amount >= 0),
  status            text not null default 'pending'
                    check (status in ('pending', 'disbursed')),
  created_at        timestamptz not null default now(),
  unique (deal_id, user_id)  -- prevent duplicate commission rows per deal/user
);

create index if not exists idx_commissions_user on public.commissions(user_id);
create index if not exists idx_commissions_deal on public.commissions(deal_id);

-- ============================================================================
-- 5. RPC FUNCTION: register_consultant
--    Atomically inserts a new user AND populates the closure table.
--
--    CLOSURE TABLE INSERT LOGIC (4-generation limit):
--    For a new user U with parent P:
--      1. Insert (U, U, 0)                      → self record
--      2. Insert (P, U, 1)                      → direct parent
--      3. For each ancestor A of P at depth d
--         (i.e. rows where descendant_id = P):
--           Insert (A, U, d+1)  where d+1 <= 4 → grandparent, great-grandparent, etc.
--
--    This is done in a single transaction so the user row and tree rows
--    are always consistent.
-- ============================================================================
create or replace function public.register_consultant(
  p_full_name      text,
  p_email          text,
  p_phone_number   text,
  p_bank_name      text,
  p_account_number text,
  p_account_name   text,
  p_ref_code       text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_parent_id   uuid;
  v_new_user_id uuid;
  v_referral_code text;
begin
  -- --------------------------------------------------------------------------
  -- 1. Validate uniqueness of email & phone (defensive; unique constraints
  --    also enforce this, but we return a friendly error message).
  -- --------------------------------------------------------------------------
  if exists (select 1 from public.users where email = p_email) then
    raise exception 'EMAIL_TAKEN';
  end if;

  if exists (select 1 from public.users where phone_number = p_phone_number) then
    raise exception 'PHONE_TAKEN';
  end if;

  -- --------------------------------------------------------------------------
  -- 2. Resolve the parent from the referral code (if provided).
  -- --------------------------------------------------------------------------
  if p_ref_code is not null and p_ref_code <> '' then
    select id into v_parent_id
    from public.users
    where referral_code = upper(trim(p_ref_code));

    if v_parent_id is null then
      raise exception 'INVALID_REF_CODE';
    end if;
  end if;

  -- --------------------------------------------------------------------------
  -- 3. Generate a unique 8-character referral code.
  --    Loop until we find one that doesn't collide (extremely unlikely).
  -- --------------------------------------------------------------------------
  loop
    v_referral_code := upper(substr(md5(random()::text || clock_timestamp()::text), 1, 8));
    exit when not exists (
      select 1 from public.users where referral_code = v_referral_code
    );
  end loop;

  -- --------------------------------------------------------------------------
  -- 4. Insert the new user.
  -- --------------------------------------------------------------------------
  insert into public.users (
    full_name, email, phone_number, bank_name, account_number,
    account_name, referral_code, parent_id
  ) values (
    p_full_name, lower(trim(p_email)), p_phone_number, p_bank_name,
    p_account_number, p_account_name, v_referral_code, v_parent_id
  )
  returning id into v_new_user_id;

  -- --------------------------------------------------------------------------
  -- 5. Populate the closure table.
  --    a) Self record (depth 0)
  --    b) Direct parent (depth 1) — if a parent exists
  --    c) Parent's ancestors up to depth 4 (grandparent = depth 2, etc.)
  -- --------------------------------------------------------------------------
  insert into public.referral_trees (ancestor_id, descendant_id, depth)
  values (v_new_user_id, v_new_user_id, 0);

  if v_parent_id is not null then
    -- Direct parent relationship
    insert into public.referral_trees (ancestor_id, descendant_id, depth)
    values (v_parent_id, v_new_user_id, 1);

    -- Copy the parent's ancestors, incrementing depth by 1, capped at 4.
    -- Example: if parent P has ancestor G at depth 2 (G is P's grandparent),
    -- then G is the new user's great-grandparent at depth 3.
    insert into public.referral_trees (ancestor_id, descendant_id, depth)
    select ancestor_id, v_new_user_id, depth + 1
    from public.referral_trees
    where descendant_id = v_parent_id
      and depth + 1 <= 4;   -- enforce the 4-generation cap
  end if;

  return v_new_user_id;
end;
$$;

-- ============================================================================
-- 6. RPC FUNCTION: process_deal_commission
--    Given a deal and the total commission pool, distributes commission
--    to the closer (depth 1) and up to 3 uplines (depths 2–4).
--
--    BREAKDOWN:
--      Depth 1 (Direct Agent/Closer): 50%
--      Depth 2 (2nd Gen Upline):      20%
--      Depth 3 (3rd Gen Upline):      15%
--      Depth 4 (4th Gen Upline):      15%
--    Total: 100%
-- ============================================================================
create or replace function public.process_deal_commission(
  p_deal_id              uuid,
  p_total_commission_pool numeric
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_closing_user_id uuid;
  v_commission numeric;
begin
  -- --------------------------------------------------------------------------
  -- 1. Fetch the closing user for this deal.
  -- --------------------------------------------------------------------------
  select closing_user_id into v_closing_user_id
  from public.deals
  where id = p_deal_id;

  if v_closing_user_id is null then
    raise exception 'DEAL_NOT_FOUND';
  end if;

  -- --------------------------------------------------------------------------
  -- 2. Insert commission rows for each eligible upline (depth 1–4).
  --    We query the closure table for all ancestors of the closer where
  --    depth is between 1 and 4. Depth 1 = the closer themselves
  --    (self-record is depth 0, so the direct parent is depth 1).
  --
  --    NOTE: The closer is the "descendant" in the closure table. Their
  --    ancestors (uplines) are the rows where descendant_id = closer.
  -- --------------------------------------------------------------------------
  insert into public.commissions (deal_id, user_id, generation_level, amount, status)
  select
    p_deal_id,
    rt.ancestor_id,
    rt.depth,
    case rt.depth
      when 1 then round(p_total_commission_pool * 0.50, 2)  -- Direct Agent/Closer
      when 2 then round(p_total_commission_pool * 0.20, 2)  -- 2nd Gen Upline
      when 3 then round(p_total_commission_pool * 0.15, 2)  -- 3rd Gen Upline
      when 4 then round(p_total_commission_pool * 0.15, 2)  -- 4th Gen Upline
    end,
    'pending'
  from public.referral_trees rt
  where rt.descendant_id = v_closing_user_id
    and rt.depth between 1 and 4;

  -- --------------------------------------------------------------------------
  -- 3. Mark the deal as 'verified' (commission rows created).
  -- --------------------------------------------------------------------------
  update public.deals
  set status = 'verified'
  where id = p_deal_id;
end;
$$;

-- ============================================================================
-- 7. ROW LEVEL SECURITY (RLS)
--    Production best practice: enable RLS and grant only what's needed.
--    Adjust policies to match your auth model (e.g. service_role bypasses RLS).
-- ============================================================================
alter table public.users          enable row level security;
alter table public.referral_trees enable row level security;
alter table public.deals          enable row level security;
alter table public.commissions    enable row level security;

-- Users can read their own profile
create policy "users_read_own" on public.users
  for select using (auth.uid() = id);

-- Users can update their own profile
create policy "users_update_own" on public.users
  for update using (auth.uid() = id);

-- Referral tree is readable by authenticated users (needed for commission calc)
create policy "referral_trees_read_authenticated" on public.referral_trees
  for select using (auth.role() = 'authenticated');

-- Deals readable by authenticated users
create policy "deals_read_authenticated" on public.deals
  for select using (auth.role() = 'authenticated');

-- Commissions readable by the owning user
create policy "commissions_read_own" on public.commissions
  for select using (auth.uid() = user_id);

-- ============================================================================
-- 8. SAMPLE DATA (optional — comment out in production)
-- ============================================================================
-- -- Create a root user (no parent) to seed the tree
-- select public.register_consultant(
--   'Root Agent', 'root@example.com', '+2348000000001',
--   'GTBank', '0123456789', 'Root Agent', null
-- );