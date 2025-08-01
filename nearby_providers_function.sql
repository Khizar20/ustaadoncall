-- Function to get nearby providers for urgent request notifications
CREATE OR REPLACE FUNCTION get_nearby_providers(
  user_lat DOUBLE PRECISION,
  user_lon DOUBLE PRECISION,
  radius_km DOUBLE PRECISION DEFAULT 10,
  service_category_filter TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  service_category TEXT,
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
    p.latitude,
    p.longitude,
    calculate_distance(user_lat, user_lon, p.latitude, p.longitude) as distance
  FROM providers p
  WHERE 
    p.latitude IS NOT NULL 
    AND p.longitude IS NOT NULL
    AND calculate_distance(user_lat, user_lon, p.latitude, p.longitude) <= radius_km
    AND (service_category_filter IS NULL OR p.service_category = service_category_filter)
    AND p.is_verified = true
    AND p.is_active = true
  ORDER BY distance ASC;
END;
$$ LANGUAGE plpgsql; 