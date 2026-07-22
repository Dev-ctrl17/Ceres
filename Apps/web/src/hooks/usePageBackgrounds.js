import { useState, useEffect, useCallback } from "react";
import supabase from "@/lib/supabaseClient";

// Simple in-memory cache so every page/section using this hook shares one
// fetch per browser session instead of each hero section querying separately.
let cache = null;
let inFlight = null;

async function loadBackgrounds() {
  if (cache) return cache;
  if (inFlight) return inFlight;

  inFlight = (async () => {
    const { data, error } = await supabase
      .from("page_backgrounds")
      .select("section_key, image_url");

    const map = {};
    if (!error && data) {
      data.forEach((row) => {
        if (row.image_url) map[row.section_key] = row.image_url;
      });
    }
    cache = map;
    inFlight = null;
    return map;
  })();

  return inFlight;
}

/**
 * usePageBackgrounds
 *
 * Fetches admin-configured background image overrides from the
 * `page_backgrounds` table. Use `getBackground(sectionKey, fallbackUrl)`
 * in place of a hardcoded image src — it returns the admin-uploaded
 * image if one exists for that section, otherwise your fallback.
 *
 * Example:
 *   const { getBackground } = usePageBackgrounds();
 *   <img src={getBackground('about_hero', '/default-about-hero.jpg')} />
 */
export function usePageBackgrounds() {
  const [backgrounds, setBackgrounds] = useState(cache || {});
  const [loading, setLoading] = useState(!cache);

  useEffect(() => {
    let active = true;
    if (cache) {
      setBackgrounds(cache);
      setLoading(false);
      return;
    }
    loadBackgrounds().then((map) => {
      if (active) {
        setBackgrounds(map);
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const getBackground = useCallback(
    (sectionKey, fallbackUrl) => backgrounds[sectionKey] || fallbackUrl,
    [backgrounds]
  );

  return { backgrounds, getBackground, loading };
}

export default usePageBackgrounds;
