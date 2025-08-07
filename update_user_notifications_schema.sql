-- Update user_notifications table to support booking notifications
-- This extends the existing user_notifications table to handle both live request and booking notifications

-- First, make request_id optional for booking notifications
ALTER TABLE user_notifications ALTER COLUMN request_id DROP NOT NULL;

-- Update the notification_type constraint to include booking types
ALTER TABLE user_notifications DROP CONSTRAINT IF EXISTS user_notifications_notification_type_check;
ALTER TABLE user_notifications ADD CONSTRAINT user_notifications_notification_type_check 
  CHECK (notification_type IN (
    -- Live request notification types
    'new_bid', 'bid_accepted', 'request_expired', 'provider_assigned',
    -- Booking notification types  
    'booking_confirmed', 'booking_rejected', 'booking_completed', 'booking_cancelled'
  ));

-- Add optional booking_id column for booking notifications
ALTER TABLE user_notifications ADD COLUMN IF NOT EXISTS booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE;

-- Add index for booking_id
CREATE INDEX IF NOT EXISTS idx_user_notifications_booking_id ON user_notifications(booking_id);

-- Update RLS policies to handle booking notifications
CREATE POLICY IF NOT EXISTS "Users can view their booking notifications" ON user_notifications
  FOR SELECT USING (auth.uid() = user_id AND booking_id IS NOT NULL);

-- Function to create booking notification in user_notifications table
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