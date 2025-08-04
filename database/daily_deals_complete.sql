-- Complete Daily Deals Table Setup
-- This file creates the daily_deals table with proper RLS policies

-- Create daily_deals table
CREATE TABLE IF NOT EXISTS daily_deals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  venue_id TEXT NOT NULL,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price TEXT,
  valid_until TIMESTAMP WITH TIME ZONE,
  media_urls TEXT[] DEFAULT '{}',
  is_verified BOOLEAN DEFAULT FALSE,
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_daily_deals_venue_id ON daily_deals(venue_id);
CREATE INDEX IF NOT EXISTS idx_daily_deals_user_id ON daily_deals(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_deals_created_at ON daily_deals(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_daily_deals_verified ON daily_deals(is_verified);

-- Enable Row Level Security (RLS)
ALTER TABLE daily_deals ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view verified deals" ON daily_deals;
DROP POLICY IF EXISTS "Users can create deals" ON daily_deals;
DROP POLICY IF EXISTS "Users can update own deals" ON daily_deals;
DROP POLICY IF EXISTS "Users can delete own deals" ON daily_deals;
DROP POLICY IF EXISTS "Users can view own deals" ON daily_deals;

-- Create RLS policies that work with Supabase auth
-- Allow users to view all verified deals
CREATE POLICY "Users can view verified deals" ON daily_deals
  FOR SELECT USING (is_verified = true);

-- Allow authenticated users to create deals
CREATE POLICY "Users can create deals" ON daily_deals
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Allow users to update their own deals
CREATE POLICY "Users can update own deals" ON daily_deals
  FOR UPDATE USING (auth.uid() = user_id);

-- Allow users to delete their own deals
CREATE POLICY "Users can delete own deals" ON daily_deals
  FOR DELETE USING (auth.uid() = user_id);

-- Allow users to view their own deals (even if not verified)
CREATE POLICY "Users can view own deals" ON daily_deals
  FOR SELECT USING (auth.uid() = user_id);

-- Grant necessary permissions to authenticated users
GRANT ALL ON daily_deals TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_daily_deals_updated_at 
  BEFORE UPDATE ON daily_deals 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to handle voting (prevent duplicate votes)
CREATE OR REPLACE FUNCTION vote_on_deal(
  deal_id UUID,
  vote_type TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
  IF vote_type = 'up' THEN
    UPDATE daily_deals 
    SET upvotes = upvotes + 1 
    WHERE id = deal_id;
  ELSIF vote_type = 'down' THEN
    UPDATE daily_deals 
    SET downvotes = downvotes + 1 
    WHERE id = deal_id;
  END IF;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Add some helpful comments for future reference
COMMENT ON TABLE daily_deals IS 'Stores user-generated daily deals for venues';
COMMENT ON COLUMN daily_deals.venue_id IS 'References the venue this deal is for';
COMMENT ON COLUMN daily_deals.user_id IS 'References the user who created this deal';
COMMENT ON COLUMN daily_deals.is_verified IS 'Whether this deal has been verified by moderators';
COMMENT ON COLUMN daily_deals.media_urls IS 'Array of photo URLs for deal verification'; 