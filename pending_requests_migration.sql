-- Migration script to add location coordinates to pending_requests table
-- Run this script in your Supabase SQL editor

-- Add latitude and longitude columns to pending_requests table
ALTER TABLE pending_requests 
ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;

-- Add indexes for better performance on location-based queries
CREATE INDEX IF NOT EXISTS idx_pending_requests_latitude ON pending_requests(latitude);
CREATE INDEX IF NOT EXISTS idx_pending_requests_longitude ON pending_requests(longitude);
CREATE INDEX IF NOT EXISTS idx_pending_requests_location_coords ON pending_requests(latitude, longitude);

-- Add comments to document the new columns
COMMENT ON COLUMN pending_requests.latitude IS 'Provider location latitude coordinate for distance calculations';
COMMENT ON COLUMN pending_requests.longitude IS 'Provider location longitude coordinate for distance calculations';

-- Print success message
DO $$
BEGIN
    RAISE NOTICE 'Migration completed successfully!';
    RAISE NOTICE 'Added latitude and longitude columns to pending_requests table';
    RAISE NOTICE 'Added performance indexes for location queries';
END $$; 