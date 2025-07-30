-- Migration script to add location coordinates to providers table
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

-- Add a function to find providers within radius with service category filter
CREATE OR REPLACE FUNCTION get_providers_within_radius_by_category(
    user_lat DOUBLE PRECISION,
    user_lon DOUBLE PRECISION,
    service_category_filter TEXT,
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
        AND p.service_category ILIKE '%' || service_category_filter || '%'
    ORDER BY distance ASC;
END;
$$ LANGUAGE plpgsql;

-- Add a trigger to automatically geocode location when provider is created/updated
CREATE OR REPLACE FUNCTION geocode_provider_location()
RETURNS TRIGGER AS $$
BEGIN
    -- This function can be extended to automatically geocode addresses
    -- For now, it just ensures the location field is properly formatted
    IF NEW.location IS NOT NULL AND (NEW.latitude IS NULL OR NEW.longitude IS NULL) THEN
        -- You can add automatic geocoding logic here if needed
        -- For now, we'll rely on the backend to handle geocoding
        NULL;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic geocoding (optional)
-- CREATE TRIGGER trigger_geocode_provider_location
--     BEFORE INSERT OR UPDATE ON providers
--     FOR EACH ROW
--     EXECUTE FUNCTION geocode_provider_location();

-- Add comments to document the new columns
COMMENT ON COLUMN providers.latitude IS 'Provider location latitude coordinate for distance calculations';
COMMENT ON COLUMN providers.longitude IS 'Provider location longitude coordinate for distance calculations';

-- Update existing providers with sample coordinates (optional - for testing)
-- You can run this to add sample coordinates to existing providers
-- UPDATE providers 
-- SET latitude = 33.6844, longitude = 73.0479  -- Islamabad coordinates
-- WHERE latitude IS NULL AND longitude IS NULL AND location IS NOT NULL
-- LIMIT 5;

-- Create a view for easy provider location queries
CREATE OR REPLACE VIEW providers_with_location AS
SELECT 
    id,
    name,
    service_category,
    bio,
    experience,
    location,
    profile_image,
    is_verified,
    rating,
    reviews_count,
    jobs_pricing,
    created_at,
    latitude,
    longitude,
    CASE 
        WHEN latitude IS NOT NULL AND longitude IS NOT NULL 
        THEN true 
        ELSE false 
    END as has_coordinates
FROM providers
WHERE is_verified = true;

-- Grant necessary permissions (adjust based on your RLS policies)
-- ALTER TABLE providers ENABLE ROW LEVEL SECURITY;

-- Example RLS policy for location-based queries (if needed)
-- CREATE POLICY "Providers are viewable by everyone" ON providers
--     FOR SELECT USING (true);

-- Add a function to update provider coordinates
CREATE OR REPLACE FUNCTION update_provider_coordinates(
    provider_id UUID,
    new_latitude DOUBLE PRECISION,
    new_longitude DOUBLE PRECISION
) RETURNS BOOLEAN AS $$
BEGIN
    UPDATE providers 
    SET 
        latitude = new_latitude,
        longitude = new_longitude
    WHERE id = provider_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Add a function to bulk update coordinates for providers without them
CREATE OR REPLACE FUNCTION bulk_update_provider_coordinates() 
RETURNS INTEGER AS $$
DECLARE
    updated_count INTEGER := 0;
    provider_record RECORD;
BEGIN
    FOR provider_record IN 
        SELECT id, location 
        FROM providers 
        WHERE latitude IS NULL 
        AND longitude IS NULL 
        AND location IS NOT NULL 
        AND location != ''
    LOOP
        -- This is a placeholder for geocoding logic
        -- In practice, you would call a geocoding service here
        -- For now, we'll just mark them as needing geocoding
        UPDATE providers 
        SET location = location || ' (needs geocoding)'
        WHERE id = provider_record.id;
        
        updated_count := updated_count + 1;
    END LOOP;
    
    RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

-- Print success message
DO $$
BEGIN
    RAISE NOTICE 'Migration completed successfully!';
    RAISE NOTICE 'Added latitude and longitude columns to providers table';
    RAISE NOTICE 'Created distance calculation functions';
    RAISE NOTICE 'Created location-based search functions';
    RAISE NOTICE 'Added performance indexes for location queries';
END $$; 