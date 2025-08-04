-- Migration script to add reviews table
-- Run this script in your Supabase SQL editor

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_reviews_booking_id ON reviews(booking_id);
CREATE INDEX IF NOT EXISTS idx_reviews_customer_id ON reviews(customer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_provider_id ON reviews(provider_id);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at);

-- Add unique constraint to prevent multiple reviews for the same booking
ALTER TABLE reviews ADD CONSTRAINT unique_booking_review UNIQUE (booking_id);

-- Create a function to update provider rating and reviews count
CREATE OR REPLACE FUNCTION update_provider_rating()
RETURNS TRIGGER AS $$
BEGIN
    -- Update provider's average rating and reviews count
    UPDATE providers 
    SET 
        rating = (
            SELECT COALESCE(AVG(rating), 0)
            FROM reviews 
            WHERE provider_id = NEW.provider_id
        ),
        reviews_count = (
            SELECT COUNT(*)
            FROM reviews 
            WHERE provider_id = NEW.provider_id
        )
    WHERE id = NEW.provider_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update provider rating when review is inserted/updated/deleted
CREATE TRIGGER trigger_update_provider_rating
    AFTER INSERT OR UPDATE OR DELETE ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_provider_rating();

-- Add RLS policies for reviews table
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Policy for users to read their own reviews
CREATE POLICY "Users can read their own reviews" ON reviews
    FOR SELECT USING (auth.uid() = customer_id);

-- Policy for users to insert their own reviews
CREATE POLICY "Users can insert their own reviews" ON reviews
    FOR INSERT WITH CHECK (auth.uid() = customer_id);

-- Policy for users to update their own reviews
CREATE POLICY "Users can update their own reviews" ON reviews
    FOR UPDATE USING (auth.uid() = customer_id);

-- Policy for providers to read reviews about them
CREATE POLICY "Providers can read reviews about them" ON reviews
    FOR SELECT USING (auth.uid() = provider_id);

-- Policy for all users to read reviews (for public display)
CREATE POLICY "Anyone can read reviews" ON reviews
    FOR SELECT USING (true); 