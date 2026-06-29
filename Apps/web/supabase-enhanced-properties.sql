-- Enhanced Properties Table Schema
-- Run this SQL in your Supabase SQL Editor to add missing fields

-- Add new columns to properties table
ALTER TABLE properties ADD COLUMN IF NOT EXISTS property_type TEXT;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS bedrooms INTEGER;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS bathrooms INTEGER;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS area_sqm DECIMAL(10,2);
ALTER TABLE properties ADD COLUMN IF NOT EXISTS tenure TEXT CHECK (tenure IN ('freehold', 'leasehold', 'customary'));
ALTER TABLE properties ADD COLUMN IF NOT EXISTS year_built INTEGER;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS latitude DECIMAL(10,8);
ALTER TABLE properties ADD COLUMN IF NOT EXISTS longitude DECIMAL(11,8);
ALTER TABLE properties ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS city TEXT DEFAULT 'Lagos';
ALTER TABLE properties ADD COLUMN IF NOT EXISTS state TEXT DEFAULT 'Lagos State';
ALTER TABLE properties ADD COLUMN IF NOT EXISTS amenities TEXT[]; -- Array of amenities
ALTER TABLE properties ADD COLUMN IF NOT EXISTS features TEXT[]; -- Array of features
ALTER TABLE properties ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS is_off_market BOOLEAN DEFAULT FALSE;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS video_tour_url TEXT;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS virtual_tour_url TEXT;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS floor_plan_url TEXT;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS document_urls TEXT[]; -- Array of document URLs
ALTER TABLE properties ADD COLUMN IF NOT EXISTS agent_id UUID REFERENCES auth.users(id);
ALTER TABLE properties ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS inquiry_count INTEGER DEFAULT 0;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS last_viewed_at TIMESTAMP WITH TIME ZONE;

-- Create indexes for better search performance
CREATE INDEX IF NOT EXISTS idx_properties_property_type ON properties(property_type);
CREATE INDEX IF NOT EXISTS idx_properties_price ON properties(price);
CREATE INDEX IF NOT EXISTS idx_properties_location ON properties(city, state);
CREATE INDEX IF NOT EXISTS idx_properties_bedrooms ON properties(bedrooms);
CREATE INDEX IF NOT EXISTS idx_properties_bathrooms ON properties(bathrooms);
CREATE INDEX IF NOT EXISTS idx_properties_is_verified ON properties(is_verified);
CREATE INDEX IF NOT EXISTS idx_properties_is_featured ON properties(is_featured);
CREATE INDEX IF NOT EXISTS idx_properties_created_at ON properties(created_at DESC);

-- Create property_images table if not exists (for multiple images per property)
CREATE TABLE IF NOT EXISTS property_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption TEXT,
  display_order INTEGER DEFAULT 0,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_property_images_property_id ON property_images(property_id);
CREATE INDEX IF NOT EXISTS idx_property_images_display_order ON property_images(property_id, display_order);

-- Enable RLS on property_images
ALTER TABLE property_images ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view images
CREATE POLICY "Public can view property images" ON property_images
  FOR SELECT USING (true);

-- Policy: Only authenticated users can insert images
CREATE POLICY "Authenticated users can insert property images" ON property_images
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Policy: Only authenticated users can update images
CREATE POLICY "Authenticated users can update property images" ON property_images
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Policy: Only authenticated users can delete images
CREATE POLICY "Authenticated users can delete property images" ON property_images
  FOR DELETE USING (auth.role() = 'authenticated');

-- Create property_inquiries table for viewing/booking requests
CREATE TABLE IF NOT EXISTS property_inquiries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  preferred_date DATE,
  preferred_time TIME,
  message TEXT,
  inquiry_type TEXT DEFAULT 'viewing' CHECK (inquiry_type IN ('viewing', 'booking', 'information')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  is_contacted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_property_inquiries_property_id ON property_inquiries(property_id);
CREATE INDEX IF NOT EXISTS idx_property_inquiries_status ON property_inquiries(status);
CREATE INDEX IF NOT EXISTS idx_property_inquiries_created_at ON property_inquiries(created_at DESC);

-- Enable RLS on property_inquiries
ALTER TABLE property_inquiries ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can create inquiries
CREATE POLICY "Anyone can create inquiries" ON property_inquiries
  FOR INSERT WITH CHECK (true);

-- Policy: Only authenticated users can view inquiries
CREATE POLICY "Authenticated users can view inquiries" ON property_inquiries
  FOR SELECT USING (auth.role() = 'authenticated');

-- Policy: Only authenticated users can update inquiries
CREATE POLICY "Authenticated users can update inquiries" ON property_inquiries
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for property_inquiries
CREATE TRIGGER update_property_inquiries_updated_at
  BEFORE UPDATE ON property_inquiries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to increment view count
CREATE OR REPLACE FUNCTION increment_property_view_count(property_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE properties 
  SET view_count = view_count + 1, last_viewed_at = NOW()
  WHERE id = property_id;
END;
$$ LANGUAGE plpgsql;

-- Create function to increment inquiry count
CREATE OR REPLACE FUNCTION increment_property_inquiry_count(property_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE properties 
  SET inquiry_count = inquiry_count + 1
  WHERE id = property_id;
END;
$$ LANGUAGE plpgsql;

-- Insert sample property types for reference
-- (You can manage these through the admin panel instead)
-- Property types: 'apartment', 'duplex', 'mansion', 'penthouse', 'townhouse', 'villa', 'land', 'commercial'

-- Sample data for testing (optional - remove in production)
-- INSERT INTO properties (title, description, price, property_type, bedrooms, bathrooms, area_sqm, location, city, state, tenure, is_verified, is_featured)
-- VALUES
--   ('Luxury 3-Bedroom Apartment in Lekki', 'Beautiful 3-bedroom apartment with modern amenities...', 85000000, 'apartment', 3, 3, 120, 'Lekki Phase 1', 'Lagos', 'Lagos State', 'leasehold', true, true),
--   ('5-Bedroom Duplex in Ikoyi', 'Stunning 5-bedroom duplex with pool...', 350000000, 'duplex', 5, 6, 450, 'Ikoyi', 'Lagos', 'Lagos State', 'freehold', true, true),
--   ('Waterfront Mansion on Banana Island', 'Exclusive waterfront mansion...', 2500000000, 'mansion', 7, 8, 1200, 'Banana Island', 'Lagos', 'Lagos State', 'freehold', true, true);