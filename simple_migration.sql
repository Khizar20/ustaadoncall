-- Simple migration script to add location coordinates to providers table
-- Run this script in your Supabase SQL editor

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

-- Add comments to document the new columns
COMMENT ON COLUMN providers.latitude IS 'Provider location latitude coordinate for distance calculations';
COMMENT ON COLUMN providers.longitude IS 'Provider location longitude coordinate for distance calculations';

-- Print success message
DO $$
BEGIN
    RAISE NOTICE 'Migration completed successfully!';
    RAISE NOTICE 'Added latitude and longitude columns to providers table';
    RAISE NOTICE 'Created distance calculation function';
    RAISE NOTICE 'Created location-based search function';
    RAISE NOTICE 'Added performance indexes for location queries';
END $$; 