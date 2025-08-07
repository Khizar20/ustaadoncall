-- Create user_favorites table for storing favorite service providers
CREATE TABLE IF NOT EXISTS user_favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, provider_id) -- Prevent duplicate favorites
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_provider_id ON user_favorites(provider_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_created_at ON user_favorites(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can only see their own favorites
CREATE POLICY "Users can view their own favorites" ON user_favorites
    FOR SELECT USING (auth.uid() = user_id);

-- Users can add favorites for themselves
CREATE POLICY "Users can add their own favorites" ON user_favorites
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can remove their own favorites
CREATE POLICY "Users can delete their own favorites" ON user_favorites
    FOR DELETE USING (auth.uid() = user_id);

-- Add password column to users table if it doesn't exist (for password updates)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'password_hash'
    ) THEN
        ALTER TABLE users ADD COLUMN password_hash TEXT;
    END IF;
END $$;

-- Create a function to get user's favorite providers with full provider details
CREATE OR REPLACE FUNCTION get_user_favorite_providers(p_user_id UUID)
RETURNS TABLE (
    id UUID,
    name TEXT,
    service_category TEXT,
    bio TEXT,
    location TEXT,
    rating NUMERIC,
    reviews_count BIGINT,
    profile_image TEXT,
    is_verified BOOLEAN,
    experience TEXT,
    jobs_pricing JSONB,
    favorited_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.name,
        p.service_category,
        p.bio,
        p.location,
        p.rating,
        p.reviews_count,
        p.profile_image,
        p.is_verified,
        p.experience,
        p.jobs_pricing,
        uf.created_at as favorited_at
    FROM user_favorites uf
    JOIN providers p ON uf.provider_id = p.id
    WHERE uf.user_id = p_user_id
    ORDER BY uf.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION get_user_favorite_providers(UUID) TO authenticated;