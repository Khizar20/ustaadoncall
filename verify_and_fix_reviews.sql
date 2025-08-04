-- Verify and Fix Reviews System
-- This script will verify the trigger is working and fix current data

-- 1. Check if the trigger exists
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'trigger_update_provider_rating';

-- 2. Check current state of providers and reviews
SELECT 
    'Current State' as status,
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

-- 3. Manually update all providers to fix current data
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

-- 4. Check updated state
SELECT 
    'After Manual Fix' as status,
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

-- 5. Test the trigger by updating a review (if any exist)
-- This should trigger the automatic update
UPDATE reviews SET comment = comment WHERE id = (SELECT id FROM reviews LIMIT 1);

-- 6. Check if the trigger worked
SELECT 
    'After Trigger Test' as status,
    p.id,
    p.name,
    p.rating,
    p.reviews_count
FROM providers p
WHERE p.id IN (SELECT DISTINCT provider_id FROM reviews)
ORDER BY p.name; 