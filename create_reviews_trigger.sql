-- Create Reviews Trigger and Function
-- This script will create the trigger to automatically update provider ratings

-- First, create the function to update provider rating
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

-- Create the trigger on the reviews table
CREATE TRIGGER trigger_update_provider_rating
    AFTER INSERT OR UPDATE OR DELETE ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_provider_rating();

-- Test the trigger by updating a review (if any exist)
UPDATE reviews SET comment = comment WHERE id = (SELECT id FROM reviews LIMIT 1);

-- Verify the trigger was created
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'trigger_update_provider_rating'; 