-- Website Visitor Tracker Database Schema
-- Run this SQL in your Supabase SQL Editor

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Visitors table
CREATE TABLE IF NOT EXISTS visitors (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    session_id TEXT UNIQUE NOT NULL,
    ip_address TEXT NOT NULL,
    country TEXT,
    city TEXT,
    device_type TEXT,
    browser TEXT,
    os TEXT,
    referrer TEXT,
    landing_page TEXT NOT NULL,
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    first_visit TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_visit TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    visit_count INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Page views table
CREATE TABLE IF NOT EXISTS page_views (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    visitor_id UUID REFERENCES visitors(id) ON DELETE CASCADE,
    session_id TEXT NOT NULL,
    page_url TEXT NOT NULL,
    page_title TEXT,
    referrer TEXT,
    time_on_page INTEGER,
    is_bounce BOOLEAN DEFAULT FALSE,
    exit_page BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Live visitors table
CREATE TABLE IF NOT EXISTS live_visitors (
    session_id TEXT PRIMARY KEY,
    visitor_id UUID REFERENCES visitors(id) ON DELETE CASCADE,
    current_page TEXT NOT NULL,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_visitors ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (for tracking)
CREATE POLICY "Allow public insert visitors" ON visitors FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert page_views" ON page_views FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert live_visitors" ON live_visitors FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update live_visitors" ON live_visitors FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow public delete live_visitors" ON live_visitors FOR DELETE USING (true);

-- Only authenticated users can read
CREATE POLICY "Allow auth read visitors" ON visitors FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow auth read page_views" ON page_views FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow auth read live_visitors" ON live_visitors FOR SELECT USING (auth.role() = 'authenticated');

-- Grant access
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON visitors TO anon, authenticated;
GRANT ALL ON page_views TO anon, authenticated;
GRANT ALL ON live_visitors TO anon, authenticated;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_visitors_session_id ON visitors(session_id);
CREATE INDEX IF NOT EXISTS idx_visitors_created_at ON visitors(created_at);
CREATE INDEX IF NOT EXISTS idx_visitors_country ON visitors(country);
CREATE INDEX IF NOT EXISTS idx_page_views_visitor_id ON page_views(visitor_id);
CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON page_views(created_at);
CREATE INDEX IF NOT EXISTS idx_live_visitors_last_activity ON live_visitors(last_activity);


