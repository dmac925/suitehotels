-- Add amenity columns to the hotels table
ALTER TABLE hotels 
ADD COLUMN IF NOT EXISTS wellness_amenities JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS dining_amenities JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS services_amenities JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS unique_points JSONB DEFAULT '[]';

-- Create indexes for better query performance on JSONB columns
CREATE INDEX IF NOT EXISTS idx_hotels_wellness_amenities ON hotels USING gin (wellness_amenities);
CREATE INDEX IF NOT EXISTS idx_hotels_dining_amenities ON hotels USING gin (dining_amenities);
CREATE INDEX IF NOT EXISTS idx_hotels_services_amenities ON hotels USING gin (services_amenities);
CREATE INDEX IF NOT EXISTS idx_hotels_unique_points ON hotels USING gin (unique_points);