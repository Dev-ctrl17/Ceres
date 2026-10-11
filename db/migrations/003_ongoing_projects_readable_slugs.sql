ALTER TABLE public.ongoing_projects
  ADD COLUMN IF NOT EXISTS slug TEXT;

UPDATE public.ongoing_projects
SET slug = COALESCE(
  NULLIF(
    trim(both '-' FROM regexp_replace(lower(name), '[^a-z0-9]+', '-', 'g')),
    ''
  ),
  'ongoing-project'
) || '-' || right(replace(id::text, '-', ''), 8)
WHERE slug IS NULL OR btrim(slug) = '';

CREATE UNIQUE INDEX IF NOT EXISTS ongoing_projects_slug_unique
  ON public.ongoing_projects (slug);

CREATE OR REPLACE FUNCTION public.set_ongoing_project_slug()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  base_slug TEXT;
BEGIN
  IF NEW.slug IS NULL OR btrim(NEW.slug) = '' THEN
    base_slug := trim(both '-' FROM regexp_replace(lower(COALESCE(NEW.name, '')), '[^a-z0-9]+', '-', 'g'));
    NEW.slug := COALESCE(NULLIF(base_slug, ''), 'ongoing-project')
      || '-' || right(replace(NEW.id::text, '-', ''), 8);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_ongoing_project_slug ON public.ongoing_projects;
CREATE TRIGGER set_ongoing_project_slug
  BEFORE INSERT ON public.ongoing_projects
  FOR EACH ROW
  EXECUTE FUNCTION public.set_ongoing_project_slug();
