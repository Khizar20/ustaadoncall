-- Check Reviews and Provider Ratings Status
-- This script will show the current state of reviews and provider ratings

-- Check all reviews
SELECT 
    r.id,
    r.booking_id,
    r.customer_id,
    r.provider_id,
    r.rating,
    r.comment,
    r.created_at,
    p.name as provider_name,
    u.name as customer_name
FROM reviews r
JOIN providers p ON r.provider_id = p.id
JOIN auth.users u ON r.customer_id = u.id
ORDER BY r.created_at DESC;

-- Check provider ratings and review counts
SELECT 
    p.id,
    p.name,
    p.rating,
    p.reviews_count,
    COUNT(r.id) as actual_reviews_count,
    AVG(r.rating) as actual_avg_rating,
    CASE 
        WHEN COUNT(r.id) != p.reviews_count THEN 'MISMATCH'
        ELSE 'OK'
    END as review_count_status,
    CASE 
        WHEN ABS(AVG(r.rating) - p.rating) > 0.01 THEN 'MISMATCH'
        ELSE 'OK'
    END as rating_status
FROM providers p
LEFT JOIN reviews r ON p.id = r.provider_id
GROUP BY p.id, p.name, p.rating, p.reviews_count
ORDER BY p.name;

-- Check specific provider (replace with actual provider ID)
-- SELECT 
--     p.id,
--     p.name,
--     p.rating,
--     p.reviews_count,
--     COUNT(r.id) as actual_reviews_count,
--     AVG(r.rating) as actual_avg_rating
-- FROM providers p
-- LEFT JOIN reviews r ON p.id = r.provider_id
-- WHERE p.id = 'YOUR_PROVIDER_ID_HERE'
-- GROUP BY p.id, p.name, p.rating, p.reviews_count; 