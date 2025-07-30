-- Test data script to add sample coordinates to existing providers
-- Run this after the migration script to test the location functionality

-- Sample coordinates for major Pakistani cities
-- You can replace these with actual provider locations

-- Islamabad coordinates
UPDATE providers 
SET latitude = 33.6844, longitude = 73.0479
WHERE latitude IS NULL AND longitude IS NULL AND location IS NOT NULL
LIMIT 2;

-- Lahore coordinates  
UPDATE providers 
SET latitude = 31.5204, longitude = 74.3587
WHERE latitude IS NULL AND longitude IS NULL AND location IS NOT NULL
LIMIT 2;

-- Karachi coordinates
UPDATE providers 
SET latitude = 24.8607, longitude = 67.0011
WHERE latitude IS NULL AND longitude IS NULL AND location IS NOT NULL
LIMIT 2;

-- Rawalpindi coordinates
UPDATE providers 
SET latitude = 33.5651, longitude = 73.0169
WHERE latitude IS NULL AND longitude IS NULL AND location IS NOT NULL
LIMIT 1;

-- Peshawar coordinates
UPDATE providers 
SET latitude = 34.0150, longitude = 71.5249
WHERE latitude IS NULL AND longitude IS NULL AND location IS NOT NULL
LIMIT 1;

-- Faisalabad coordinates
UPDATE providers 
SET latitude = 31.4167, longitude = 73.0892
WHERE latitude IS NULL AND longitude IS NULL AND location IS NOT NULL
LIMIT 1;

-- Multan coordinates
UPDATE providers 
SET latitude = 30.1575, longitude = 71.5249
WHERE latitude IS NULL AND longitude IS NULL AND location IS NOT NULL
LIMIT 1;

-- Quetta coordinates
UPDATE providers 
SET latitude = 30.1798, longitude = 66.9750
WHERE latitude IS NULL AND longitude IS NULL AND location IS NOT NULL
LIMIT 1;

-- Test the distance calculation function
SELECT 
    name,
    location,
    latitude,
    longitude,
    calculate_distance(33.6844, 73.0479, latitude, longitude) as distance_from_islamabad
FROM providers 
WHERE latitude IS NOT NULL AND longitude IS NOT NULL
ORDER BY distance_from_islamabad;

-- Test the radius search function (find providers within 50km of Islamabad)
SELECT * FROM get_providers_within_radius(33.6844, 73.0479, 50.0);

-- Show providers with coordinates
SELECT 
    id,
    name,
    location,
    latitude,
    longitude,
    CASE 
        WHEN latitude IS NOT NULL AND longitude IS NOT NULL 
        THEN 'Has coordinates' 
        ELSE 'No coordinates' 
    END as coordinate_status
FROM providers
ORDER BY created_at DESC;

-- Print summary
DO $$
DECLARE
    total_providers INTEGER;
    providers_with_coords INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_providers FROM providers;
    SELECT COUNT(*) INTO providers_with_coords FROM providers WHERE latitude IS NOT NULL AND longitude IS NOT NULL;
    
    RAISE NOTICE 'Total providers: %', total_providers;
    RAISE NOTICE 'Providers with coordinates: %', providers_with_coords;
    RAISE NOTICE 'Providers without coordinates: %', total_providers - providers_with_coords;
END $$; 