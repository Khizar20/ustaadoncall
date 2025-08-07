-- Run this migration to update the user_notifications table for booking notifications
-- Execute this in your Supabase SQL editor

-- Step 1: Make request_id optional for booking notifications
DO $$ 
BEGIN
    -- Check if request_id column exists and is NOT NULL
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'user_notifications' 
        AND column_name = 'request_id' 
        AND is_nullable = 'NO'
    ) THEN
        ALTER TABLE user_notifications ALTER COLUMN request_id DROP NOT NULL;
        RAISE NOTICE 'Made request_id nullable in user_notifications table';
    ELSE
        RAISE NOTICE 'request_id is already nullable or does not exist';
    END IF;
END $$;

-- Step 2: Add booking_id column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'user_notifications' 
        AND column_name = 'booking_id'
    ) THEN
        ALTER TABLE user_notifications ADD COLUMN booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE;
        RAISE NOTICE 'Added booking_id column to user_notifications table';
    ELSE
        RAISE NOTICE 'booking_id column already exists';
    END IF;
END $$;

-- Step 3: Update the notification_type constraint
DO $$ 
BEGIN
    -- Drop existing constraint if it exists
    IF EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE table_name = 'user_notifications' 
        AND constraint_name = 'user_notifications_notification_type_check'
    ) THEN
        ALTER TABLE user_notifications DROP CONSTRAINT user_notifications_notification_type_check;
        RAISE NOTICE 'Dropped old notification_type constraint';
    END IF;
    
    -- Add new constraint with booking notification types
    ALTER TABLE user_notifications ADD CONSTRAINT user_notifications_notification_type_check 
      CHECK (notification_type IN (
        -- Live request notification types
        'new_bid', 'bid_accepted', 'request_expired', 'provider_assigned',
        -- Booking notification types  
        'booking_confirmed', 'booking_rejected', 'booking_completed', 'booking_cancelled'
      ));
    RAISE NOTICE 'Added new notification_type constraint with booking types';
END $$;

-- Step 4: Create index for booking_id
CREATE INDEX IF NOT EXISTS idx_user_notifications_booking_id ON user_notifications(booking_id);

-- Step 5: Create function for booking notifications
CREATE OR REPLACE FUNCTION create_user_booking_notification(
  p_user_id UUID,
  p_booking_id UUID,
  p_notification_type TEXT,
  p_title TEXT,
  p_message TEXT
) RETURNS UUID AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO user_notifications (
    user_id,
    booking_id,
    notification_type,
    title,
    message
  ) VALUES (
    p_user_id,
    p_booking_id,
    p_notification_type,
    p_title,
    p_message
  ) RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql;

-- Step 6: Update RLS policy for booking notifications
DO $$ 
BEGIN
    -- Check if policy already exists
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_policies 
        WHERE tablename = 'user_notifications' 
        AND policyname = 'Users can view their booking notifications'
    ) THEN
        CREATE POLICY "Users can view their booking notifications" ON user_notifications
          FOR SELECT USING (auth.uid() = user_id AND booking_id IS NOT NULL);
        RAISE NOTICE 'Created RLS policy for booking notifications';
    ELSE
        RAISE NOTICE 'RLS policy for booking notifications already exists';
    END IF;
END $$;

-- Verification: Show current schema
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'user_notifications'
ORDER BY ordinal_position;