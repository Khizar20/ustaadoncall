-- Fix all providers' ratings and review counts
-- This script will update all providers based on actual review data

-- Show current state of all providers
SELECT 
    'BEFORE FIX' as status,
    p.id,
    p.name,
    p.rating,
    p.reviews_count,
    COUNT(r.id) as actual_reviews_count,
    AVG(r.rating) as actual_avg_rating
FROM providers p
LEFT JOIN reviews r ON p.id = r.provider_id
GROUP BY p.id, p.name, p.rating, p.reviews_count
ORDER BY p.name;

-- Update all providers
UPDATE providers 
SET 
    rating = (
        SELECT COALESCE(AVG(rating), 0)
        FROM reviews 
        WHERE provider_id = providers.id
    ),
    reviews_count = (
        SELECT COUNT(*)
        FROM reviews 
        WHERE provider_id = providers.id
    );

-- Show updated state of all providers
SELECT 
    'AFTER FIX' as status,
    p.id,
    p.name,
    p.rating,
    p.reviews_count,
    COUNT(r.id) as actual_reviews_count,
    AVG(r.rating) as actual_avg_rating
FROM providers p
LEFT JOIN reviews r ON p.id = r.provider_id
GROUP BY p.id, p.name, p.rating, p.reviews_count
ORDER BY p.name; 