-- Normalize public property slugs after reviewing the old -> new mapping.
-- Run this migration once in the Supabase SQL editor.
-- The Vercel redirects preserve the old URLs during rollout.

update public.properties
set slug = 'long-lease-investment-opportunity'
where id = '88482ba1-7540-4e82-96e4-a8b0bf2c753c';

update public.properties
set slug = 'governors-consent-2'
where id = '3436a13b-ff72-4798-b2b8-46a7404cd939';

update public.properties
set slug = 'governors-consent-approved-building-plan'
where id = '4b6addaf-7a46-40b9-b24e-6675c355d180';

update public.properties
set slug = 'governors-consent-approved-building-plan-2'
where id = 'f99d5f2a-6bd4-4c3b-9dbb-93d24f9b35c3';

update public.properties
set slug = 'governors-consent-approved-building-plan-3'
where id = '8d1ffc37-6eda-44b0-a10a-1f2e56c413ef';

update public.properties
set slug = 'governors-consent-approved-building-plan-4'
where id = '3da8f7a7-1e93-4bea-86fc-701bb7ad51dd';