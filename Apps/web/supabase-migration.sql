-- ============================================================
-- SUPABASE MIGRATION for Luxury Properties Ltd
-- ============================================================

-- 1. Properties Table (matching your existing columns)
CREATE TABLE IF NOT EXISTS properties (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC,
  location TEXT,
  image_url TEXT,
  status TEXT DEFAULT 'Available',
  is_featured BOOLEAN DEFAULT false,
  bedrooms INTEGER,
  bathrooms INTEGER,
  property_type TEXT,
  area_sqft NUMERIC,
  address TEXT,
  
  -- Additional columns our code uses
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  propertyStatus TEXT DEFAULT 'For Sale',
  currency TEXT DEFAULT 'NGN',
  streetAddress TEXT,
  city TEXT,
  state TEXT,
  country TEXT DEFAULT 'Nigeria',
  postalCode TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  squareFootage NUMERIC,
  areaUnit TEXT DEFAULT 'sqm',
  yearBuilt INTEGER,
  amenities JSONB DEFAULT '[]'::jsonb,
  contactPhone TEXT,
  contactEmail TEXT,
  isVerified BOOLEAN DEFAULT false,
  virtualTourUrl TEXT,
  agentId UUID,
  images JSONB DEFAULT '[]'::jsonb,
  videos JSONB DEFAULT '[]'::jsonb
);

-- 2. Agents Table
CREATE TABLE IF NOT EXISTS agents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  position TEXT,
  locations TEXT,
  propertiesAssigned INTEGER DEFAULT 0,
  bio TEXT,
  photo TEXT,
  rating NUMERIC DEFAULT 0,
  specialization TEXT,
  listingsCount INTEGER DEFAULT 0,
  image TEXT
);

-- 3. Blog Posts Table
CREATE TABLE IF NOT EXISTS blogPosts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  title TEXT NOT NULL,
  content TEXT,
  category TEXT,
  publishDate TIMESTAMPTZ DEFAULT NOW(),
  author TEXT,
  image TEXT,
  slug TEXT UNIQUE
);

-- 4. Property Submissions
CREATE TABLE IF NOT EXISTS propertySubmissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC,
  location TEXT,
  propertyType TEXT,
  ownerName TEXT,
  ownerEmail TEXT,
  ownerPhone TEXT,
  status TEXT DEFAULT 'Pending',
  images JSONB DEFAULT '[]'::jsonb
);

-- 5. Leads (Contact form inquiries)
CREATE TABLE IF NOT EXISTS leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT,
  propertyInterest TEXT DEFAULT '',
  leadType TEXT DEFAULT 'Contact Form',
  isContacted BOOLEAN DEFAULT false
);

-- 6. Reviews
CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  text TEXT,
  image_url TEXT
);

-- 7. Testimonials
CREATE TABLE IF NOT EXISTS testimonials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  clientName TEXT NOT NULL,
  clientPhoto TEXT,
  testimonialText TEXT NOT NULL,
  rating INTEGER DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  serviceType TEXT,
  name TEXT NOT NULL,
  role TEXT,
  text TEXT,
  image_url TEXT
);

-- 8. Newsletter Subscribers
CREATE TABLE IF NOT EXISTS newsletter (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  email TEXT UNIQUE NOT NULL
);

-- 9. Team Members (for About page)
CREATE TABLE IF NOT EXISTS teamMembers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  name TEXT NOT NULL,
  position TEXT,
  photo TEXT,
  bio TEXT
);

-- 10. Profiles (Extended user data)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'admin'
);

-- Enable Row Level Security
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE blogPosts ENABLE ROW LEVEL SECURITY;
ALTER TABLE propertySubmissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter ENABLE ROW LEVEL SECURITY;
ALTER TABLE teamMembers ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate
DROP POLICY IF EXISTS "Public can read properties" ON properties;
DROP POLICY IF EXISTS "Public can read agents" ON agents;
DROP POLICY IF EXISTS "Public can read blog posts" ON blogPosts;
DROP POLICY IF EXISTS "Public can read testimonials" ON testimonials;
DROP POLICY IF EXISTS "Public can read reviews" ON reviews;
DROP POLICY IF EXISTS "Public can insert leads" ON leads;
DROP POLICY IF EXISTS "Public can insert newsletter" ON newsletter;
DROP POLICY IF EXISTS "Public can insert property submissions" ON propertySubmissions;
DROP POLICY IF EXISTS "Admins can CRUD properties" ON properties;
DROP POLICY IF EXISTS "Admins can CRUD agents" ON agents;
DROP POLICY IF EXISTS "Admins can CRUD blog posts" ON blogPosts;
DROP POLICY IF EXISTS "Admins can CRUD testimonials" ON testimonials;
DROP POLICY IF EXISTS "Admins can CRUD reviews" ON reviews;
DROP POLICY IF EXISTS "Admins can read leads" ON leads;
DROP POLICY IF EXISTS "Admins can read newsletter" ON newsletter;
DROP POLICY IF EXISTS "Public can read team members" ON teamMembers;
DROP POLICY IF EXISTS "Admins can CRUD team members" ON teamMembers;

-- Public access policies
CREATE POLICY "Public can read properties" ON properties FOR SELECT USING (true);
CREATE POLICY "Public can read agents" ON agents FOR SELECT USING (true);
CREATE POLICY "Public can read blog posts" ON blogPosts FOR SELECT USING (true);
CREATE POLICY "Public can read testimonials" ON testimonials FOR SELECT USING (true);
CREATE POLICY "Public can read reviews" ON reviews FOR SELECT USING (true);
CREATE POLICY "Public can read team members" ON teamMembers FOR SELECT USING (true);
CREATE POLICY "Public can insert leads" ON leads FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can insert newsletter" ON newsletter FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can insert property submissions" ON propertySubmissions FOR INSERT WITH CHECK (true);

-- Admin policies (authenticated users)
CREATE POLICY "Admins can CRUD properties" ON properties FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can CRUD agents" ON agents FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can CRUD blog posts" ON blogPosts FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can CRUD testimonials" ON testimonials FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can CRUD reviews" ON reviews FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can CRUD team members" ON teamMembers FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can read leads" ON leads FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can read newsletter" ON newsletter FOR SELECT USING (auth.role() = 'authenticated');

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'avatar_url');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();