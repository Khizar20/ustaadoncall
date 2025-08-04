-- Fix Reviews Trigger
-- This script will recreate the trigger to ensure it works correctly

-- Drop the existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_update_provider_rating ON reviews;

-- Create a better function to update provider rating
CREATE OR REPLACE FUNCTION update_provider_rating()
RETURNS TRIGGER AS $$
DECLARE
    affected_provider_id UUID;
BEGIN
    -- Determine which provider_id to update
    IF TG_OP = 'DELETE' THEN
        affected_provider_id := OLD.provider_id;
    ELSE
        affected_provider_id := NEW.provider_id;
    END IF;
    
    -- Update provider's average rating and reviews count
    UPDATE providers 
    SET 
        rating = (
            SELECT COALESCE(AVG(rating), 0)
            FROM reviews 
            WHERE provider_id = affected_provider_id
        ),
        reviews_count = (
            SELECT COUNT(*)
            FROM reviews 
            WHERE provider_id = affected_provider_id
        )
    WHERE id = affected_provider_id;
    
    -- Return the appropriate record
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
CREATE TRIGGER trigger_update_provider_rating
    AFTER INSERT OR UPDATE OR DELETE ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_provider_rating();

-- Test the trigger by updating a review
-- This will trigger the update for the provider
UPDATE reviews SET comment = comment WHERE id = (SELECT id FROM reviews LIMIT 1); 