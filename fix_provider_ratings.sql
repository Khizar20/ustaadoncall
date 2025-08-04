-- Fix Provider Ratings and Review Counts
-- This script will manually update all provider ratings and review counts

-- Function to update a specific provider's rating and review count
CREATE OR REPLACE FUNCTION update_specific_provider_rating(p_provider_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE providers 
    SET 
        rating = (
            SELECT COALESCE(AVG(rating), 0)
            FROM reviews 
            WHERE provider_id = p_provider_id
        ),
        reviews_count = (
            SELECT COUNT(*)
            FROM reviews 
            WHERE provider_id = p_provider_id
        )
    WHERE id = p_provider_id;
END;
$$ LANGUAGE plpgsql;

-- Function to update all providers' ratings and review counts
CREATE OR REPLACE FUNCTION update_all_provider_ratings()
RETURNS VOID AS $$
DECLARE
    provider_record RECORD;
BEGIN
    FOR provider_record IN SELECT id FROM providers LOOP
        UPDATE providers 
        SET 
            rating = (
                SELECT COALESCE(AVG(rating), 0)
                FROM reviews 
                WHERE provider_id = provider_record.id
            ),
            reviews_count = (
                SELECT COUNT(*)
                FROM reviews 
                WHERE provider_id = provider_record.id
            )
        WHERE id = provider_record.id;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Update all providers' ratings and review counts
SELECT update_all_provider_ratings();

-- Show the results
SELECT 
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