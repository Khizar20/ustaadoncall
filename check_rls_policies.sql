-- Check and fix RLS policies for reviews table
-- This script will ensure the trigger can work properly

-- Check current RLS status
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'reviews';

-- Check current policies on reviews table
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'reviews';

-- Temporarily disable RLS to test if that's the issue
ALTER TABLE reviews DISABLE ROW LEVEL SECURITY;

-- Test the trigger now
UPDATE reviews SET comment = comment WHERE id = (SELECT id FROM reviews LIMIT 1);

-- Re-enable RLS
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Check if the provider was updated
SELECT 
    p.id,
    p.name,
    p.rating,
    p.reviews_count
FROM providers p 
WHERE p.id = '910ed704-65c3-4177-941a-a87facba779d'; 