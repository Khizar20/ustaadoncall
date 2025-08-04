-- Manual fix for provider rating and review count
-- Based on the actual reviews data

-- First, let's see the current state
SELECT 
    'Current Provider Data' as info,
    p.id,
    p.name,
    p.rating,
    p.reviews_count
FROM providers p 
WHERE p.id = '910ed704-65c3-4177-941a-a87facba779d';

-- Check actual reviews for this provider
SELECT 
    'Actual Reviews' as info,
    COUNT(*) as total_reviews,
    AVG(rating) as avg_rating
FROM reviews 
WHERE provider_id = '910ed704-65c3-4177-941a-a87facba779d';

-- Now manually update the provider
UPDATE providers 
SET 
    rating = (
        SELECT COALESCE(AVG(rating), 0)
        FROM reviews 
        WHERE provider_id = '910ed704-65c3-4177-941a-a87facba779d'
    ),
    reviews_count = (
        SELECT COUNT(*)
        FROM reviews 
        WHERE provider_id = '910ed704-65c3-4177-941a-a87facba779d'
    )
WHERE id = '910ed704-65c3-4177-941a-a87facba779d';

-- Check the updated state
SELECT 
    'Updated Provider Data' as info,
    p.id,
    p.name,
    p.rating,
    p.reviews_count
FROM providers p 
WHERE p.id = '910ed704-65c3-4177-941a-a87facba779d'; 