-- Allow the branded SVG fallback in the existing property-images bucket.
-- This does not change the bucket's public setting or object policies.
update storage.buckets
set allowed_mime_types = case
  when allowed_mime_types is null then null
  else array(
    select distinct mime_type
    from unnest(allowed_mime_types || array['image/svg+xml']::text[]) as allowed(mime_type)
  )
end
where id = 'property-images';
