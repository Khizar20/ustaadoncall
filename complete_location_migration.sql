-- Complete migration script to add location coordinates to both providers and pending_requests tables
-- Run this script in your Supabase SQL editor

-- =====================================================
-- UPDATE PROVIDERS TABLE
-- =====================================================

-- Add latitude and longitude columns to providers table
ALTER TABLE providers 
ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;

-- Add indexes for better performance on location-based queries
CREATE INDEX IF NOT EXISTS idx_providers_latitude ON providers(latitude);
CREATE INDEX IF NOT EXISTS idx_providers_longitude ON providers(longitude);
CREATE INDEX IF NOT EXISTS idx_providers_location_coords ON providers(latitude, longitude);

-- Add a composite index for location-based searches
CREATE INDEX IF NOT EXISTS idx_providers_location_search ON providers(is_verified, latitude, longitude);

-- =====================================================
-- UPDATE PENDING_REQUESTS TABLE
-- =====================================================

-- Add latitude and longitude columns to pending_requests table
ALTER TABLE pending_requests 
ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;

-- Add indexes for better performance on location-based queries
CREATE INDEX IF NOT EXISTS idx_pending_requests_latitude ON pending_requests(latitude);
CREATE INDEX IF NOT EXISTS idx_pending_requests_longitude ON pending_requests(longitude);
CREATE INDEX IF NOT EXISTS idx_pending_requests_location_coords ON pending_requests(latitude, longitude);

-- =====================================================
-- CREATE DISTANCE CALCULATION FUNCTION
-- =====================================================

-- Add a function to calculate distance between two points (Haversine formula)
CREATE OR REPLACE FUNCTION calculate_distance(
    lat1 DOUBLE PRECISION,
    lon1 DOUBLE PRECISION,
    lat2 DOUBLE PRECISION,
    lon2 DOUBLE PRECISION
) RETURNS DOUBLE PRECISION AS $$
BEGIN
    RETURN (
        6371 * acos(
            cos(radians(lat1)) * 
            cos(radians(lat2)) * 
            cos(radians(lon2) - radians(lon1)) + 
            sin(radians(lat1)) * 
            sin(radians(lat2))
        )
    );
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- CREATE LOCATION-BASED SEARCH FUNCTIONS
-- =====================================================

-- Add a function to find providers within a certain radius
CREATE OR REPLACE FUNCTION get_providers_within_radius(
    user_lat DOUBLE PRECISION,
    user_lon DOUBLE PRECISION,
    radius_km DOUBLE PRECISION DEFAULT 10.0
) RETURNS TABLE(
    id UUID,
    name TEXT,
    service_category TEXT,
    bio TEXT,
    experience TEXT,
    location TEXT,
    profile_image TEXT,
    is_verified BOOLEAN,
    rating DOUBLE PRECISION,
    reviews_count INTEGER,
    jobs_pricing JSONB,
    created_at TIMESTAMPTZ,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    distance DOUBLE PRECISION
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.name,
        p.service_category,
        p.bio,
        p.experience,
        p.location,
        p.profile_image,
        p.is_verified,
        p.rating,
        p.reviews_count,
        p.jobs_pricing,
        p.created_at,
        p.latitude,
        p.longitude,
        calculate_distance(user_lat, user_lon, p.latitude, p.longitude) as distance
    FROM providers p
    WHERE 
        p.is_verified = true 
        AND p.latitude IS NOT NULL 
        AND p.longitude IS NOT NULL
        AND calculate_distance(user_lat, user_lon, p.latitude, p.longitude) <= radius_km
    ORDER BY distance ASC;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- ADD COMMENTS AND DOCUMENTATION
-- =====================================================

-- Add comments to document the new columns
COMMENT ON COLUMN providers.latitude IS 'Provider location latitude coordinate for distance calculations';
COMMENT ON COLUMN providers.longitude IS 'Provider location longitude coordinate for distance calculations';
COMMENT ON COLUMN pending_requests.latitude IS 'Provider location latitude coordinate for distance calculations';
COMMENT ON COLUMN pending_requests.longitude IS 'Provider location longitude coordinate for distance calculations';

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Verify the migration was successful
DO $$
DECLARE
    providers_has_lat BOOLEAN;
    providers_has_lon BOOLEAN;
    pending_has_lat BOOLEAN;
    pending_has_lon BOOLEAN;
BEGIN
    -- Check if providers table has the new columns
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'providers' AND column_name = 'latitude'
    ) INTO providers_has_lat;
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'providers' AND column_name = 'longitude'
    ) INTO providers_has_lon;
    
    -- Check if pending_requests table has the new columns
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'pending_requests' AND column_name = 'latitude'
    ) INTO pending_has_lat;
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'pending_requests' AND column_name = 'longitude'
    ) INTO pending_has_lon;
    
    -- Print results
    RAISE NOTICE 'Migration Results:';
    RAISE NOTICE 'Providers table - latitude: %, longitude: %', providers_has_lat, providers_has_lon;
    RAISE NOTICE 'Pending_requests table - latitude: %, longitude: %', pending_has_lat, pending_has_lon;
    
    IF providers_has_lat AND providers_has_lon AND pending_has_lat AND pending_has_lon THEN
        RAISE NOTICE 'SUCCESS: All location columns added successfully!';
    ELSE
        RAISE NOTICE 'WARNING: Some columns may not have been added properly';
    END IF;
END $$;

-- Print final success message
DO $$
BEGIN
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'LOCATION MIGRATION COMPLETED SUCCESSFULLY!';
    RAISE NOTICE '=====================================================';
    RAISE NOTICE '✓ Added latitude and longitude to providers table';
    RAISE NOTICE '✓ Added latitude and longitude to pending_requests table';
    RAISE NOTICE '✓ Created distance calculation function';
    RAISE NOTICE '✓ Created location-based search function';
    RAISE NOTICE '✓ Added performance indexes for location queries';
    RAISE NOTICE '✓ Added documentation comments';
    RAISE NOTICE '=====================================================';
END $$; 