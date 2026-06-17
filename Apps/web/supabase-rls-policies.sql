-- ============================================================
-- SUPABASE ROW LEVEL SECURITY (RLS) POLICIES
-- Run this entire script in Supabase SQL Editor
-- ============================================================

-- ============================================================
-- 1. PROPERTIES TABLE
-- ============================================================
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

-- Anyone can read properties (public listings)
DROP POLICY IF EXISTS "Public can view properties" ON properties;
CREATE POLICY "Public can view properties" ON properties
  FOR SELECT USING (true);

-- Authenticated users (admin) can insert properties
DROP POLICY IF EXISTS "Authenticated users can insert properties" ON properties;
CREATE POLICY "Authenticated users can insert properties" ON properties
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Authenticated users (admin) can update properties
DROP POLICY IF EXISTS "Authenticated users can update properties" ON properties;
CREATE POLICY "Authenticated users can update properties" ON properties
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Authenticated users (admin) can delete properties
DROP POLICY IF EXISTS "Authenticated users can delete properties" ON properties;
CREATE POLICY "Authenticated users can delete properties" ON properties
  FOR DELETE USING (auth.role() = 'authenticated');

-- ============================================================
-- 2. AGENTS TABLE
-- ============================================================
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view agents" ON agents;
CREATE POLICY "Public can view agents" ON agents
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert agents" ON agents;
CREATE POLICY "Authenticated users can insert agents" ON agents
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can update agents" ON agents;
CREATE POLICY "Authenticated users can update agents" ON agents
  FOR UPDATE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can delete agents" ON agents;
CREATE POLICY "Authenticated users can delete agents" ON agents
  FOR DELETE USING (auth.role() = 'authenticated');

-- ============================================================
-- 3. BLOG POSTS TABLE
-- ============================================================
ALTER TABLE blogPosts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view blog posts" ON blogPosts;
CREATE POLICY "Public can view blog posts" ON blogPosts
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert blog posts" ON blogPosts;
CREATE POLICY "Authenticated users can insert blog posts" ON blogPosts
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can update blog posts" ON blogPosts;
CREATE POLICY "Authenticated users can update blog posts" ON blogPosts
  FOR UPDATE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can delete blog posts" ON blogPosts;
CREATE POLICY "Authenticated users can delete blog posts" ON blogPosts
  FOR DELETE USING (auth.role() = 'authenticated');

-- ============================================================
-- 4. LEADS TABLE
-- ============================================================
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view leads" ON leads;
CREATE POLICY "Public can view leads" ON leads
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can insert leads" ON leads;
CREATE POLICY "Anyone can insert leads" ON leads
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can delete leads" ON leads;
CREATE POLICY "Authenticated users can delete leads" ON leads
  FOR DELETE USING (auth.role() = 'authenticated');

-- ============================================================
-- 5. TESTIMONIALS TABLE
-- ============================================================
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view testimonials" ON testimonials;
CREATE POLICY "Public can view testimonials" ON testimonials
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert testimonials" ON testimonials;
CREATE POLICY "Authenticated users can insert testimonials" ON testimonials
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can update testimonials" ON testimonials;
CREATE POLICY "Authenticated users can update testimonials" ON testimonials
  FOR UPDATE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can delete testimonials" ON testimonials;
CREATE POLICY "Authenticated users can delete testimonials" ON testimonials
  FOR DELETE USING (auth.role() = 'authenticated');

-- ============================================================
-- 6. REVIEWS TABLE
-- ============================================================
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view reviews" ON reviews;
CREATE POLICY "Public can view reviews" ON reviews
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert reviews" ON reviews;
CREATE POLICY "Authenticated users can insert reviews" ON reviews
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can update reviews" ON reviews;
CREATE POLICY "Authenticated users can update reviews" ON reviews
  FOR UPDATE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can delete reviews" ON reviews;
CREATE POLICY "Authenticated users can delete reviews" ON reviews
  FOR DELETE USING (auth.role() = 'authenticated');

-- ============================================================
-- 7. NEWSLETTER TABLE
-- ============================================================
ALTER TABLE newsletter ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view newsletter" ON newsletter;
CREATE POLICY "Authenticated users can view newsletter" ON newsletter
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Anyone can subscribe to newsletter" ON newsletter;
CREATE POLICY "Anyone can subscribe to newsletter" ON newsletter
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can delete newsletter" ON newsletter;
CREATE POLICY "Authenticated users can delete newsletter" ON newsletter
  FOR DELETE USING (auth.role() = 'authenticated');

-- ============================================================
-- 8. PROPERTY SUBMISSIONS TABLE (from Sell Page form)
-- ============================================================
ALTER TABLE propertySubmissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view submissions" ON propertySubmissions;
CREATE POLICY "Authenticated users can view submissions" ON propertySubmissions
  FOR SELECT USING (auth.role() = 'authenticated');

-- Anyone can submit their property via the Sell page
DROP POLICY IF EXISTS "Anyone can submit a property" ON propertySubmissions;
CREATE POLICY "Anyone can submit a property" ON propertySubmissions
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can delete submissions" ON propertySubmissions;
CREATE POLICY "Authenticated users can delete submissions" ON propertySubmissions
  FOR DELETE USING (auth.role() = 'authenticated');

-- ============================================================
-- 9. TEAM MEMBERS TABLE (if it exists)
-- ============================================================
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'team') THEN
    ALTER TABLE team ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Public can view team" ON team;
    CREATE POLICY "Public can view team" ON team
      FOR SELECT USING (true);

    DROP POLICY IF EXISTS "Authenticated users can insert team" ON team;
    CREATE POLICY "Authenticated users can insert team" ON team
      FOR INSERT WITH CHECK (auth.role() = 'authenticated');

    DROP POLICY IF EXISTS "Authenticated users can update team" ON team;
    CREATE POLICY "Authenticated users can update team" ON team
      FOR UPDATE USING (auth.role() = 'authenticated');

    DROP POLICY IF EXISTS "Authenticated users can delete team" ON team;
    CREATE POLICY "Authenticated users can delete team" ON team
      FOR DELETE USING (auth.role() = 'authenticated');
  END IF;
END $$;

-- ============================================================
-- VERIFY: List all active RLS policies
-- ============================================================
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
ORDER BY tablename, policyname;