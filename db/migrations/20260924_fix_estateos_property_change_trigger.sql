-- Fix the EstateOS property-change trigger before running slug updates.
-- Run this once in the Supabase SQL Editor, then rerun
-- 20260924_normalize_property_slugs.sql.

create or replace function public.estateos_log_property_change()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
declare
  change_type text;
  old_images jsonb;
  new_images jsonb;
begin
  if tg_op = 'INSERT' then
    change_type := 'created';
    insert into public.estateos_property_changes
      (property_id, change_type, new_status, new_price, changed_at)
    values (new.id, change_type, new.status, new.price, now());

  elsif tg_op = 'DELETE' then
    insert into public.estateos_property_changes
      (property_id, change_type, old_status, old_price, changed_at)
    values (old.id, 'deleted', old.status, old.price, now());

  elsif tg_op = 'UPDATE' then
    if old.status is distinct from new.status then
      change_type := case
        when upper(new.status) in ('SOLD', 'SOLD OUT') then 'sold'
        when upper(new.status) in ('RENTED', 'LEASED') then 'rented'
        else 'status_changed'
      end;
      insert into public.estateos_property_changes
        (property_id, change_type, old_status, new_status, old_price, new_price, changed_at)
      values (new.id, change_type, old.status, new.status, old.price, new.price, now());
    end if;

    if old.price is distinct from new.price then
      insert into public.estateos_property_changes
        (property_id, change_type, old_status, new_status, old_price, new_price, changed_at)
      values (new.id, 'price_changed', old.status, new.status, old.price, new.price, now());
    end if;

    old_images := coalesce(old.images, '[]'::jsonb);
    new_images := coalesce(new.images, '[]'::jsonb);
    if old_images is distinct from new_images then
      insert into public.estateos_property_changes
        (property_id, change_type, old_status, new_status, old_price, new_price, changed_at)
      values (new.id, 'media_changed', old.status, new.status, old.price, new.price, now());
    end if;

    if not exists (
      select 1
      from public.estateos_property_changes as changes
      where changes.property_id = new.id
        and changes.changed_at > now() - interval '1 second'
        and changes.change_type in ('created', 'price_changed', 'media_changed', 'sold', 'rented', 'status_changed')
    ) then
      insert into public.estateos_property_changes
        (property_id, change_type, old_status, new_status, old_price, new_price, changed_at)
      values (new.id, 'updated', old.status, new.status, old.price, new.price, now());
    end if;
  end if;

  return coalesce(new, old);
end;
$$;