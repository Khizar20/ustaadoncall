-- Fix RLS policy for providers table to allow authenticated users to read provider data
-- This is needed for the notification system to work

-- First, enable RLS on the providers table if not already enabled
ALTER TABLE providers ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view providers" ON providers;
DROP POLICY IF EXISTS "Providers can view their own data" ON providers;
DROP POLICY IF EXISTS "Authenticated users can read providers" ON providers;

-- Create a policy that allows authenticated users to read provider data
-- This is needed for the notification system to find nearby providers
CREATE POLICY "Authenticated users can read providers" ON providers
    FOR SELECT
    TO authenticated
    USING (true);

-- Create a policy that allows providers to update their own data
CREATE POLICY "Providers can update their own data" ON providers
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Create a policy that allows providers to insert their own data
CREATE POLICY "Providers can insert their own data" ON providers
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Create a policy that allows providers to delete their own data
CREATE POLICY "Providers can delete their own data" ON providers
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- Optional: Create a more restrictive policy if you want to limit what data is visible
-- This would only show basic info needed for notifications
-- CREATE POLICY "Authenticated users can read basic provider info" ON providers
--     FOR SELECT
--     TO authenticated
--     USING (true)
--     WITH CHECK (false); 