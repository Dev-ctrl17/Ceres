alter table public.properties
  add column if not exists previous_slugs text[] not null default '{}';

update public.properties
set
  previous_slugs = array_append(coalesce(previous_slugs, '{}'::text[]), slug),
  title = regexp_replace(title, 'EXQUIISITE', 'EXQUISITE', 'gi'),
  slug = 'exquisite-5-bedroom-fully-detached-smart-luxury-residence'
where id = 'bf938c73-07a2-40b1-9bc5-81306df422bf'
  and slug = 'exquiisite-5-bedroom-fully-detached-smart-luxury-residence';